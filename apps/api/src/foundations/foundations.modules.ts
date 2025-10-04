import { Module } from "@nestjs/common";
import { AuditModule } from "src/foundations/audit/audit.module";
import { AuthModule } from "src/foundations/auth/auth.module";
import { CompanyModule } from "src/foundations/company/company.module";
import { FeatureModule } from "src/foundations/feature/feature.module";
import { ModuleModule } from "src/foundations/module/module.module";
import { NotificationModule } from "src/foundations/notification/notification.module";
import { PushModule } from "src/foundations/push/push.module";
import { RoleModule } from "src/foundations/role/role.module";
import { S3Module } from "src/foundations/s3/s3.module";
import { UserModule } from "src/foundations/user/user.module";

@Module({
  imports: [
    AuditModule,
    AuthModule,
    CompanyModule,
    FeatureModule,
    ModuleModule,
    NotificationModule,
    PushModule,
    RoleModule,
    S3Module,
    UserModule,
  ],
})
export class FoundationsModules {}
