import { productRepository } from "@/repositories/product.repository";
import type { ProductFormValues } from "@/lib/validations";

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export class ProductService {
  async list(search?: string) {
    return productRepository.findAll(search);
  }

  async getById(id: string) {
    return productRepository.findById(id);
  }

  async create(data: ProductFormValues) {
    return productRepository.create({
      name: data.name.trim(),
      category: data.category.trim(),
      price: data.price,
      stock: data.stock,
      photoUrl: normalizeOptional(data.photoUrl),
    });
  }

  async update(id: string, data: ProductFormValues) {
    return productRepository.update(id, {
      name: data.name.trim(),
      category: data.category.trim(),
      price: data.price,
      stock: data.stock,
      photoUrl: normalizeOptional(data.photoUrl),
    });
  }

  async remove(id: string) {
    return productRepository.delete(id);
  }
}

export const productService = new ProductService();
