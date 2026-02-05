import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { boards } from '@/lib/db/schema';
import {
  requireAuth,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateBoardSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  background: z.string().optional(),
});

// GET /api/boards/[id] - Get board details with lists and cards
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
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, id),
      with: {
        lists: {
          orderBy: (lists, { asc }) => [asc(lists.position)],
          with: {
            cards: {
              orderBy: (cards, { asc }) => [asc(cards.position)],
              with: {
                cardLabels: {
                  with: {
                    label: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      return notFoundResponse('Board');
    }

    if (board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    return successResponse(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    return errorResponse('Failed to fetch board', 'SERVER_ERROR', 500);
  }
}

// PATCH /api/boards/[id] - Update board
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
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, id),
    });

    if (!board) {
      return notFoundResponse('Board');
    }

    if (board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validation = updateBoardSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const [updatedBoard] = await db
      .update(boards)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(eq(boards.id, id))
      .returning();

    // Log activity
    await logActivity(id, user.id as string, 'board_updated', {
      changes: validation.data,
    });

    return successResponse(updatedBoard);
  } catch (error) {
    console.error('Error updating board:', error);
    return errorResponse('Failed to update board', 'SERVER_ERROR', 500);
  }
}

// DELETE /api/boards/[id] - Delete board
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
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, id),
    });

    if (!board) {
      return notFoundResponse('Board');
    }

    if (board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    await db.delete(boards).where(eq(boards.id, id));

    return successResponse({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Error deleting board:', error);
    return errorResponse('Failed to delete board', 'SERVER_ERROR', 500);
  }
}
