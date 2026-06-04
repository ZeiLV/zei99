// Universal hybrid video source resolver.
// Decides whether a given admin input should be played by our custom HTML5
// player (direct file/HLS) or rendered inside an iframe (embed/3rd-party).

export type ResolvedSource =
  | { kind: "video"; src: string }
  | { kind: "iframe"; src: string }
  | { kind: "empty" };

const DIRECT_EXT = /\.(mp4|m3u8|webm|mkv|mov|m4v|ogv)(\?|#|$)/i;

const IFRAME_HOSTS = [
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "doodstream.com",
  "dood.",
  "vidoza.net",
  "streamtape.com",
  "streamtape.",
  "filemoon",
  "mixdrop",
  "ok.ru",
  "rutube",
  "dailymotion.com",
  "t.me",
  "telegram.me",
];

const extractIframeSrc = (raw: string): string | null => {
  const m = raw.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  return m ? m[1] : null;
};

const normalizeGoogleDrive = (url: string): ResolvedSource | null => {
  try {
    const u = new URL(url);
    if (!/(^|\.)drive\.google\.com$/i.test(u.hostname)) return null;

    // /file/d/<id>/view  or /file/d/<id>/preview
    const m = u.pathname.match(/\/file\/d\/([^/]+)/);
    const id = m?.[1] ?? u.searchParams.get("id");
    if (!id) return { kind: "iframe", src: url };

    // direct-download variant requested by admin? -> try as <video>
    if (/uc\b/.test(u.pathname) && (u.searchParams.get("export") === "download" || u.searchParams.get("export") === "view")) {
      return { kind: "video", src: `https://drive.google.com/uc?export=download&id=${id}` };
    }
    // standard share / view link -> safest is iframe preview
    return { kind: "iframe", src: `https://drive.google.com/file/d/${id}/preview` };
  } catch {
    return null;
  }
};

const normalizeYouTube = (url: string): ResolvedSource | null => {
  try {
    const u = new URL(url);
    if (/youtu\.be$/i.test(u.hostname)) {
      const id = u.pathname.replace(/^\//, "");
      return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }
    if (/(^|\.)youtube\.com$/i.test(u.hostname)) {
      if (u.pathname.startsWith("/embed/")) return { kind: "iframe", src: url };
      const id = u.searchParams.get("v");
      if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }
  } catch {}
  return null;
};

export const resolveSource = (input?: string | null): ResolvedSource => {
  const raw = (input ?? "").trim();
  if (!raw) return { kind: "empty" };

  // 1. Full <iframe ...> code pasted in
  const iframeSrc = extractIframeSrc(raw);
  if (iframeSrc) return { kind: "iframe", src: iframeSrc };

  // 2. Not a URL? bail out.
  if (!/^https?:\/\//i.test(raw)) return { kind: "video", src: raw };

  // 3. Google Drive special-case
  const gd = normalizeGoogleDrive(raw);
  if (gd) return gd;

  // 4. YouTube special-case
  const yt = normalizeYouTube(raw);
  if (yt) return yt;

  // 5. Direct media extension wins (mp4/m3u8/...)
  if (DIRECT_EXT.test(raw)) return { kind: "video", src: raw };

  // 6. Known iframe hosts
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (IFRAME_HOSTS.some((h) => host.includes(h))) return { kind: "iframe", src: raw };
  } catch {}

  // 7. Default: treat as direct video URL (Supabase storage, CDN, etc.)
  return { kind: "video", src: raw };
};
