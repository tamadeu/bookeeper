"use client";

import { useEffect, useState } from "react";
import { BookOpen, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true;

    if (standalone) {
      setIsStandalone(true);
      return;
    }

    setIsStandalone(false);

    if (sessionStorage.getItem("pwa-install-dismissed") === "1") {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") {
      setInstallEvent(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  }

  if (isStandalone || dismissed || !installEvent) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 flex items-center gap-3 md:hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-indigo-100 rounded-xl p-2.5 shrink-0">
        <BookOpen className="w-5 h-5 text-indigo-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm">
          Instalar Bookeeper
        </p>
        <p className="text-slate-500 text-xs leading-snug">
          Adicione à tela inicial para acesso rápido
        </p>
      </div>

      <button
        onClick={handleInstall}
        className="bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shrink-0 hover:bg-indigo-700 active:scale-95 transition-all"
      >
        Instalar
      </button>

      <button
        onClick={handleDismiss}
        className="text-slate-400 hover:text-slate-600 shrink-0 -mr-1"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
