"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "../shared/DataTable";
import { StageProgress } from "./StageProgress";

const columns: ColumnDef<any, any>[] = [
  {
    accessorKey: "orderCode",
    header: "Mã đơn",
    cell: ({ row }) => (
      <Link
        href={`/orders/${row.original.id}`}
        className="text-[#ffbf00] hover:underline font-medium"
      >
        {row.original.orderCode}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Loại",
    cell: ({ row }) => (
      <span
        className={
          row.original.type === "EXPORT"
            ? "text-emerald-400"
            : "text-blue-400"
        }
      >
        {row.original.type === "EXPORT" ? "Xuất khẩu" : "Nhập khẩu"}
      </span>
    ),
  },
  {
    accessorKey: "productDescription",
    header: "Sản phẩm",
    cell: ({ row }) => (
      <span className="line-clamp-1 max-w-[200px]">
        {row.original.productDescription}
      </span>
    ),
  },
  {
    accessorKey: "pipelineStage",
    header: "Tiến độ",
    cell: ({ row }) => (
      <div className="min-w-[180px]">
        <StageProgress
          type={row.original.type}
          currentStage={row.original.pipelineStage}
          stageDeadline={row.original.stageDeadline}
        />
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const colors: Record<string, string> = {
        ACTIVE: "text-emerald-400",
        ON_HOLD: "text-amber-400",
        COMPLETED: "text-blue-400",
        CANCELLED: "text-red-400",
      };
      return (
        <span className={colors[row.original.status] ?? "text-zinc-400"}>
          {row.original.status}
        </span>
      );
    },
  },
  {
    accessorKey: "_count.documents",
    header: "Chứng từ",
    cell: ({ row }) => (
      <span className="text-zinc-400">
        {row.original._count?.documents ?? 0}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Cập nhật",
    cell: ({ row }) => (
      <span className="text-zinc-500 text-xs">
        {new Date(row.original.updatedAt).toLocaleDateString("vi-VN")}
      </span>
    ),
  },
];

interface Props {
  orders: any[];
}

export function OrderTable({ orders }: Props) {
  return (
    <DataTable
      columns={columns}
      data={orders}
      searchPlaceholder="Tìm mã đơn, sản phẩm..."
    />
  );
}
