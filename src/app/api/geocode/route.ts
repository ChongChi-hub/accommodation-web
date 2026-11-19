import { NextRequest, NextResponse } from 'next/server';

interface GeoHit {
  lat: number;
  lng: number;
  displayName?: string;
}

function roundCoord(val: number): number {
  return Math.round(val * 1_000_000) / 1_000_000;
}

async function tryArcGis(query: string): Promise<GeoHit | null> {
  try {
    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&countryCode=VNM&maxLocations=1&SingleLine=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'ToAmAccommodationApp/1.0' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: Array<{ address?: string; score?: number; location?: { x: number; y: number } }>;
    };
    const top = data.candidates?.[0];
    if (top?.location && typeof top.location.y === 'number' && typeof top.location.x === 'number') {
      return {
        lat: roundCoord(top.location.y),
        lng: roundCoord(top.location.x),
        displayName: top.address,
      };
    }
  } catch {
    // fallback to next provider
  }
  return null;
}

async function tryPhoton(query: string): Promise<GeoHit | null> {
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'ToAmAccommodationApp/1.0' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      features?: Array<{
        geometry?: { coordinates?: [number, number] };
        properties?: { name?: string; street?: string; city?: string };
      }>;
    };
    const feat = data.features?.[0];
    const coords = feat?.geometry?.coordinates;
    if (coords && coords.length >= 2) {
      const displayName = [feat?.properties?.name, feat?.properties?.street, feat?.properties?.city]
        .filter(Boolean)
        .join(', ');
      return { lat: roundCoord(coords[1]), lng: roundCoord(coords[0]), displayName: displayName || undefined };
    }
  } catch {
    // fallback to next provider
  }
  return null;
}

async function tryNominatim(query: string): Promise<GeoHit | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'ToAmAccommodationApp/1.0' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{ lat: string; lon: string; display_name?: string }>;
    if (rows.length > 0) {
      const lat = roundCoord(parseFloat(rows[0].lat));
      const lng = roundCoord(parseFloat(rows[0].lon));
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng, displayName: rows[0].display_name };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ found: false, message: 'Missing query' }, { status: 400 });
  }

  const hit = (await tryArcGis(q)) || (await tryPhoton(q)) || (await tryNominatim(q));
  if (!hit) {
    return NextResponse.json({ found: false }, { status: 200 });
  }
  return NextResponse.json({ found: true, ...hit }, { status: 200 });
}

