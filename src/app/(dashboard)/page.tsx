import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { boards } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { BoardCard } from "@/components/board/board-card";
import { CreateBoardModal } from "@/components/board/create-board-modal";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user's boards
  const userBoards = await db
    .select()
    .from(boards)
    .where(eq(boards.ownerId, session.user.id))
    .orderBy(desc(boards.updatedAt));

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Boards</h1>
          <p className="text-muted-foreground mt-1">
            Manage your projects and tasks
          </p>
        </div>
        <CreateBoardModal />
      </div>

      {userBoards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-2">No boards yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Get started by creating your first board to organize your tasks and collaborate with your team.
          </p>
          <CreateBoardModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {userBoards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}
