"use client";

import { useState } from "react";
import { createAdminUser, removeAdminUser, updateAdminRole } from "@/lib/auth-actions";

type Role = "SUPER_ADMIN" | "WORKSPACE_ADMIN" | "TEAM_MEMBER";
type Admin = { id: string; name: string; email: string; role: Role; createdAt: Date };

const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Super admin",
  WORKSPACE_ADMIN: "Workspace admin",
  TEAM_MEMBER: "Team member",
};

export default function AdminTeamManager({ admins, currentAdminId }: { admins: Admin[]; currentAdminId: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function addAdmin(formData: FormData) {
    setBusy("create");
    setMessage("");
    const result = await createAdminUser(String(formData.get("email") || ""), String(formData.get("name") || ""), String(formData.get("password") || ""), String(formData.get("role") || "TEAM_MEMBER") as Role);
    setMessage(result.success ? "Admin access created." : result.error || "Could not create admin access.");
    setBusy(null);
    if (result.success) window.location.reload();
  }

  async function changeRole(adminId: string, role: Role) {
    setBusy(adminId);
    const result = await updateAdminRole(adminId, role);
    setMessage(result.success ? "Role updated." : result.error || "Could not update role.");
    setBusy(null);
    if (result.success) window.location.reload();
  }

  async function remove(adminId: string) {
    if (!window.confirm("Remove this admin's access?")) return;
    setBusy(adminId);
    const result = await removeAdminUser(adminId);
    setMessage(result.success ? "Admin access removed." : result.error || "Could not remove access.");
    setBusy(null);
    if (result.success) window.location.reload();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
      <form action={addAdmin} className="rounded-[1.75rem] bg-[#0a2348] p-7 text-white shadow-xl shadow-[#0a2348]/15">
        <p className="eyebrow text-[#76aef2]">Grant access</p>
        <h2 className="mt-3 text-2xl font-bold">Invite a teammate</h2>
        <div className="mt-6 space-y-4">
          <input name="name" required placeholder="Full name" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-[#76aef2]" />
          <input name="email" required type="email" placeholder="name@company.com" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-[#76aef2]" />
          <input name="password" required minLength={8} type="password" placeholder="Temporary password" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/45 focus:border-[#76aef2]" />
          <select name="role" defaultValue="TEAM_MEMBER" className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#76aef2]"><option className="text-[#0a2348]" value="TEAM_MEMBER">Team member</option><option className="text-[#0a2348]" value="WORKSPACE_ADMIN">Workspace admin</option><option className="text-[#0a2348]" value="SUPER_ADMIN">Super admin</option></select>
          <button disabled={busy === "create"} className="w-full rounded-xl bg-[#0867d9] px-4 py-3 font-bold transition hover:bg-[#2d83ed] disabled:opacity-60">{busy === "create" ? "Creating..." : "Grant access"}</button>
        </div>
        <p className="mt-4 text-xs leading-5 text-white/50">Share the temporary password securely and ask the teammate to change it after signing in.</p>
      </form>

      <section className="rounded-[1.75rem] border border-[#0a2348]/10 bg-white p-7 shadow-[0_16px_50px_rgba(10,35,72,.07)]">
        <div className="flex items-end justify-between gap-4"><div><p className="eyebrow text-[#0867d9]">People with access</p><h2 className="mt-3 text-2xl font-bold">Admin team</h2></div><span className="rounded-full bg-[#eaf3ff] px-3 py-1 text-xs font-bold text-[#0a2348]">{admins.length} members</span></div>
        <div className="mt-6 divide-y divide-[#0a2348]/10">
          {admins.map((admin) => <div key={admin.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div><p className="font-bold">{admin.name} {admin.id === currentAdminId && <span className="text-xs font-normal text-[#0867d9]">(you)</span>}</p><p className="text-sm text-[#0a2348]/55">{admin.email}</p></div><div className="flex items-center gap-2"><select value={admin.role} disabled={busy === admin.id || admin.id === currentAdminId} onChange={(event) => changeRole(admin.id, event.target.value as Role)} className="rounded-full border border-[#0a2348]/15 bg-[#f5f9ff] px-3 py-2 text-xs font-bold outline-none"><option value="SUPER_ADMIN">{roleLabels.SUPER_ADMIN}</option><option value="WORKSPACE_ADMIN">{roleLabels.WORKSPACE_ADMIN}</option><option value="TEAM_MEMBER">{roleLabels.TEAM_MEMBER}</option></select>{admin.id !== currentAdminId && <button onClick={() => remove(admin.id)} disabled={busy === admin.id} className="rounded-full px-3 py-2 text-xs font-bold text-[#0867d9] hover:bg-[#eaf3ff]">Remove</button>}</div></div>)}
        </div>
        {message && <p className="mt-5 rounded-xl bg-[#eaf3ff] px-4 py-3 text-sm font-semibold text-[#0a2348]/70">{message}</p>}
      </section>
    </div>
  );
}
