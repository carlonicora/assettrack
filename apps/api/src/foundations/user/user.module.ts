import { Module, OnModuleInit } from "@nestjs/common";

import { modelRegistry } from "src/common/registries/registry";
import { CompanyModule } from "src/foundations/company/company.module";
import { S3Module } from "src/foundations/s3/s3.module";
import { UserAdminController } from "src/foundations/user/controllers/user.admin.controller";
import { OwnerModel, UserModel } from "src/foundations/user/entities/user.model";
import { UserSerialiser } from "src/foundations/user/serialisers/user.serialiser";
import { UserCypherService } from "src/foundations/user/services/user.cypher.service";
import { UserController } from "./controllers/user.controller";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";

@Module({
  controllers: [UserController, UserAdminController],
  providers: [UserRepository, UserService, UserSerialiser, UserCypherService],
  exports: [UserService, UserRepository, UserSerialiser],
  imports: [CompanyModule, S3Module],
})
export class UserModule implements OnModuleInit {
  onModuleInit() {
    modelRegistry.register(UserModel);
    modelRegistry.register(OwnerModel);
  }
}
