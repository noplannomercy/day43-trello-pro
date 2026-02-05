import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { boards } from '@/lib/db/schema';
import { requireAuth, successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const createBoardSchema = z.object({
  title: z.string().min(1).max(100),
  background: z.string().optional(),
});

// GET /api/boards - List all boards for current user
export async function GET() {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const userBoards = await db.query.boards.findMany({
      where: eq(boards.ownerId, user.id as string),
      orderBy: [desc(boards.updatedAt)],
      with: {
        lists: {
          with: {
            cards: true,
          },
        },
      },
    });

    // Add card count to each board
    const boardsWithCount = userBoards.map(board => ({
      ...board,
      cardCount: board.lists.reduce((count, list) => count + list.cards.length, 0),
    }));

    return successResponse(boardsWithCount);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return errorResponse('Failed to fetch boards', 'SERVER_ERROR', 500);
  }
}

// POST /api/boards - Create new board
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = createBoardSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const { title, background } = validation.data;

    const [newBoard] = await db.insert(boards).values({
      title,
      background: background || null,
      ownerId: user.id as string,
    }).returning();

    // Log activity
    await logActivity(newBoard.id, user.id as string, 'board_created', {
      title: newBoard.title,
      background: newBoard.background,
    });

    return successResponse(newBoard, 201);
  } catch (error) {
    console.error('Error creating board:', error);
    return errorResponse('Failed to create board', 'SERVER_ERROR', 500);
  }
}
