import { db } from './db';
import { activities } from './db/schema';

export type ActivityAction =
  | 'card_created'
  | 'card_updated'
  | 'card_deleted'
  | 'card_moved'
  | 'list_created'
  | 'list_updated'
  | 'list_deleted'
  | 'board_created'
  | 'board_updated'
  | 'label_added'
  | 'label_removed'
  | 'due_date_set'
  | 'due_date_removed'
  | 'member_assigned'
  | 'member_unassigned'
  | 'description_updated';

export interface ActivityDetails {
  [key: string]: any;
}

/**
 * Log an activity to the database
 * @param boardId - The board ID where the activity occurred
 * @param userId - The user who performed the action
 * @param action - The type of action performed
 * @param details - Additional details about the action (stored as JSON)
 * @param cardId - Optional card ID if the activity is card-specific
 */
export async function logActivity(
  boardId: string,
  userId: string,
  action: ActivityAction,
  details?: ActivityDetails,
  cardId?: string
): Promise<void> {
  try {
    await db.insert(activities).values({
      boardId,
      userId,
      action,
      details: details ? JSON.stringify(details) : null,
      cardId: cardId || null,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}

/**
 * Log a card move activity
 */
export async function logCardMove(
  boardId: string,
  cardId: string,
  userId: string,
  fromListId: string,
  toListId: string,
  fromListTitle?: string,
  toListTitle?: string
): Promise<void> {
  await logActivity(
    boardId,
    userId,
    'card_moved',
    {
      fromListId,
      toListId,
      fromListTitle,
      toListTitle,
    },
    cardId
  );
}

/**
 * Log a card update activity
 */
export async function logCardUpdate(
  boardId: string,
  cardId: string,
  userId: string,
  changes: ActivityDetails
): Promise<void> {
  await logActivity(boardId, userId, 'card_updated', changes, cardId);
}

/**
 * Log a due date change activity
 */
export async function logDueDateChange(
  boardId: string,
  cardId: string,
  userId: string,
  oldDate: Date | null,
  newDate: Date | null
): Promise<void> {
  const action = newDate ? 'due_date_set' : 'due_date_removed';
  await logActivity(
    boardId,
    userId,
    action,
    {
      oldDate: oldDate?.toISOString(),
      newDate: newDate?.toISOString(),
    },
    cardId
  );
}

/**
 * Log a label assignment activity
 */
export async function logLabelAssignment(
  boardId: string,
  cardId: string,
  userId: string,
  labelId: string,
  labelName: string,
  labelColor: string,
  assigned: boolean
): Promise<void> {
  const action = assigned ? 'label_added' : 'label_removed';
  await logActivity(
    boardId,
    userId,
    action,
    {
      labelId,
      labelName,
      labelColor,
    },
    cardId
  );
}

/**
 * Log a member assignment activity
 */
export async function logMemberAssignment(
  boardId: string,
  cardId: string,
  userId: string,
  assignedUserId: string,
  assignedUserName: string,
  assigned: boolean
): Promise<void> {
  const action = assigned ? 'member_assigned' : 'member_unassigned';
  await logActivity(
    boardId,
    userId,
    action,
    {
      assignedUserId,
      assignedUserName,
    },
    cardId
  );
}
