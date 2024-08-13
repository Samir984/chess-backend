export function urlShortning(url: string): string | null {
  try {
    const urlObject = new URL(url);
    const pathname = urlObject.pathname;
    const parts = pathname.split("/");
    return parts.pop() || null;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}

export function addUnderscores(name: string): string {
  return name.trim().replace(/\s+/g, "_");
}
