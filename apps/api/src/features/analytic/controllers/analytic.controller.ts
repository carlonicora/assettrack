import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { FastifyReply } from "fastify";

import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import { AuthenticatedRequest } from "src/common/interfaces/authenticated.request.interface";
import { analyticMeta } from "src/features/analytic/entities/analytic.meta";
import { AnalyticService } from "src/features/analytic/services/analytic.service";

@UseGuards(JwtAuthGuard)
@Controller()
export class AnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}

  @Get(analyticMeta.endpoint)
  async findAnalytics(@Req() req: AuthenticatedRequest, @Res() reply: FastifyReply) {
    const response = await this.analyticService.find();

    reply.send(response);
  }
}
