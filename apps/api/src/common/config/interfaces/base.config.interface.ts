import { ConfigApiInterface } from "src/common/config/interfaces/config.api.interface";
import { ConfigAppInterface } from "src/common/config/interfaces/config.app.interface";
import { ConfigCacheInterface } from "src/common/config/interfaces/config.cache.interface";
import { ConfigCorsInterface } from "src/common/config/interfaces/config.cors.interface";
import { ConfigEmailInterface } from "src/common/config/interfaces/config.email.interface";
import { ConfigEnvironmentInterface } from "src/common/config/interfaces/config.environment.interface";
import { ConfigJwtInterface } from "src/common/config/interfaces/config.jwt.interface";
import { ConfigLoggingInterface } from "src/common/config/interfaces/config.logging.interface";
import { ConfigNeo4jInterface } from "src/common/config/interfaces/config.neo4j.interface";
import { ConfigRateLimitInterface } from "src/common/config/interfaces/config.ratelimit.interface";
import { ConfigRedisInterface } from "src/common/config/interfaces/config.redis.interface";
import { ConfigS3Interface } from "src/common/config/interfaces/config.s3.interface";
import { ConfigTempoInterface } from "src/common/config/interfaces/config.tempo.interface";
import { ConfigVapidInterface } from "src/common/config/interfaces/config.vapid.interface";

export interface BaseConfigInterface {
  environment: ConfigEnvironmentInterface;
  api: ConfigApiInterface;
  app: ConfigAppInterface;
  neo4j: ConfigNeo4jInterface;
  redis: ConfigRedisInterface;
  cache: ConfigCacheInterface;
  cors: ConfigCorsInterface;
  jwt: ConfigJwtInterface;
  vapid: ConfigVapidInterface;
  email: ConfigEmailInterface;
  logging: ConfigLoggingInterface;
  tempo: ConfigTempoInterface;
  s3: ConfigS3Interface;
  rateLimit: ConfigRateLimitInterface;
}
