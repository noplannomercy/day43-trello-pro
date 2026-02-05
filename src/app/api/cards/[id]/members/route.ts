import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { cards, boardMembers, cardMembers } from '@/lib/db/schema';
import {
  requireAuth,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import { logMemberAssignment } from '@/lib/activity';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const assignMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// POST /api/cards/[id]/members - Assign member to card
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { id: cardId } = await params;

    // Verify card exists and user has access
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
      return notFoundResponse('Card');
    }

    if (card.list.board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validation = assignMemberSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const { userId: assignedUserId } = validation.data;

    // Verify user is a board member or the board owner
    const isBoardOwner = card.list.board.ownerId === assignedUserId;

    if (!isBoardOwner) {
      const boardMember = await db.query.boardMembers.findFirst({
        where: and(
          eq(boardMembers.boardId, card.list.board.id),
          eq(boardMembers.userId, assignedUserId)
        ),
      });

      if (!boardMember) {
        return errorResponse(
          'User must be a board member to be assigned to cards',
          'INVALID_USER',
          400
        );
      }
    }

    // Check if user is already assigned to the card
    const existingAssignment = await db.query.cardMembers.findFirst({
      where: and(
        eq(cardMembers.cardId, cardId),
        eq(cardMembers.userId, assignedUserId)
      ),
    });

    if (existingAssignment) {
      return errorResponse('User is already assigned to this card', 'CONFLICT', 409);
    }

    // Assign the user to the card
    const [newCardMember] = await db
      .insert(cardMembers)
      .values({
        cardId,
        userId: assignedUserId,
      })
      .returning();

    // Fetch the complete cardMember with user details
    const cardMemberWithUser = await db.query.cardMembers.findFirst({
      where: eq(cardMembers.id, newCardMember.id),
      with: {
        user: true,
      },
    });

    // Log activity
    if (cardMemberWithUser && cardMemberWithUser.user) {
      await logMemberAssignment(
        card.list.board.id,
        cardId,
        user.id,
        assignedUserId,
        cardMemberWithUser.user.name || 'Unknown',
        true
      );
    }

    return successResponse(cardMemberWithUser, 201);
  } catch (error) {
    console.error('Error assigning member to card:', error);
    return errorResponse('Failed to assign member to card', 'SERVER_ERROR', 500);
  }
}

// DELETE /api/cards/[id]/members?userId=xxx - Remove member from card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { id: cardId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return errorResponse('userId query parameter is required', 'VALIDATION_ERROR', 400);
    }

    // Verify card exists and user has access
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
      return notFoundResponse('Card');
    }

    if (card.list.board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    // Find and delete the cardMember assignment
    const cardMember = await db.query.cardMembers.findFirst({
      where: and(eq(cardMembers.cardId, cardId), eq(cardMembers.userId, userId)),
      with: {
        user: true,
      },
    });

    if (!cardMember) {
      return notFoundResponse('Member assignment');
    }

    await db.delete(cardMembers).where(eq(cardMembers.id, cardMember.id));

    // Log activity
    if (cardMember.user) {
      await logMemberAssignment(
        card.list.board.id,
        cardId,
        user.id,
        userId,
        cardMember.user.name || 'Unknown',
        false
      );
    }

    return successResponse({ message: 'Member removed from card successfully' });
  } catch (error) {
    console.error('Error removing member from card:', error);
    return errorResponse('Failed to remove member from card', 'SERVER_ERROR', 500);
  }
}
