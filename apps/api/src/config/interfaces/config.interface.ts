import { BaseConfigInterface } from "src/common/config/interfaces/base.config.interface";
import { ConfigUpcInterface } from "src/config/interfaces/config.upc.interface";

export interface ConfigInterface extends BaseConfigInterface {
  upc: ConfigUpcInterface;
}
