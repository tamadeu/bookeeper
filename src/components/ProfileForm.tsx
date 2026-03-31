"use client";

import { useActionState } from "react";
import { updateEmail, updatePassword } from "@/actions/auth";
import { CheckCircle, User, Lock } from "lucide-react";

interface ProfileFormProps {
  email: string;
  hasPassword: boolean;
}

export function ProfileForm({ email, hasPassword }: ProfileFormProps) {
  const [emailState, emailAction, emailPending] = useActionState(updateEmail, undefined);
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePassword, undefined);

  return (
    <div className="space-y-6">
      {/* Email section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-700">Dados da conta</h2>
        </div>

        <form action={emailAction} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-500 mb-1">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={email}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 focus:bg-white transition-colors"
            />
            {emailState?.errors?.email && (
              <p className="mt-1 text-xs text-red-500">{emailState.errors.email[0]}</p>
            )}
          </div>

          {emailState?.success && (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle className="w-3.5 h-3.5" />
              E-mail atualizado com sucesso.
            </div>
          )}
          {emailState?.message && (
            <p className="text-xs text-red-500">{emailState.message}</p>
          )}

          <button
            type="submit"
            disabled={emailPending}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {emailPending ? "Salvando..." : "Salvar e-mail"}
          </button>
        </form>
      </section>

      {/* Password section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-700">
            {hasPassword ? "Alterar senha" : "Definir senha"}
          </h2>
        </div>
        {!hasPassword && (
          <p className="text-xs text-slate-400 mb-4">
            Defina uma senha para entrar sem o Google.
          </p>
        )}
        {hasPassword && <div className="mb-4" />}

        <form action={passwordAction} className="space-y-3">
          {hasPassword && (
            <div>
              <label htmlFor="currentPassword" className="block text-xs font-medium text-slate-500 mb-1">
                Senha atual
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 focus:bg-white transition-colors"
              />
              {passwordState?.errors?.currentPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordState.errors.currentPassword[0]}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="newPassword" className="block text-xs font-medium text-slate-500 mb-1">
              Nova senha
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 focus:bg-white transition-colors"
            />
            {passwordState?.errors?.newPassword && (
              <p className="mt-1 text-xs text-red-500">{passwordState.errors.newPassword[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-500 mb-1">
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 focus:bg-white transition-colors"
            />
          </div>

          {passwordState?.success && (
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle className="w-3.5 h-3.5" />
              Senha atualizada com sucesso.
            </div>
          )}
          {passwordState?.message && (
            <p className="text-xs text-red-500">{passwordState.message}</p>
          )}

          <button
            type="submit"
            disabled={passwordPending}
            className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {passwordPending ? "Salvando..." : hasPassword ? "Alterar senha" : "Definir senha"}
          </button>
        </form>
      </section>
    </div>
  );
}
