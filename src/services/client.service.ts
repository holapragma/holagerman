import { clientRepository } from "@/repositories/client.repository";
import type { ClientFormValues } from "@/lib/validations";

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export class ClientService {
  async list(search?: string) {
    return clientRepository.findAll(search);
  }

  async getById(id: string) {
    return clientRepository.findById(id);
  }

  async create(data: ClientFormValues) {
    return clientRepository.create({
      name: data.name.trim(),
      company: normalizeOptional(data.company),
      phone: normalizeOptional(data.phone),
      email: normalizeOptional(data.email),
      notes: normalizeOptional(data.notes),
    });
  }

  async update(id: string, data: ClientFormValues) {
    return clientRepository.update(id, {
      name: data.name.trim(),
      company: normalizeOptional(data.company),
      phone: normalizeOptional(data.phone),
      email: normalizeOptional(data.email),
      notes: normalizeOptional(data.notes),
    });
  }

  async remove(id: string) {
    return clientRepository.delete(id);
  }
}

export const clientService = new ClientService();
