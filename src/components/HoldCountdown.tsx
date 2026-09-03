"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { releaseStallHold } from "@/lib/public";

type Props = { stallId: string; heldUntil: string };

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function HoldCountdown({ stallId, heldUntil }: Props) {
  const router = useRouter();
  const [deadline] = useState(() => new Date(heldUntil).getTime());
  const [remainingMs, setRemainingMs] = useState(() => deadline - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const next = deadline - Date.now();
      setRemainingMs(next);
      if (next <= 0) {
        clearInterval(interval);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline, router]);

  // Release the hold if the user navigates away before the timer expires
  useEffect(() => {
    return () => {
      if (deadline - Date.now() > 0) {
        releaseStallHold(stallId).catch(() => undefined);
      }
    };
  }, [stallId, deadline]);

  const expired = remainingMs <= 0;

  return (
    <p className={`mt-3 text-sm font-semibold ${expired ? "text-red-700" : "text-emerald-800"}`}>
      {expired ? "Hold expired" : `Time remaining: ${formatRemaining(remainingMs)}`}
    </p>
  );
}
