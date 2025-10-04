import { Module } from "@nestjs/common";
import { VersionController } from "src/core/version/controllers/version.controller";
import { VersionService } from "src/core/version/services/version.service";

@Module({
  controllers: [VersionController],
  providers: [VersionService],
  exports: [VersionService],
})
export class VersionModule {}
