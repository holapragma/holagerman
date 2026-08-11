import { competitionRepository } from "@/repositories/competition.repository";
import type { CompetitionFormValues } from "@/lib/validations";

export class CompetitionService {
  async list() {
    return competitionRepository.findAll();
  }

  async getById(id: string) {
    return competitionRepository.findById(id);
  }

  async create(data: CompetitionFormValues) {
    return competitionRepository.create({
      productId: data.productId,
      competitorPrice: data.competitorPrice,
      source: data.source.trim(),
    });
  }

  async update(id: string, data: CompetitionFormValues) {
    return competitionRepository.update(id, {
      productId: data.productId,
      competitorPrice: data.competitorPrice,
      source: data.source.trim(),
    });
  }

  async remove(id: string) {
    return competitionRepository.delete(id);
  }
}

export const competitionService = new CompetitionService();
