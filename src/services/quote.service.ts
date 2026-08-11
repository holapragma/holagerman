import { quoteRepository } from "@/repositories/quote.repository";
import type { QuoteFormValues } from "@/lib/validations";

export class QuoteService {
  async list() {
    return quoteRepository.findAll();
  }

  async getById(id: string) {
    return quoteRepository.findById(id);
  }

  async create(data: QuoteFormValues) {
    return quoteRepository.create({
      clientId: data.clientId,
      notes: data.notes,
      items: data.items,
    });
  }

  async remove(id: string) {
    return quoteRepository.delete(id);
  }
}

export const quoteService = new QuoteService();
