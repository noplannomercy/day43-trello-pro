import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { boards, users, boardMembers } from '@/lib/db/schema';
import {
  requireAuth,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// POST /api/boards/[id]/members - Invite member to board
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { id: boardId } = await params;

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

    const body = await request.json();
    const validation = inviteMemberSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map(e => e.message).join(', '),
        'VALIDATION_ERROR',
        400
      );
    }

    const { email } = validation.data;

    // Find user by email
    const invitedUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!invitedUser) {
      return errorResponse(
        'User not found. The user must have an account to be invited.',
        'USER_NOT_FOUND',
        404
      );
    }

    // Check if user is already a member
    const existingMember = await db.query.boardMembers.findFirst({
      where: and(
        eq(boardMembers.boardId, boardId),
        eq(boardMembers.userId, invitedUser.id)
      ),
    });

    if (existingMember) {
      return errorResponse('User is already a member of this board', 'CONFLICT', 409);
    }

    // Add user as board member
    const [newMember] = await db
      .insert(boardMembers)
      .values({
        boardId,
        userId: invitedUser.id,
        role: 'member',
      })
      .returning();

    // Fetch the complete member data with user info
    const memberWithUser = await db.query.boardMembers.findFirst({
      where: eq(boardMembers.id, newMember.id),
      with: {
        user: true,
      },
    });

    return successResponse(memberWithUser, 201);
  } catch (error) {
    console.error('Error inviting member:', error);
    return errorResponse('Failed to invite member', 'SERVER_ERROR', 500);
  }
}

// GET /api/boards/[id]/members - List board members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const { id: boardId } = await params;

    // Verify board exists and user has access
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
    });

    if (!board) {
      return notFoundResponse('Board');
    }

    if (board.ownerId !== user.id) {
      return forbiddenResponse();
    }

    // Fetch all board members
    const members = await db.query.boardMembers.findMany({
      where: eq(boardMembers.boardId, boardId),
      with: {
        user: true,
      },
      orderBy: (boardMembers, { asc }) => [asc(boardMembers.joinedAt)],
    });

    return successResponse(members);
  } catch (error) {
    console.error('Error fetching board members:', error);
    return errorResponse('Failed to fetch board members', 'SERVER_ERROR', 500);
  }
}
