"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Compass, LayoutDashboard, Plus, UserCircle } from "lucide-react";

interface BottomNavProps {
  onAddBook?: () => void;
}

export function BottomNav({ onAddBook }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleAdd() {
    if (onAddBook) {
      onAddBook();
    } else {
      router.push("/");
    }
  }

  const linkClass = (active: boolean) =>
    `flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
      active ? "text-indigo-600" : "text-slate-400"
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200">
      <div className="flex items-center justify-around px-4 h-16 pb-[env(safe-area-inset-bottom)]">
        <Link href="/" className={linkClass(pathname === "/")}>
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Biblioteca</span>
        </Link>

        <Link href="/explore" className={linkClass(pathname === "/explore")}>
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium">Explorar</span>
        </Link>

        <button
          onClick={handleAdd}
          className="-mt-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
          aria-label="Adicionar livro"
        >
          <Plus className="w-6 h-6" />
        </button>

        <Link href="/dashboard" className={linkClass(pathname === "/dashboard")}>
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>

        <Link href="/profile" className={linkClass(pathname === "/profile")}>
          <UserCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}
