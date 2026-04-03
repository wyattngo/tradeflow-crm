import { getMaxStage, getStageLabel } from "@/lib/pipeline";

interface Props {
  type: "EXPORT" | "IMPORT";
  currentStage: number;
  stageDeadline?: Date | string | null;
}

export function StageProgress({ type, currentStage, stageDeadline }: Props) {
  const maxStage = getMaxStage(type);
  const percent = Math.round((currentStage / maxStage) * 100);

  const now = new Date();
  const deadline = stageDeadline ? new Date(stageDeadline) : null;
  const isOverdue = deadline && now > deadline;
  const isWarning =
    deadline &&
    !isOverdue &&
    now > new Date(deadline.getTime() - 24 * 3600 * 1000);

  const barColor = isOverdue
    ? "bg-red-500"
    : isWarning
    ? "bg-amber-400"
    : "bg-[#ffbf00]";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">
          Bước {currentStage}/{maxStage}:{" "}
          <span className="text-white font-medium">
            {getStageLabel(type, currentStage)}
          </span>
        </span>
        <span className={isOverdue ? "text-red-400" : "text-zinc-400"}>
          {percent}%
        </span>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {deadline && (
        <p className={`text-xs ${isOverdue ? "text-red-400" : "text-zinc-500"}`}>
          Hạn: {deadline.toLocaleString("vi-VN")}
          {isOverdue && " — Quá hạn"}
        </p>
      )}
    </div>
  );
}
