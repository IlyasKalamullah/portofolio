import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/data";
import { primaryRole } from "@/lib/text";
import { PageHeader } from "@/components/admin/PageHeader";
import { CvBuilder } from "./CvBuilder";

export const metadata = { title: "Buat CV" };

export default async function CvPage() {
  const [profile, projects, certificates] = await Promise.all([
    getProfile(),
    prisma.project.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }], select: { id: true, title: true, year: true } }),
    prisma.certificate.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }], select: { id: true, title: true, issuer: true } }),
  ]);
  return (
    <>
      <PageHeader title="Buat CV (ATS)" desc="CV disusun otomatis dari data profil, pengalaman, pendidikan, skill, proyek, dan sertifikat." />
      <CvBuilder
        defaultTitle={primaryRole(profile.headline)}
        defaultSummary={profile.bio.replace(/\n\s*\n/g, " ").trim() || profile.tagline}
        projects={projects}
        certificates={certificates}
        resumeUrl={profile.resumeUrl}
        resumeUrlEn={profile.resumeUrlEn}
      />
    </>
  );
}
