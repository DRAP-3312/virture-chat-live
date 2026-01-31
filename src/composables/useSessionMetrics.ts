import { ref } from "vue";
import type { ClientLocation } from "../types/socket-events";

interface SessionInfo {
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: string;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
  clientLocation: ClientLocation;
  referrer: string | null;
}

const sessionInfo = ref<SessionInfo>({
  browser: "Unknown",
  browserVersion: "Unknown",
  os: "Unknown",
  deviceType: "Unknown",
  screenWidth: 0,
  screenHeight: 0,
  userAgent: "",
  clientLocation: {
    country: "Unknown",
    city: "Unknown",
    region: "Unknown",
    latitude: null,
    longitude: null,
    timezone: "Unknown",
  },
  referrer: null,
});

function getBrowserAndOSInfo() {
  const ua = navigator.userAgent;

  let browser = "Unknown";
  let browserVersion = "Unknown";
  let os = "Unknown";
  let deviceType = "Unknown";

  if (ua.includes("Windows NT")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua))
    deviceType = "Tablet";
  else if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk|Opera Mini/i.test(
      ua,
    )
  )
    deviceType = "Mobile";
  else deviceType = "Desktop";

  if (ua.includes("Firefox")) {
    browser = "Firefox";
    browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (ua.includes("Opera") || ua.includes("Opr")) {
    browser = "Opera";
    browserVersion = ua.match(/(Opera|Opr)\/([0-9.]+)/)?.[2] || "Unknown";
  } else if (ua.includes("Chrome")) {
    browser = "Chrome";
    browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (ua.includes("Safari")) {
    browser = "Safari";
    browserVersion = ua.match(/Version\/([0-9.]+).*Safari/)?.[1] || "Unknown";
  } else if (ua.includes("Edge")) {
    browser = "Edge";
    browserVersion = ua.match(/Edge\/([0-9.]+)/)?.[1] || "Unknown";
  }

  return {
    browser,
    browserVersion,
    os,
    deviceType,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent: ua,
  };
}

async function fetchIPLocation(): Promise<void> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    sessionInfo.value.clientLocation = {
      country: data.country_name || "Unknown",
      city: data.city || "Unknown",
      region: data.region || "Unknown",
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      timezone: data.timezone || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching IP-based location data:", error);
  }
}

export function useSessionMetrics() {
  async function getLocationInfo(): Promise<void> {
    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          },
        );

        sessionInfo.value.clientLocation.latitude = position.coords.latitude;
        sessionInfo.value.clientLocation.longitude = position.coords.longitude;

        try {
          const ipResponse = await fetch("https://ipapi.co/json/");
          const ipData = await ipResponse.json();
          sessionInfo.value.clientLocation.country =
            ipData.country_name || "Unknown";
          sessionInfo.value.clientLocation.city = ipData.city || "Unknown";
          sessionInfo.value.clientLocation.region = ipData.region || "Unknown";
          sessionInfo.value.clientLocation.timezone =
            ipData.timezone || "Unknown";
        } catch {
          // IP fallback failed silently
        }
      } catch {
        await fetchIPLocation();
      }
    } else {
      await fetchIPLocation();
    }
  }

  function updateSessionInfo() {
    const referrerUrl = document.referrer;
    sessionInfo.value = {
      ...getBrowserAndOSInfo(),
      clientLocation: sessionInfo.value.clientLocation,
      referrer: referrerUrl || null,
    };
  }

  async function requestLocationPermission(): Promise<void> {
    await getLocationInfo();
  }

  updateSessionInfo();

  window.addEventListener("resize", () => {
    sessionInfo.value = {
      ...sessionInfo.value,
      ...getBrowserAndOSInfo(),
    };
  });

  return {
    sessionInfo,
    updateSessionInfo,
    requestLocationPermission,
  };
}
