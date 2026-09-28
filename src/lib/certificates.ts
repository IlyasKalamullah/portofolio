export const CERT_TYPES = ["Sertifikasi", "Organisasi & Kegiatan"] as const;
export const ACTIVITY = "Organisasi & Kegiatan";
export const isActivity = (type?: string | null) => type === ACTIVITY;
