import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, LogOut } from "lucide-react";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logout } from "@/actions/auth";
import { ProfileForm } from "@/components/ProfileForm";
import { BottomNav } from "@/components/BottomNav";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user] = await db
    .select({ email: users.email, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.userId));

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h1 className="text-base font-bold text-slate-800">Perfil</h1>
            </div>
          </div>

          {/* Desktop logout */}
          <form action={logout} className="hidden md:block">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-28 md:pb-8">
        <ProfileForm email={user.email} hasPassword={!!user.passwordHash} />

        {/* Mobile logout */}
        <form action={logout} className="md:hidden mt-6">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
