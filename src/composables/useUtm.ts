export function captureUtm(url: string): void {
  const parsedUrl = new URL(url);
  const searchParams = parsedUrl.searchParams;
  const utmObject: Record<string, string | null> = {};

  for (const [key, value] of searchParams) {
    if (value) {
      utmObject[key] = value;
    }
  }
  localStorage.setItem("utm_obj", JSON.stringify(utmObject));
}

export function getStoredUtms(): Record<string, string> | null {
  const raw = localStorage.getItem("utm_obj");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
