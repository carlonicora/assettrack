import { baseConfig } from "src/common/config/base.config";
import { ConfigInterface } from "src/config/interfaces/config.interface";

export default (): ConfigInterface => {
  return {
    ...baseConfig,
    upc: {
      enabled: process.env.UPC_ENABLED === "true",
      apiKey: process.env.UPC_API_KEY || "",
      baseUrl: process.env.UPC_API_BASE_URL || "https://api.upcdatabase.org",
      timeout: parseInt(process.env.UPC_TIMEOUT || "5000"),
      cacheTtl: parseInt(process.env.UPC_CACHE_TTL || "86400"),
    },
  };
};
