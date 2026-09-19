export function youtubeEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    const isYoutube = /(^|\.)youtube\.com$/.test(u.hostname) || u.hostname === "youtu.be";
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
    if (!isYoutube || !id) return null;
    const start = parseInt(u.searchParams.get("t") ?? "", 10);
    return `https://www.youtube-nocookie.com/embed/${id}${start > 0 ? `?start=${start}` : ""}`;
  } catch {
    return null;
  }
}
