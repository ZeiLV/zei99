/**
 * Convert any Google Drive share link into a streamable URL
 * suitable for an HTML5 <video> tag.
 */
export function gdriveToStream(url: string): { fileId: string | null; preview: string; direct: string } {
  if (!url) return { fileId: null, preview: "", direct: "" };

  // Patterns: /file/d/<ID>/, ?id=<ID>, /d/<ID>
  let fileId: string | null = null;
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const m3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  fileId = m1?.[1] ?? m2?.[1] ?? m3?.[1] ?? null;

  if (!fileId) return { fileId: null, preview: url, direct: url };

  return {
    fileId,
    preview: `https://drive.google.com/file/d/${fileId}/preview`,
    direct: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}
