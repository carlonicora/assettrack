import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import {
  NotificationDataPatchDTO,
  NotificationPatchListDTO,
} from "src/foundations/notification/dtos/notification.patch.dto";
import { notificationMeta } from "src/foundations/notification/entities/notification.meta";
import { NotificationServices } from "src/foundations/notification/services/notification.service";

@UseGuards(JwtAuthGuard)
@Controller()
export class NotificationController {
  constructor(private readonly service: NotificationServices) {}

  @Get(notificationMeta.endpoint)
  async findList(@Req() request: any, @Query() query: any, @Query("isArchived") isArchived?: boolean) {
    return await this.service.find({ query: query, userId: request.user.userId, isArchived: isArchived });
  }

  @Get(`${notificationMeta.endpoint}/:notificationId`)
  async findById(@Req() request: any, @Param("notificationId") notificationId: string) {
    return await this.service.findById({ notificationId: notificationId, userId: request.user.id });
  }

  @Patch(notificationMeta.endpoint)
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(@Req() request: any, @Query() query: any, @Body() body: NotificationPatchListDTO) {
    return await this.service.markAsRead({
      userId: request.user.userId,
      notificationIds: body.data.map((notification: NotificationDataPatchDTO) => notification.id),
    });
  }

  @Post(`${notificationMeta.endpoint}/:notificationId/archive`)
  @HttpCode(HttpStatus.NO_CONTENT)
  async archive(@Req() request: any, @Query() query: any, @Param("notificationId") notificationId: string) {
    await this.service.archive({
      notificationId: notificationId,
    });
  }
}
