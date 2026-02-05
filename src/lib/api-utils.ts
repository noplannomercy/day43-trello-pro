import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session || !session.user) {
    return null;
  }
  return session.user;
}

export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, code = 'ERROR', status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

export function unauthorizedResponse() {
  return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);
}

export function forbiddenResponse() {
  return errorResponse('Forbidden', 'FORBIDDEN', 403);
}

export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 'NOT_FOUND', 404);
}
