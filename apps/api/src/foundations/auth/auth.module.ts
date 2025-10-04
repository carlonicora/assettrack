import { Module, OnModuleInit } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "src/foundations/auth/controllers/auth.controller";

import { modelRegistry } from "src/common/registries/registry";
import { AuthCodeModel } from "src/foundations/auth/entities/auth.code.model";
import { AuthModel } from "src/foundations/auth/entities/auth.model";
import { AuthSerialiser } from "src/foundations/auth/serialisers/auth.serialiser";
import { CompanyModule } from "src/foundations/company/company.module";
import { UserModule } from "src/foundations/user/user.module";
import { AuthRepository } from "./repositories/auth.repository";
import { AuthService } from "./services/auth.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, AuthSerialiser],
  exports: [AuthService],
  imports: [UserModule, JwtModule, CompanyModule],
})
export class AuthModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(AuthModel);
    modelRegistry.register(AuthCodeModel);
  }
}
