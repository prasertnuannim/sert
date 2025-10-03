import { prisma } from "../prisma";

type IpApiResponse = {
  city?: string;
  region?: string;
  country_name?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};


function isPrivate(ip?: string | null) {
  if (!ip) return true;
  if (ip === "127.0.0.1" || ip === "::1") return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  const m = ip.match(/^172\.(\d+)\./);
  return m ? Number(m[1]) >= 16 && Number(m[1]) <= 31 : false;
}

export type Geo = {
  city?: string | null;
  region?: string | null;
  country?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export async function geolocate(ip?: string | null): Promise<Geo> {
  if (!ip || process.env.GEOLOOKUP === "off" || isPrivate(ip)) {
    return {}; // ข้าม local/private
  }

  const cached = await prisma.geoIpCache.findUnique({ where: { ip } }).catch(() => null);
  if (cached) {
    return {
      city: cached.city,
      region: cached.region,
      country: cached.country,
      countryCode: cached.countryCode,
      latitude: cached.latitude ?? undefined,
      longitude: cached.longitude ?? undefined,
    };
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { cache: "no-store" });
    if (!res.ok) return {};

    const j: IpApiResponse = await res.json();

    const geo: Geo = {
      city: j.city,
      region: j.region,
      country: j.country_name,
      countryCode: j.country,
      latitude: j.latitude ? Number(j.latitude) : null,
      longitude: j.longitude ? Number(j.longitude) : null,
    };

    await prisma.geoIpCache.upsert({
      where: { ip },
      update: geo,
      create: { ip, ...geo },
    });

    return geo;
  } catch {
    return {};
  }
}
