import { baseConfig } from "src/common/config/base.config";
import { ConfigInterface } from "src/config/interfaces/config.interface";

export default (): ConfigInterface => {
  return {
    ...baseConfig,
  };
};
