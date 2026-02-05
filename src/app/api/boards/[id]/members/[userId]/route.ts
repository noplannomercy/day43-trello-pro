import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { boards, boardMembers, cardMembers, cards, lists } from '@/lib/db/schema';
import {
  requireAuth,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import { eq, and, inArray } from 'drizzle-orm';

// DELETE /api/boards/[id]/members/[userId] - Remove member from board
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { id: boardId, userId: memberUserId } = await params;

    // Verify board exists and user is the owner
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
    });

    if (!board) {
      return notFoundResponse('Board');
    }

    if (board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    // Cannot remove the owner
    if (memberUserId === board.ownerId) {
      return errorResponse('Cannot remove the board owner', 'INVALID_OPERATION', 400);
    }

    // Find the board member
    const member = await db.query.boardMembers.findFirst({
      where: and(
        eq(boardMembers.boardId, boardId),
        eq(boardMembers.userId, memberUserId)
      ),
    });

    if (!member) {
      return notFoundResponse('Board member');
    }

    // Get all cards in this board
    const boardLists = await db.query.lists.findMany({
      where: eq(lists.boardId, boardId),
      columns: { id: true },
    });

    const listIds = boardLists.map(list => list.id);

    if (listIds.length > 0) {
      const boardCards = await db.query.cards.findMany({
        where: inArray(cards.listId, listIds),
        columns: { id: true },
      });

      const cardIds = boardCards.map(card => card.id);

      // Remove user from all cards in this board
      if (cardIds.length > 0) {
        await db
          .delete(cardMembers)
          .where(
            and(
              inArray(cardMembers.cardId, cardIds),
              eq(cardMembers.userId, memberUserId)
            )
          );
      }
    }

    // Remove board member
    await db.delete(boardMembers).where(eq(boardMembers.id, member.id));

    return successResponse({ message: 'Member removed from board successfully' });
  } catch (error) {
    console.error('Error removing board member:', error);
    return errorResponse('Failed to remove board member', 'SERVER_ERROR', 500);
  }
}
