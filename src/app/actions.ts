"use server";

import { prisma } from "@/lib/prisma";

export type ContactState = { ok?: boolean; error?: string } | undefined;

export async function sendMessage(_: ContactState, fd: FormData): Promise<ContactState> {
  // Honeypot anti-spam: field tersembunyi harus kosong
  if (String(fd.get("company") ?? "")) return { ok: true };

  const name = String(fd.get("name") ?? "").trim().slice(0, 120);
  const email = String(fd.get("email") ?? "").trim().slice(0, 200);
  const subject = String(fd.get("subject") ?? "").trim().slice(0, 200);
  const message = String(fd.get("message") ?? "").trim().slice(0, 5000);

  if (!name || !email || !message) return { error: "Nama, email, dan pesan wajib diisi." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Format email tidak valid." };

  try {
    await prisma.message.create({ data: { name, email, subject: subject || null, message } });
  } catch {
    return { error: "Gagal mengirim pesan. Coba lagi nanti." };
  }
  return { ok: true };
}
