import { Module } from "@nestjs/common";
import { SecurityService } from "src/core/security/services/security.service";

@Module({
  controllers: [],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
