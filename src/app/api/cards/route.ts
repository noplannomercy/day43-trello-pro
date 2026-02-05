import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { cards, lists, boards } from '@/lib/db/schema';
import { requireAuth, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { eq, max } from 'drizzle-orm';
import { z } from 'zod';

const createCardSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  listId: z.string(),
});

// POST /api/cards - Create new card
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = createCardSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const { title, description, listId } = validation.data;

    // Check list exists and user owns the board
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, listId),
      with: {
        board: true,
      },
    });

    if (!list) {
      return errorResponse('List not found', 'NOT_FOUND', 404);
    }

    if (list.board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    // Get max position for the list
    const result = await db
      .select({ maxPos: max(cards.position) })
      .from(cards)
      .where(eq(cards.listId, listId));

    const maxPosition = result[0]?.maxPos ?? -1;
    const newPosition = maxPosition + 1;

    const [newCard] = await db.insert(cards).values({
      title,
      description: description || null,
      listId,
      position: newPosition,
    }).returning();

    // Log activity
    await logActivity(
      list.board.id,
      user.id as string,
      'card_created',
      {
        title: newCard.title,
        listId: newCard.listId,
      },
      newCard.id
    );

    return successResponse(newCard, 201);
  } catch (error) {
    console.error('Error creating card:', error);
    return errorResponse('Failed to create card', 'SERVER_ERROR', 500);
  }
}
