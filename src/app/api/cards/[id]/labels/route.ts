import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { cards, labels, cardLabels } from '@/lib/db/schema';
import {
  requireAuth,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import { logLabelAssignment } from '@/lib/activity';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const assignLabelSchema = z.object({
  labelId: z.string().min(1, 'Label ID is required'),
});

// POST /api/cards/[id]/labels - Assign label to card
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
    const validation = assignLabelSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const { labelId } = validation.data;

    // Verify label exists and belongs to the same board
    const label = await db.query.labels.findFirst({
      where: eq(labels.id, labelId),
    });

    if (!label) {
      return notFoundResponse('Label');
    }

    if (label.boardId !== card.list.board.id) {
      return errorResponse(
        'Label does not belong to the same board as the card',
        'INVALID_LABEL',
        400
      );
    }

    // Check if the label is already assigned to the card
    const existingAssignment = await db.query.cardLabels.findFirst({
      where: and(eq(cardLabels.cardId, cardId), eq(cardLabels.labelId, labelId)),
    });

    if (existingAssignment) {
      return errorResponse('Label already assigned to this card', 'CONFLICT', 409);
    }

    // Assign the label to the card
    const [newCardLabel] = await db
      .insert(cardLabels)
      .values({
        cardId,
        labelId,
      })
      .returning();

    // Fetch the complete cardLabel with label details
    const cardLabelWithLabel = await db.query.cardLabels.findFirst({
      where: eq(cardLabels.id, newCardLabel.id),
      with: {
        label: true,
      },
    });

    // Log activity
    if (cardLabelWithLabel) {
      await logLabelAssignment(
        card.list.board.id,
        cardId,
        user.id as string,
        labelId,
        cardLabelWithLabel.label.name,
        cardLabelWithLabel.label.color,
        true
      );
    }

    return successResponse(cardLabelWithLabel, 201);
  } catch (error) {
    console.error('Error assigning label to card:', error);
    return errorResponse('Failed to assign label to card', 'SERVER_ERROR', 500);
  }
}

// DELETE /api/cards/[id]/labels?labelId=xxx - Remove label from card
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
    const labelId = searchParams.get('labelId');

    if (!labelId) {
      return errorResponse('labelId query parameter is required', 'VALIDATION_ERROR', 400);
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

    // Find and delete the cardLabel assignment
    const cardLabel = await db.query.cardLabels.findFirst({
      where: and(eq(cardLabels.cardId, cardId), eq(cardLabels.labelId, labelId)),
    });

    if (!cardLabel) {
      return notFoundResponse('Label assignment');
    }

    // Get label details for activity logging
    const labelDetails = await db.query.labels.findFirst({
      where: eq(labels.id, labelId),
    });

    await db.delete(cardLabels).where(eq(cardLabels.id, cardLabel.id));

    // Log activity
    if (labelDetails) {
      await logLabelAssignment(
        card.list.board.id,
        cardId,
        user.id as string,
        labelId,
        labelDetails.name,
        labelDetails.color,
        false
      );
    }

    return successResponse({ message: 'Label removed from card successfully' });
  } catch (error) {
    console.error('Error removing label from card:', error);
    return errorResponse('Failed to remove label from card', 'SERVER_ERROR', 500);
  }
}
