import { quoteRepository } from "@/repositories/quote.repository";
import { companySettingsRepository } from "@/repositories/company-settings.repository";
import type { QuoteFormValues } from "@/lib/validations";

export class QuoteService {
  async list() {
    return quoteRepository.findAll();
  }

  async getById(id: string) {
    return quoteRepository.findById(id);
  }

  async create(data: QuoteFormValues) {
    const ivaPct = data.includeIva
      ? (await companySettingsRepository.toConfig()).ivaPct
      : null;

    return quoteRepository.create({
      clientId: data.clientId,
      notes: data.notes,
      items: data.items,
      ivaPct,
    });
  }

  async remove(id: string) {
    return quoteRepository.delete(id);
  }
}

export const quoteService = new QuoteService();
