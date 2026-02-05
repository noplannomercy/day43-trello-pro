import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { labels } from '@/lib/db/schema';
import {
  requireAuth,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const VALID_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'gray',
  'brown',
  'black',
] as const;

const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.enum(VALID_COLORS).optional(),
});

// PATCH /api/labels/[id] - Update label
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
    const label = await db.query.labels.findFirst({
      where: eq(labels.id, id),
      with: {
        board: true,
      },
    });

    if (!label) {
      return notFoundResponse('Label');
    }

    if (label.board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validation = updateLabelSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    // Update the label
    const [updatedLabel] = await db
      .update(labels)
      .set(validation.data)
      .where(eq(labels.id, id))
      .returning();

    return successResponse(updatedLabel);
  } catch (error) {
    console.error('Error updating label:', error);
    return errorResponse('Failed to update label', 'SERVER_ERROR', 500);
  }
}

// DELETE /api/labels/[id] - Delete label (cascades to cardLabels)
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
    const label = await db.query.labels.findFirst({
      where: eq(labels.id, id),
      with: {
        board: true,
      },
    });

    if (!label) {
      return notFoundResponse('Label');
    }

    if (label.board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    // Delete the label (cascade will remove cardLabels entries)
    await db.delete(labels).where(eq(labels.id, id));

    return successResponse({ message: 'Label deleted successfully' });
  } catch (error) {
    console.error('Error deleting label:', error);
    return errorResponse('Failed to delete label', 'SERVER_ERROR', 500);
  }
}
