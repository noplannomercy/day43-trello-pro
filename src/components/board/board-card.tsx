import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Board } from "@/types";
import { cn } from "@/lib/utils";

interface BoardCardProps {
  board: Board & { _count?: { lists: number; cards: number } };
}

export function BoardCard({ board }: BoardCardProps) {
  const backgroundStyle = board.background
    ? { backgroundColor: board.background }
    : { backgroundColor: "#0079bf" };

  return (
    <Link href={`/board/${board.id}`}>
      <Card
        className="overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-lg"
        style={backgroundStyle}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg font-semibold line-clamp-2">
            {board.title}
          </CardTitle>
        </CardHeader>
        {board._count && (
          <CardContent className="pb-4">
            <div className="flex gap-4 text-xs text-white/90">
              <span>{board._count.lists || 0} lists</span>
              <span>{board._count.cards || 0} cards</span>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
