import { Module } from "@nestjs/common";
import { MigratorService } from "src/core/migrator/services/migrator.service";

@Module({
  controllers: [],
  providers: [MigratorService],
  exports: [],
})
export class MigratorModule {}
