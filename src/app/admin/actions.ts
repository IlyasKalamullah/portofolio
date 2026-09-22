"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { createSession, safeEqual, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { getResource, parseForm, profileFields } from "@/lib/resources";
import { slugify } from "@/lib/data";

export type FormState = { error?: string; ok?: string } | undefined;

// ---------- Auth ----------
export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminEmail || !adminPassword) return { error: "ADMIN_EMAIL / ADMIN_PASSWORD belum di-set di environment." };

  const ok = safeEqual(email, adminEmail) && safeEqual(password, adminPassword);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Email atau password salah." };
  }
  const token = await createSession(email);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  const next = String(fd.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- Profil ----------
export async function saveProfile(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  try {
    const data = parseForm(profileFields, fd) as never;
    await prisma.profile.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...(data as object) } });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/", "layout");
  return { ok: "Profil tersimpan." };
}

// ---------- CRUD generik ----------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function delegate(model: string): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any)[model];
}

export async function saveItem(resourceKey: string, id: number | null, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const res = getResource(resourceKey);
  if (!res) return { error: "Resource tidak dikenal." };

  try {
    const data = parseForm(res.fields, fd);
    if (res.model === "project") {
      let slug = slugify(String(data.slug || data.title || ""));
      if (!slug) slug = `project-${Date.now()}`;
      const clash = await prisma.project.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
      if (clash) slug = `${slug}-${Date.now().toString(36)}`;
      data.slug = slug;
    }
    if (res.model === "skill") {
      data.level = Math.max(0, Math.min(100, Number(data.level)));
    }
    if (id) await delegate(res.model).update({ where: { id }, data });
    else await delegate(res.model).create({ data });
  } catch (e) {
    return { error: (e as Error).message };
  }
  revalidatePath("/", "layout");
  redirect(`/admin/${resourceKey}?saved=1`);
}

export async function deleteItem(resourceKey: string, id: number) {
  await requireAdmin();
  const res = getResource(resourceKey);
  if (!res) return;
  await delegate(res.model).delete({ where: { id } });
  revalidatePath("/", "layout");
}

// ---------- Pesan ----------
export async function toggleMessageRead(id: number, read: boolean) {
  await requireAdmin();
  await prisma.message.update({ where: { id }, data: { read } });
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(id: number) {
  await requireAdmin();
  await prisma.message.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}
