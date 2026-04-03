"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { EXPORT_STAGES, IMPORT_STAGES } from "@/lib/pipeline";

interface Props {
  type: "EXPORT" | "IMPORT";
  data: { pipelineStage: number; _count: number }[];
}

export function PipelineFunnel({ type, data }: Props) {
  const stages = type === "EXPORT" ? EXPORT_STAGES : IMPORT_STAGES;

  const chartData = Object.entries(stages).map(([stage, label]) => {
    const item = data.find((d) => d.pipelineStage === parseInt(stage));
    return {
      stage: `B${stage}`,
      label,
      count: item?._count ?? 0,
    };
  });

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
      <h3 className="text-sm font-medium text-zinc-200 mb-4">
        Pipeline {type === "EXPORT" ? "Xuất khẩu" : "Nhập khẩu"}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" stroke="#555" fontSize={11} />
          <YAxis
            dataKey="stage"
            type="category"
            stroke="#555"
            fontSize={11}
            width={30}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: any, _name: any, props: any) => [
              `${value} đơn`,
              props.payload.label,
            ]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((_entry, index) => (
              <Cell key={index} fill={index % 2 === 0 ? "#ffbf00" : "#cc9900"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
