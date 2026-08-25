/**
 * Stall Map Component
 * Displays stalls in a grid with color-coded status visualization
 */

import type { StallStatus } from "@/lib/domain-types";
import Link from "next/link";

type Stall = {
  id: string;
  stallNumber: string;
  width: unknown;
  length: unknown;
  positionX: number;
  positionY: number;
  status: StallStatus;
};

interface StallMapProps {
  stalls: Stall[];
  userBookedStallId?: string;
  isAuthenticated?: boolean;
}

export default function StallMap({ stalls, userBookedStallId, isAuthenticated }: StallMapProps) {
  // Group stalls by row (sort by positionY first, then positionX)
  const sortedStalls = [...stalls].sort((a, b) => {
    if (a.positionY !== b.positionY) return a.positionY - b.positionY;
    if (a.positionX !== b.positionX) return a.positionX - b.positionX;
    return a.stallNumber.localeCompare(b.stallNumber);
  });

  // Calculate grid dimensions, wide enough to fit every stall even after collision reflow
  const maxX = Math.max(...sortedStalls.map((s) => s.positionX), 0);
  const maxY = Math.max(...sortedStalls.map((s) => s.positionY), 0);
  const cols = Math.max(maxX + 1, 1);
  const rows = Math.max(maxY + 1, Math.ceil(sortedStalls.length / cols), 1);

  // Get color for status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 border-green-300 hover:bg-green-200";
      case "HELD":
        return "bg-yellow-100 border-yellow-300";
      case "BOOKED":
        return "bg-red-100 border-red-300";
      case "BLOCKED":
        return "bg-gray-100 border-gray-300";
      default:
        return "bg-slate-100 border-slate-300";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-green-700";
      case "HELD":
        return "text-yellow-700";
      case "BOOKED":
        return "text-red-700";
      case "BLOCKED":
        return "text-gray-700";
      default:
        return "text-slate-700";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500";
      case "HELD":
        return "bg-yellow-500";
      case "BOOKED":
        return "bg-red-500";
      case "BLOCKED":
        return "bg-gray-500";
      default:
        return "bg-slate-500";
    }
  };

  // Create a 2D array for grid layout
  const grid: (Stall | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));

  // Every stall must render, even when saved positions collide (e.g. default 0,0)
  sortedStalls.forEach((stall) => {
    let targetY = stall.positionY;
    let targetX = stall.positionX;

    if (!grid[targetY] || grid[targetY][targetX]) {
      const nextFree = grid.flatMap((row, y) => row.map((cell, x) => ({ y, x, cell }))).find(({ cell }) => !cell);
      if (nextFree) {
        targetY = nextFree.y;
        targetX = nextFree.x;
      } else {
        grid.push(Array(cols).fill(null));
        targetY = grid.length - 1;
        targetX = 0;
      }
    }

    grid[targetY][targetX] = stall;
  });

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 rounded-2xl bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-500"></div>
          <span className="text-sm text-slate-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-yellow-500"></div>
          <span className="text-sm text-slate-600">On Hold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-500"></div>
          <span className="text-sm text-slate-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gray-500"></div>
          <span className="text-sm text-slate-600">Blocked</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4">
        <div className="inline-block space-y-3" style={{ minWidth: "100%" }}>
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-3">
              {row.map((stall, colIdx) => (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={
                    stall
                      ? `flex h-28 w-28 flex-shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 p-2 text-center transition-colors ${getStatusColor(stall.status)}`
                      : "flex h-28 w-28 flex-shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-2 text-center"
                  }
                >
                  {stall ? (
                    <>
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${getStatusDot(stall.status)}`}></div>
                        <p className={`text-sm font-bold ${getStatusTextColor(stall.status)}`}>
                          {stall.stallNumber}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600">{String(stall.width)}m × {String(stall.length)}m</p>
                      {stall.status === "AVAILABLE" ? (
                        <Link
                          href={isAuthenticated ? `/book/${stall.id}` : `/login?redirect=${encodeURIComponent(`/book/${stall.id}`)}`}
                          className="mt-1 inline-block rounded-lg bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          {isAuthenticated ? "Book" : "Login to book"}
                        </Link>
                      ) : (
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {stall.status === "BOOKED" && userBookedStallId === stall.id ? "Your Booking" : stall.status}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-400">-</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-600 uppercase tracking-wide">Available</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {sortedStalls.filter((s) => s.status === "AVAILABLE").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-600 uppercase tracking-wide">On Hold</p>
          <p className="mt-1 text-2xl font-bold text-yellow-700">
            {sortedStalls.filter((s) => s.status === "HELD").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-600 uppercase tracking-wide">Booked</p>
          <p className="mt-1 text-2xl font-bold text-red-700">
            {sortedStalls.filter((s) => s.status === "BOOKED").length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-600 uppercase tracking-wide">Blocked</p>
          <p className="mt-1 text-2xl font-bold text-gray-700">
            {sortedStalls.filter((s) => s.status === "BLOCKED").length}
          </p>
        </div>
      </div>
    </div>
  );
}
