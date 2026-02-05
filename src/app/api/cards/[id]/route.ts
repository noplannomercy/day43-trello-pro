import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { cards, lists } from '@/lib/db/schema';
import {
  requireAuth,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import { logActivity, logCardMove, logDueDateChange } from '@/lib/activity';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateCardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  listId: z.string().optional(),
  position: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

// GET /api/cards/[id] - Get card details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const card = await db.query.cards.findFirst({
      where: eq(cards.id, id),
      with: {
        list: {
          with: {
            board: true,
          },
        },
        cardLabels: {
          with: {
            label: true,
          },
        },
        cardMembers: {
          with: {
            user: true,
          },
        },
        activities: {
          orderBy: (activities, { desc }) => [desc(activities.createdAt)],
          with: {
            user: true,
          },
        },
      },
    });

    if (!card) {
      return notFoundResponse('Card');
    }

    if (card.list.board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    return successResponse(card);
  } catch (error) {
    console.error('Error fetching card:', error);
    return errorResponse('Failed to fetch card', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/cards/[id] - Update card
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const card = await db.query.cards.findFirst({
      where: eq(cards.id, id),
      with: {
        list: {
          with: {
            board: true,
          },
        },
      },
    });

    if (!card) {
      return notFoundResponse('Card');
    }

    if (card.list.board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validation = updateCardSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const updateData: any = {
      ...validation.data,
      updatedAt: new Date(),
    };

    // Convert dueDate string to Date if provided
    if (validation.data.dueDate !== undefined) {
      updateData.dueDate = validation.data.dueDate ? new Date(validation.data.dueDate) : null;
    }

    // If moving to a different list, verify the list exists and belongs to the same board
    if (validation.data.listId && validation.data.listId !== card.listId) {
      const targetList = await db.query.lists.findFirst({
        where: eq(lists.id, validation.data.listId),
        with: {
          board: true,
        },
      });

      if (!targetList) {
        return errorResponse('Target list not found', 'NOT_FOUND', 404);
      }

      if (targetList.board.ownerId !== user.id) {
        return forbiddenResponse();
      }
    }

    const [updatedCard] = await db
      .update(cards)
      .set(updateData)
      .where(eq(cards.id, id))
      .returning();

    // Log activities
    const boardId = card.list.board.id;

    // Log card move if listId changed
    if (validation.data.listId && validation.data.listId !== card.listId) {
      const targetList = await db.query.lists.findFirst({
        where: eq(lists.id, validation.data.listId),
      });
      await logCardMove(
        boardId,
        id,
        user.id as string,
        card.listId,
        validation.data.listId,
        card.list.title,
        targetList?.title
      );
    }

    // Log due date change if dueDate changed
    if (validation.data.dueDate !== undefined) {
      const oldDate = card.dueDate;
      const newDate = updateData.dueDate;
      if (oldDate?.getTime() !== newDate?.getTime()) {
        await logDueDateChange(boardId, id, user.id as string, oldDate, newDate);
      }
    }

    // Log description update if description changed
    if (validation.data.description !== undefined && validation.data.description !== card.description) {
      await logActivity(boardId, user.id as string, 'description_updated', {}, id);
    }

    // Log general card update for other changes
    if (validation.data.title || validation.data.position !== undefined) {
      const changes: any = {};
      if (validation.data.title) changes.title = validation.data.title;
      if (validation.data.position !== undefined) changes.position = validation.data.position;

      if (Object.keys(changes).length > 0) {
        await logActivity(boardId, user.id as string, 'card_updated', changes, id);
      }
    }

    return successResponse(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    return errorResponse('Failed to update card', 'SERVER_ERROR', 500);
  }
}

// DELETE /api/cards/[id] - Delete card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const card = await db.query.cards.findFirst({
      where: eq(cards.id, id),
      with: {
        list: {
          with: {
            board: true,
          },
        },
      },
    });

    if (!card) {
      return notFoundResponse('Card');
    }

    if (card.list.board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    // Log activity before deletion
    await logActivity(
      card.list.board.id,
      user.id as string,
      'card_deleted',
      {
        title: card.title,
        listId: card.listId,
      },
      id
    );

    await db.delete(cards).where(eq(cards.id, id));

    return successResponse({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    return errorResponse('Failed to delete card', 'SERVER_ERROR', 500);
  }
}
