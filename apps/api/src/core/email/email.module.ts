import { Module } from "@nestjs/common";
import { EmailService } from "src/core/email/services/email.service";

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
