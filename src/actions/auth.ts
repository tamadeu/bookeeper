"use server";

import { randomUUID } from "crypto";
import { hash, compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, deleteSession, getSession } from "@/lib/session";


export type AuthState =
  | { errors?: { email?: string[]; password?: string[] }; message?: string }
  | undefined;

export async function signup(state: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  const errors: { email?: string[]; password?: string[] } = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["E-mail inválido."];
  }
  if (password.length < 8) {
    errors.password = ["A senha deve ter no mínimo 8 caracteres."];
  }

  if (Object.keys(errors).length > 0) return { errors };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return { errors: { email: ["Este e-mail já está cadastrado."] } };
  }

  const passwordHash = await hash(password, 12);
  const id = randomUUID();

  const [user] = await db
    .insert(users)
    .values({ id, email, passwordHash })
    .returning({ id: users.id });

  if (!user) return { message: "Erro ao criar conta. Tente novamente." };

  await createSession(user.id);
  redirect("/");
}

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    return { message: "E-mail ou senha incorretos." };
  }

  if (!user.passwordHash) {
    return { message: "Esta conta usa login pelo Google. Use o botão 'Entrar com Google'." };
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { message: "E-mail ou senha incorretos." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

export type ProfileState =
  | { success?: boolean; errors?: { email?: string[]; currentPassword?: string[]; newPassword?: string[] }; message?: string }
  | undefined;

export async function updateEmail(state: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const email = (formData.get("email") as string | null)?.trim().toLowerCase() ?? "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: ["E-mail inválido."] } };
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing.length > 0 && existing[0].id !== session.userId) {
    return { errors: { email: ["Este e-mail já está em uso."] } };
  }

  await db.update(users).set({ email }).where(eq(users.id, session.userId));
  return { success: true };
}

export async function updatePassword(state: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const currentPassword = (formData.get("currentPassword") as string | null) ?? "";
  const newPassword = (formData.get("newPassword") as string | null) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string | null) ?? "";

  if (newPassword.length < 8) {
    return { errors: { newPassword: ["A nova senha deve ter no mínimo 8 caracteres."] } };
  }
  if (newPassword !== confirmPassword) {
    return { errors: { newPassword: ["As senhas não coincidem."] } };
  }

  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.userId));

  if (!user) return { message: "Usuário não encontrado." };

  // If user already has a password, verify the current one
  if (user.passwordHash) {
    const valid = await compare(currentPassword, user.passwordHash);
    if (!valid) {
      return { errors: { currentPassword: ["Senha atual incorreta."] } };
    }
  }

  const passwordHash = await hash(newPassword, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.id, session.userId));
  return { success: true };
}
