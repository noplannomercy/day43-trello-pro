import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { labels, boards } from '@/lib/db/schema';
import {
  requireAuth,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
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

const createLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(50, 'Label name must be at most 50 characters'),
  color: z.enum(VALID_COLORS, {
    message: 'Invalid color. Must be one of: ' + VALID_COLORS.join(', '),
  }),
  boardId: z.string().min(1, 'Board ID is required'),
});

// GET /api/labels?boardId=xxx - List labels for a board
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('boardId');

    if (!boardId) {
      return errorResponse('boardId query parameter is required', 'VALIDATION_ERROR', 400);
    }

    // Verify board exists and user has access
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
    });

    if (!board) {
      return errorResponse('Board not found', 'NOT_FOUND', 404);
    }

    if (board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    // Fetch all labels for the board
    const boardLabels = await db.query.labels.findMany({
      where: eq(labels.boardId, boardId),
      orderBy: (labels, { asc }) => [asc(labels.name)],
    });

    return successResponse(boardLabels);
  } catch (error) {
    console.error('Error fetching labels:', error);
    return errorResponse('Failed to fetch labels', 'SERVER_ERROR', 500);
  }
}

// POST /api/labels - Create a new label
export async function POST(request: NextRequest) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validation = createLabelSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const { name, color, boardId } = validation.data;

    // Verify board exists and user is the owner
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
    });

    if (!board) {
      return errorResponse('Board not found', 'NOT_FOUND', 404);
    }

    if (board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    // Create the label
    const [newLabel] = await db
      .insert(labels)
      .values({
        name,
        color,
        boardId,
      })
      .returning();

    return successResponse(newLabel, 201);
  } catch (error) {
    console.error('Error creating label:', error);
    return errorResponse('Failed to create label', 'SERVER_ERROR', 500);
  }
}
