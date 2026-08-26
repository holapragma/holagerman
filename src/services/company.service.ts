import { companyRepository } from "@/repositories/company.repository";
import type { CompanyFormValues } from "@/lib/validations";
import type { Company, QuoteCompanySnapshot, QuoteWithRelations } from "@/types";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg"];

function normalizeOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toWriteData(data: CompanyFormValues) {
  return {
    name: data.name.trim(),
    legalName: normalizeOptional(data.legalName),
    taxId: normalizeOptional(data.taxId),
    address: normalizeOptional(data.address),
    phone: normalizeOptional(data.phone),
    email: normalizeOptional(data.email),
    website: normalizeOptional(data.website),
    quoteValidityDays: data.quoteValidityDays,
    conditions: normalizeOptional(data.conditions),
    active: data.active,
  };
}

export class CompanyService {
  async list() {
    return companyRepository.findAll();
  }

  async listActive() {
    return companyRepository.findActive();
  }

  async getById(id: string) {
    return companyRepository.findById(id);
  }

  async create(data: CompanyFormValues) {
    return companyRepository.create(toWriteData(data));
  }

  async update(id: string, data: CompanyFormValues) {
    return companyRepository.update(id, toWriteData(data));
  }

  async setActive(id: string, active: boolean) {
    return companyRepository.setActive(id, active);
  }

  async setDefault(id: string) {
    return companyRepository.setDefault(id);
  }

  async count() {
    return companyRepository.count();
  }

  async uploadLogo(companyId: string, file: File) {
    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      throw new Error("El logo debe ser PNG o JPG.");
    }
    if (file.size > MAX_LOGO_BYTES) {
      throw new Error("El logo no puede superar los 2 MB.");
    }

    const data = new Uint8Array(await file.arrayBuffer());
    return companyRepository.attachLogo(companyId, { mimeType: file.type, data });
  }

  async removeLogo(companyId: string) {
    return companyRepository.detachLogo(companyId);
  }

  async getLogo(id: string) {
    return companyRepository.findLogo(id);
  }

  /**
   * Empresa que se propone por defecto al armar un presupuesto nuevo.
   */
  async getDefaultForQuote(): Promise<Company | null> {
    const active = await companyRepository.findActive();
    return active.find((company) => company.isDefault) ?? active[0] ?? null;
  }

  /**
   * Congela los datos de la empresa en el momento de emitir el presupuesto.
   */
  async buildSnapshot(companyId: string): Promise<QuoteCompanySnapshot | null> {
    const company = await companyRepository.findById(companyId);
    if (!company) return null;

    return {
      name: company.name,
      legalName: company.legalName,
      taxId: company.taxId,
      address: company.address,
      phone: company.phone,
      email: company.email,
      website: company.website,
      conditions: company.conditions ?? "",
      quoteValidityDays: company.quoteValidityDays,
      logoId: company.logoId,
    };
  }

  /**
   * Datos de empresa para mostrar/imprimir un presupuesto. Siempre se prioriza
   * el snapshot guardado: cambiar la empresa hoy no altera lo ya emitido.
   */
  resolveSnapshot(quote: QuoteWithRelations): QuoteCompanySnapshot | null {
    if (quote.companyName) {
      return {
        name: quote.companyName,
        legalName: quote.companyLegalName,
        taxId: quote.companyTaxId,
        address: quote.companyAddress,
        phone: quote.companyPhone,
        email: quote.companyEmail,
        website: quote.companyWebsite,
        conditions: quote.companyConditions ?? "",
        quoteValidityDays: quote.companyValidityDays ?? 30,
        logoId: quote.companyLogoId,
      };
    }

    // Presupuestos anteriores a la existencia de empresas emisoras.
    if (quote.company) {
      return {
        name: quote.company.name,
        legalName: quote.company.legalName,
        taxId: quote.company.taxId,
        address: quote.company.address,
        phone: quote.company.phone,
        email: quote.company.email,
        website: quote.company.website,
        conditions: quote.company.conditions ?? "",
        quoteValidityDays: quote.company.quoteValidityDays,
        logoId: quote.company.logoId,
      };
    }

    return null;
  }
}

export const companyService = new CompanyService();
