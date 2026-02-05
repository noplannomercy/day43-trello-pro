import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { lists, boards } from '@/lib/db/schema';
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

const updateListSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  position: z.number().int().min(0).optional(),
});

// PATCH /api/lists/[id] - Update list
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
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, id),
      with: {
        board: true,
      },
    });

    if (!list) {
      return notFoundResponse('List');
    }

    if (list.board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    const body = await request.json();
    const validation = updateListSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const [updatedList] = await db
      .update(lists)
      .set({
        ...validation.data,
        updatedAt: new Date(),
      })
      .where(eq(lists.id, id))
      .returning();

    // Log activity
    await logActivity(list.board.id, user.id as string, 'list_updated', {
      listId: id,
      changes: validation.data,
    });

    return successResponse(updatedList);
  } catch (error) {
    console.error('Error updating list:', error);
    return errorResponse('Failed to update list', 'SERVER_ERROR', 500);
  }
}

// DELETE /api/lists/[id] - Delete list
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
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, id),
      with: {
        board: true,
      },
    });

    if (!list) {
      return notFoundResponse('List');
    }

    if (list.board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    // Log activity before deletion
    await logActivity(list.board.id, user.id as string, 'list_deleted', {
      listId: id,
      title: list.title,
    });

    await db.delete(lists).where(eq(lists.id, id));

    return successResponse({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    return errorResponse('Failed to delete list', 'SERVER_ERROR', 500);
  }
}
