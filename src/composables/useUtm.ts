const STORAGE_KEY = "utm_obj";

/**
 * Guarda los query params de la URL. Si la URL no trae ninguno no pisa
 * lo guardado (conserva el ultimo conjunto no vacio).
 */
export function captureUtm(url: string): void {
  const parsedUrl = new URL(url);
  const utmObject: Record<string, string> = {};

  for (const [key, value] of parsedUrl.searchParams) {
    if (value) {
      utmObject[key] = value;
    }
  }
  if (Object.keys(utmObject).length === 0) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(utmObject));
}

export function getStoredUtms(): Record<string, string> | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
