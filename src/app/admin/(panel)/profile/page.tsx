import { getProfile } from "@/lib/data";
import { profileFields } from "@/lib/resources";
import { saveProfile } from "@/app/admin/actions";
import { EntityForm } from "@/components/admin/EntityForm";
import { PageHeader } from "@/components/admin/PageHeader";

export default async function ProfilePage() {
  const profile = await getProfile();
  return (
    <>
      <PageHeader title="Profil" desc="Data diri, kontak, sosial media, dan statistik yang tampil di halaman utama." />
      <div className="rounded-2xl border border-white/5 bg-ink-800 p-5 sm:p-6">
        <EntityForm fields={profileFields} values={profile as unknown as Record<string, unknown>} action={saveProfile} submitLabel="Simpan profil" />
      </div>
    </>
  );
}
