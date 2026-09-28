const ZEILAB_HOST = "cdn.zeilab.uz";

export const isZeilabMediaUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" && url.hostname === ZEILAB_HOST && url.pathname !== "/";
  } catch {
    return false;
  }
};

export const isSupportedVideoUrl = (value: string) => {
  if (!isZeilabMediaUrl(value)) return false;
  try {
    const pathname = new URL(value.trim()).pathname.toLowerCase();
    return [".mp4", ".m3u8", ".webm", ".mov", ".m4v"].some((extension) =>
      pathname.endsWith(extension)
    );
  } catch {
    return false;
  }
};

export const ZEILAB_MEDIA_HINT = "https://cdn.zeilab.uz/...";