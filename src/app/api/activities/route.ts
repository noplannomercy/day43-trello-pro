import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { activities, boards, cards } from '@/lib/db/schema';
import {
  requireAuth,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api-utils';
import { eq } from 'drizzle-orm';

// GET /api/activities?boardId=xxx or ?cardId=xxx - List activities
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');
    const cardId = searchParams.get('cardId');

    if (!boardId && !cardId) {
      return errorResponse(
        'Either boardId or cardId query parameter is required',
        'VALIDATION_ERROR',
        400
      );
    }

    // If boardId is provided, verify board access
    if (boardId) {
      const board = await db.query.boards.findFirst({
        where: eq(boards.id, boardId),
      });

      if (!board) {
        return errorResponse('Board not found', 'NOT_FOUND', 404);
      }

      if (board.ownerId !== user.id) {
        return forbiddenResponse();
      }

      // Fetch all activities for the board
      const boardActivities = await db.query.activities.findMany({
        where: eq(activities.boardId, boardId),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          card: {
            columns: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: (activities, { desc }) => [desc(activities.createdAt)],
        limit: 100, // Limit to last 100 activities
      });

      return successResponse(boardActivities);
    }

    // If cardId is provided, verify card access
    if (cardId) {
      const card = await db.query.cards.findFirst({
        where: eq(cards.id, cardId),
        with: {
          list: {
            with: {
              board: true,
            },
          },
        },
      });

      if (!card) {
        return errorResponse('Card not found', 'NOT_FOUND', 404);
      }

      if (card.list.board.ownerId !== user.id) {
        return forbiddenResponse();
      }

      // Fetch all activities for the card
      const cardActivities = await db.query.activities.findMany({
        where: eq(activities.cardId, cardId),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: (activities, { desc }) => [desc(activities.createdAt)],
        limit: 50, // Limit to last 50 activities for a card
      });

      return successResponse(cardActivities);
    }

    return errorResponse('Invalid request', 'VALIDATION_ERROR', 400);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return errorResponse('Failed to fetch activities', 'SERVER_ERROR', 500);
  }
}
