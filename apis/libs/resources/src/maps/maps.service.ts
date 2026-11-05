import { Injectable, BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { AppConfigService } from '@app/core';
import { RideErrors } from '../rides/types/ride-errors.js';

export interface RouteResult {
  distance_km: number;
  duration_minutes: number;
  geometry?: string;
}

@Injectable()
export class MapsService {
  constructor(private readonly config: AppConfigService) {}

  async autocomplete(text: string) {
    const { orsApiKey, orsBaseUrl } = this.config.booking;
    if (!orsApiKey) throw new ServiceUnavailableException('Location search is not configured');
    const url = new URL((orsBaseUrl.endsWith('/') ? orsBaseUrl.slice(0, -1) : orsBaseUrl) + '/geocode/autocomplete');
    url.searchParams.set('text', text);
    url.searchParams.set('boundary.country', 'IND');
    url.searchParams.set('size', '6');
    try {
      const response = await fetch(url, { headers: { Authorization: orsApiKey }, signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Provider failed');
      const data = await response.json() as { features?: Array<{ geometry?: { coordinates?: number[] }; properties?: { gid?: string; label?: string } }> };
      if (!Array.isArray(data.features)) throw new Error('Invalid provider response');
      return data.features.flatMap((feature) => {
        const [longitude, latitude] = feature.geometry?.coordinates ?? [];
        const label = feature.properties?.label;
        if (!label || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude!) > 90 || Math.abs(longitude!) > 180) return [];
        return [{ id: feature.properties?.gid ?? latitude + ',' + longitude, label, latitude: latitude!, longitude: longitude! }];
      });
    } catch {
      throw new BadGatewayException('Location search is unavailable. Please try again.');
    }
  }

  async getRoute(
    pickupLat: number,
    pickupLng: number,
    destLat: number,
    destLng: number,
    roundTrip: boolean,
    roundTripMultiplier: number,
  ): Promise<RouteResult> {
    const booking = this.config.booking;
    const url = `${booking.orsBaseUrl}/v2/directions/driving-car`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (booking.orsApiKey) {
      headers['Authorization'] = booking.orsApiKey;
    }

    const body = {
      coordinates: [
        [pickupLng, pickupLat],
        [destLng, destLat],
      ],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw RideErrors.mapsFailed();
      }

      const data = (await response.json()) as {
        routes?: Array<{ geometry?: string; summary?: { distance?: number; duration?: number } }>;
      };

      const summary = data.routes?.[0]?.summary;
      if (!summary?.distance || summary.duration == null) {
        throw RideErrors.mapsFailed();
      }

      let distanceKm = summary.distance / 1000;
      let durationMinutes = Math.ceil(summary.duration / 60);

      if (roundTrip) {
        distanceKm *= roundTripMultiplier;
        durationMinutes = Math.ceil(durationMinutes * roundTripMultiplier);
      }

      return {
        distance_km: Math.round(distanceKm * 100) / 100,
        duration_minutes: durationMinutes,
        geometry: data.routes?.[0]?.geometry,
      };
    } catch (error) {
      if (error instanceof Error && 'errorCode' in error) {
        throw error;
      }
      throw RideErrors.mapsFailed();
    }
  }
}
