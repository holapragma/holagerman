import { quoteRepository } from "@/repositories/quote.repository";
import { companySettingsRepository } from "@/repositories/company-settings.repository";
import { companyService } from "@/services/company.service";
import { APP_NAME } from "@/lib/constants";
import type { QuoteFormValues } from "@/lib/validations";
import type { CompanyInfo } from "@/services/pdf/pdf.types";
import type { CreateQuoteItemInput, QuoteCompanySnapshot, QuoteWithRelations } from "@/types";

const DEFAULT_MANUAL_CATEGORY = "General";

function normalizeOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

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

    const companyId = data.companyId || null;
    let companySnapshot: QuoteCompanySnapshot | null = null;

    if (companyId) {
      companySnapshot = await companyService.buildSnapshot(companyId);
      if (!companySnapshot) {
        throw new Error("La empresa emisora seleccionada ya no existe.");
      }
    }

    const items: CreateQuoteItemInput[] = data.items.map((item) => {
      const name = item.name.trim();
      const isManual = !item.productId;

      return {
        productId: item.productId || null,
        name,
        description: normalizeOptional(item.description),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        createProduct:
          isManual && item.saveAsProduct
            ? {
                name,
                category: DEFAULT_MANUAL_CATEGORY,
                price: item.unitPrice,
              }
            : null,
      };
    });

    return quoteRepository.create({
      clientId: data.clientId,
      companyId,
      companySnapshot,
      notes: data.notes,
      items,
      ivaPct,
    });
  }

  /**
   * Arma los datos de empresa con los que se imprime el PDF. Salen del snapshot
   * del presupuesto, no de la empresa tal como está hoy.
   */
  async getPdfData(
    id: string,
  ): Promise<{ quote: QuoteWithRelations; companyInfo: CompanyInfo & { conditions: string } } | null> {
    const quote = await quoteRepository.findById(id);
    if (!quote) return null;

    const snapshot = companyService.resolveSnapshot(quote);
    const logo = snapshot?.logoId ? await companyService.getLogo(snapshot.logoId) : null;

    return {
      quote,
      companyInfo: {
        name: snapshot?.name ?? APP_NAME,
        legalName: snapshot?.legalName ?? null,
        taxId: snapshot?.taxId ?? null,
        email: snapshot?.email ?? null,
        phone: snapshot?.phone ?? null,
        address: snapshot?.address ?? null,
        website: snapshot?.website ?? null,
        quoteValidityDays: snapshot?.quoteValidityDays ?? 30,
        conditions: snapshot?.conditions ?? "",
        logo: logo ? { mimeType: logo.mimeType, data: new Uint8Array(logo.data) } : null,
      },
    };
  }

  async remove(id: string) {
    return quoteRepository.delete(id);
  }
}

export const quoteService = new QuoteService();
