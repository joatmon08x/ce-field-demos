import { Board } from "@/components/companyticket/board";
import { getActiveSprint, listBacklog, listSprintBoard } from "@/lib/companyticket/tickets";

export const metadata = {
  title: "Board",
};

export default function CompanyTicketBoardPage() {
  const board = listSprintBoard();
  const sprint = getActiveSprint();
  const backlog = listBacklog();
  if (!board || !sprint) {
    return <p className="p-6 text-sm text-muted-foreground">No active sprint.</p>;
  }
  return <Board board={board} backlog={backlog.tickets} />;
}
