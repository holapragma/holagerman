import { marketObservationRepository } from "@/repositories/market-observation.repository";
import type {
  MarketObservationWithProduct,
  MarketStats,
} from "@/types";

export class MarketService {
  async registerObservation(data: {
    productId: string;
    source: string;
    store?: string | null;
    url?: string | null;
    observedPrice: number;
    currency: string;
    date?: string;
    notes?: string | null;
  }): Promise<{ id: string }> {
    const obs = await marketObservationRepository.create({
      ...data,
      date: data.date ? new Date(`${data.date}T12:00:00`) : new Date(),
    });
    return { id: obs.id };
  }

  async getObservations(
    productId: string,
  ): Promise<MarketObservationWithProduct[]> {
    return marketObservationRepository.findAllByProduct(productId);
  }

  async getStats(
    productId: string,
    myPrice: number,
  ): Promise<MarketStats> {
    const observations = await this.getObservations(productId);
    const arsObs = observations.filter((o) => o.currency === "ARS");

    if (arsObs.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        count: 0,
        lastUpdate: null,
        diffVsMin: 0,
        diffVsAvg: 0,
        diffVsMax: 0,
      };
    }

    const prices = arsObs.map((o) => o.observedPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const count = prices.length;
    const lastUpdate = arsObs[0]?.date ?? null;

    return {
      min,
      max,
      avg,
      count,
      lastUpdate,
      diffVsMin: myPrice - min,
      diffVsAvg: myPrice - avg,
      diffVsMax: myPrice - max,
    };
  }

  async count(): Promise<number> {
    return marketObservationRepository.count();
  }
}

export const marketService = new MarketService();