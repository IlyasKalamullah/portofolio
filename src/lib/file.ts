/** true jika URL mengarah ke file PDF */
export function isPdf(url?: string | null) {
  return !!url && /\.pdf($|[?#])/i.test(url);
}
