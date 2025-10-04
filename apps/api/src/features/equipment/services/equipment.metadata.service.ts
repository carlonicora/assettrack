import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosError } from "axios";
import { ConfigInterface } from "src/config/interfaces/config.interface";
import { ConfigUpcInterface } from "src/config/interfaces/config.upc.interface";
import { CacheService } from "src/core/cache/services/cache.service";
import { AppLoggingService } from "src/core/logging/services/logging.service";
import { EquipmentRepository } from "src/features/equipment/repositories/equipment.repository";

interface UpcProductResponse {
  success: boolean;
  product?: {
    title?: string;
    description?: string;
    brand?: string;
    model?: string;
    category?: string;
    images?: string[];
  };
  error?: string;
}

interface UpcItemDbResponse {
  code: string;
  total: number;
  offset: number;
  items?: Array<{
    ean?: string;
    upc?: string;
    title?: string;
    description?: string;
    brand?: string;
    model?: string;
    color?: string;
    size?: string;
    dimension?: string;
    weight?: string;
    category?: string;
    currency?: string;
    lowest_recorded_price?: number;
    highest_recorded_price?: number;
    images?: string[];
    offers?: Array<{
      domain?: string;
      title?: string;
      price?: number;
      link?: string;
    }>;
  }>;
  message?: string;
}

interface EquipmentMetadata {
  name?: string;
  manufacturer?: string;
  model?: string;
  category?: string;
  imageUrl?: string;
  description?: string;
}

@Injectable()
export class EquipmentMetadataService {
  private readonly upcConfig: ConfigUpcInterface;
  private readonly CACHE_KEY_PREFIX = "barcode_metadata:";

  constructor(
    private readonly config: ConfigService<ConfigInterface>,
    private readonly cacheService: CacheService,
    private readonly equipmentRepository: EquipmentRepository,
    private readonly logger: AppLoggingService,
  ) {
    this.upcConfig = this.config.get<ConfigUpcInterface>("upc");
  }

  async fetchMetadata(params: { equipmentId: string; existingBarcode?: string; barcode?: string }): Promise<void> {
    if (!params.barcode) return;

    if (params.existingBarcode === params.barcode) return;

    if (!this.upcConfig.enabled) {
      console.log("UPC metadata fetching is disabled", "EquipmentMetadataService");
      return;
    }

    try {
      const metadata = await this.lookupBarcodeUpcItemDb(params.barcode);

      console.log(metadata);

      if (metadata) {
        await this.equipmentRepository.updateMetadata({ id: params.equipmentId, ...metadata });
        console.log(
          `Successfully fetched and updated metadata for barcode: ${params.barcode}`,
          "EquipmentMetadataService",
        );
      }
    } catch (error) {
      console.error(`Failed to fetch metadata for barcode ${params.barcode}`, error, "EquipmentMetadataService");
    }
  }

  private async lookupBarcode(barcode: string): Promise<EquipmentMetadata | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${barcode}`;

    try {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        console.log(`Cache hit for barcode: ${barcode}`, "EquipmentMetadataService");
        return cached;
      }
    } catch (error) {
      console.error(`Cache retrieval failed for barcode ${barcode}`, error);
    }

    try {
      const response = await axios.get<UpcProductResponse>(`${this.upcConfig.baseUrl}/product/${barcode}`, {
        headers: {
          Authorization: `Bearer ${this.upcConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: this.upcConfig.timeout,
      });

      if (response.data.success && response.data.product) {
        const product = response.data.product;
        const metadata: EquipmentMetadata = {
          name: product.title || undefined,
          manufacturer: product.brand || undefined,
          model: product.model || undefined,
          category: product.category || undefined,
          imageUrl: product.images && product.images.length > 0 ? product.images[0] : undefined,
          description: product.description || undefined,
        };

        try {
          await this.cacheService.set(cacheKey, metadata, this.upcConfig.cacheTtl);
        } catch (error) {
          console.error(`Failed to cache metadata for barcode ${barcode}`, error);
        }

        return metadata;
      }

      console.log(`No product found for barcode: ${barcode}`, "EquipmentMetadataService");
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          console.log(`Barcode not found in UPC database: ${barcode}`, "EquipmentMetadataService");
        } else if (axiosError.response?.status === 429) {
          console.warn(`Rate limit exceeded for UPC API`, "EquipmentMetadataService");
        } else {
          console.error(`UPC API error for barcode ${barcode}`, error, "EquipmentMetadataService");
        }
      } else {
        console.error(`Unexpected error looking up barcode ${barcode}`, error, "EquipmentMetadataService");
      }
      return null;
    }
  }

  private async lookupBarcodeUpcItemDb(barcode: string): Promise<EquipmentMetadata | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}upcitemdb:${barcode}`;

    try {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        console.log(`Cache hit for barcode (UpcItemDb): ${barcode}`, "EquipmentMetadataService");
        return cached;
      }
    } catch (error) {
      console.error(`Cache retrieval failed for barcode (UpcItemDb) ${barcode}`, error);
    }

    try {
      // UPCitemdb trial endpoint - hardcoded, no authentication required
      const endpoint = "https://api.upcitemdb.com/prod/trial/lookup";

      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      const response = await axios.get<UpcItemDbResponse>(endpoint, {
        params: { upc: barcode },
        headers,
        timeout: 5000,
      });

      if (response.data.code === "OK" && response.data.items && response.data.items.length > 0) {
        const item = response.data.items[0];
        const metadata: EquipmentMetadata = {
          name: item.title || undefined,
          manufacturer: item.brand || undefined,
          model: item.model || undefined,
          category: item.category || undefined,
          imageUrl: item.images && item.images.length > 0 ? item.images[0] : undefined,
          description: item.description || undefined,
        };

        try {
          await this.cacheService.set(cacheKey, metadata, this.upcConfig.cacheTtl);
        } catch (error) {
          console.error(`Failed to cache metadata (UpcItemDb) for barcode ${barcode}`, error);
        }

        return metadata;
      }

      console.log(`No product found for barcode (UpcItemDb): ${barcode}`, "EquipmentMetadataService");
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 404) {
          console.log(`Barcode not found in UpcItemDb: ${barcode}`, "EquipmentMetadataService");
        } else if (axiosError.response?.status === 429) {
          console.warn(`Rate limit exceeded for UpcItemDb API`, "EquipmentMetadataService");
        } else {
          console.error(`UpcItemDb API error for barcode ${barcode}`, error, "EquipmentMetadataService");
        }
      } else {
        console.error(`Unexpected error looking up barcode (UpcItemDb) ${barcode}`, error);
      }
      return null;
    }
  }
}
