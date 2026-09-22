import { siGithub, siInstagram, siWhatsapp, siX } from "simple-icons";

function Brand({ path, size = 18 }: { path: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}

export const GithubIcon = (p: { size?: number }) => <Brand path={siGithub.path} {...p} />;
export const InstagramIcon = (p: { size?: number }) => <Brand path={siInstagram.path} {...p} />;
export const XIcon = (p: { size?: number }) => <Brand path={siX.path} {...p} />;
export const WhatsappIcon = (p: { size?: number }) => <Brand path={siWhatsapp.path} {...p} />;
export const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" />
    <text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif" fill="#09090b">in</text>
  </svg>
);
