/** Headline bisa berisi beberapa peran dipisah "|" — contoh: "Full-Stack Developer | UI Enthusiast" */
export function splitRoles(headline: string) {
  const roles = headline.split("|").map((r) => r.trim()).filter(Boolean);
  return roles.length ? roles : [headline];
}
export const primaryRole = (headline: string) => splitRoles(headline)[0];
