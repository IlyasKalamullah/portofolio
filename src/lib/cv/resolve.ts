import "server-only";
import { buildCv, parseOptions, siteOrigin } from "./data";
import { sanitizeCvData } from "./sanitize";

/** Pakai CV hasil edit kanvas (body.data) jika ada; jika tidak, susun dari database. */
export async function resolveCv(body: Record<string, unknown>, req: Request) {
  const opts = parseOptions(body, siteOrigin(req));
  const edited = body.data ? sanitizeCvData(body.data, opts.lang) : null;
  return { opts, data: edited ?? (await buildCv(opts)) };
}
