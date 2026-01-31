const PARAMS_TO_CAPTURE = [
  "utm_source",
  "utm_medium",
  "utm_term",
  "utm_content",
  "utm_campaign",
  "gclid",
  "wbraid",
  "gbraid",
  "crm_link",
  "adSet",
  "ad",
  "form",
  "gad_campaignid",
  "gad_source",
  "zones",
] as const;

export function captureUtm(url: string): void {
  const parsedUrl = new URL(url);
  const searchParams = parsedUrl.searchParams;
  const utmObject: Record<string, string | null> = {};

  for (const param of PARAMS_TO_CAPTURE) {
    const value = searchParams.get(param);
    if (value) {
      utmObject[param] = value;
    }
  }

  utmObject.campaign = searchParams.get("utm_campaign") ?? null;
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
