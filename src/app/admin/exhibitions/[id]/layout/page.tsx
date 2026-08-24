import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getExhibitionById, getStallsByExhibition } from "@/lib/admin";
import { getAdminSession } from "@/lib/auth";
import LayoutEditor from "@/components/LayoutEditor";

export default async function ExhibitionLayoutPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  const [exhibition, stalls] = await Promise.all([getExhibitionById(id), getStallsByExhibition(id)]);
  if (!exhibition) notFound();

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href={`/admin/exhibitions/${id}/stalls`} className="text-sm font-semibold text-violet-700">Back to stalls</Link>
        <h1 className="mt-3 text-3xl font-bold">Exhibition layout</h1>
        <p className="mt-2 mb-6 text-slate-600">{exhibition.name} · Dragging is represented by editable X/Y coordinates for now.</p>
        <LayoutEditor stalls={stalls.map((stall) => ({ id: stall.id, stallNumber: stall.stallNumber, positionX: stall.positionX, positionY: stall.positionY, status: stall.status }))} />
      </div>
    </main>
  );
}
