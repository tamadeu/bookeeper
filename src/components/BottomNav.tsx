"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, TrendingUp, Plus, UserCircle } from "lucide-react";

interface BottomNavProps {
  onAddBook?: () => void;
}

export function BottomNav({ onAddBook }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200">
      <div className="flex items-end justify-around px-2 pb-safe pt-2">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 px-5 py-1 rounded-xl transition-colors ${
            pathname === "/" ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Biblioteca</span>
        </Link>

        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 px-5 py-1 rounded-xl transition-colors ${
            pathname === "/dashboard" ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </Link>

        {onAddBook ? (
          <button
            onClick={onAddBook}
            className="-mt-5 bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
            aria-label="Adicionar livro"
          >
            <Plus className="w-6 h-6" />
          </button>
        ) : (
          <div className="px-5 py-1 opacity-0 pointer-events-none">
            <div className="w-5 h-5" />
          </div>
        )}

        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 px-5 py-1 rounded-xl transition-colors ${
            pathname === "/profile" ? "text-indigo-600" : "text-slate-400"
          }`}
        >
          <UserCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </div>
    </nav>
  );
}
