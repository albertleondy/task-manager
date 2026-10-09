import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Calendar, CheckSquare, ArrowRight } from "lucide-react";
import type { Board } from "@/lib/services/board";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card/Card";
import Badge from "@/components/ui/badge/Badge";
import ButtonIcon from "@/components/ui/button/ButtonIcon";
import { formatDate } from "@/lib/utils";

export interface BoardCardProps {
  board: Board;
  onDelete: (board: Board) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, onDelete }) => {
  return (
    <Card className="group relative flex flex-col justify-between hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex-1 min-w-0">
          <Link
            to={`/boards/${board.id}`}
            className="focus:outline-none focus:underline focus:text-indigo-600 block"
          >
            <CardTitle className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 truncate">
              {board.name}
            </CardTitle>
          </Link>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Created {formatDate(board.created_at)}</span>
          </div>
        </div>

        <ButtonIcon
          icon={<Trash2 className="h-4 w-4" />}
          variant="ghost"
          size="sm"
          tooltipText="Delete board"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(board);
          }}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 shrink-0"
          aria-label={`Delete board ${board.name}`}
        />
      </CardHeader>

      <CardFooter className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <Badge
          variant="secondary"
          startIcon={<CheckSquare className="h-3 w-3 text-indigo-500" />}
          className="font-medium"
        >
          {board.task_count} {board.task_count === 1 ? "task" : "tasks"}
        </Badge>

        <Link
          to={`/boards/${board.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          <span>Open Board</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BoardCard;
