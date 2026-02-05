// Label colors configuration
export const LABEL_COLORS = [
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'Gray', value: 'gray', class: 'bg-gray-500' },
  { name: 'Brown', value: 'brown', class: 'bg-amber-700' },
  { name: 'Black', value: 'black', class: 'bg-gray-900' },
] as const;

export type LabelColor = typeof LABEL_COLORS[number]['value'];

// Get label color class by value
export function getLabelColorClass(color: string): string {
  const labelColor = LABEL_COLORS.find(c => c.value === color);
  return labelColor?.class || 'bg-gray-500';
}
