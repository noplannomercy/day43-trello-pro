// Due date color calculation
export type DueDateColor = 'green' | 'yellow' | 'red';

export function getDueDateColor(dueDate: Date): DueDateColor {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const hoursLeft = diff / (1000 * 60 * 60);

  if (hoursLeft < 0) return 'red'; // Overdue
  if (hoursLeft < 24) return 'red'; // Less than 24 hours
  if (hoursLeft < 48) return 'yellow'; // 1-2 days
  return 'green'; // More than 2 days
}

export function getDueDateColorClasses(color: DueDateColor): string {
  switch (color) {
    case 'green':
      return 'text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400';
    case 'yellow':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400';
    case 'red':
      return 'text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400';
    default:
      return '';
  }
}
