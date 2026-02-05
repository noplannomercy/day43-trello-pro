import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { lists, boards } from '@/lib/db/schema';
import { requireAuth, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { eq, max } from 'drizzle-orm';
import { z } from 'zod';

const createListSchema = z.object({
  title: z.string().min(1).max(100),
  boardId: z.string(),
});

// POST /api/lists - Create new list
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = createListSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const { title, boardId } = validation.data;

    // Check board ownership
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
    });

    if (!board) {
      return errorResponse('Board not found', 'NOT_FOUND', 404);
    }

    if (board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    // Get max position for the board
    const result = await db
      .select({ maxPos: max(lists.position) })
      .from(lists)
      .where(eq(lists.boardId, boardId));

    const maxPosition = result[0]?.maxPos ?? -1;
    const newPosition = maxPosition + 1;

    const [newList] = await db.insert(lists).values({
      title,
      boardId,
      position: newPosition,
    }).returning();

    // Log activity
    await logActivity(boardId, user.id as string, 'list_created', {
      listId: newList.id,
      title: newList.title,
      position: newList.position,
    });

    return successResponse(newList, 201);
  } catch (error) {
    console.error('Error creating list:', error);
    return errorResponse('Failed to create list', 'SERVER_ERROR', 500);
  }
}
