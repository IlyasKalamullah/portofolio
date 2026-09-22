import { prisma } from "./prisma";

export async function getProfile() {
  return (
    (await prisma.profile.findUnique({ where: { id: 1 } })) ??
    (await prisma.profile.create({ data: { id: 1 } }))
  );
}

export async function getPortfolio() {
  const [profile, projects, experiences, education, skills, certificates] = await Promise.all([
    getProfile(),
    prisma.project.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }] }),
    prisma.experience.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    prisma.education.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    prisma.skill.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.certificate.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
  ]);
  return { profile, projects, experiences, education, skills, certificates };
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
