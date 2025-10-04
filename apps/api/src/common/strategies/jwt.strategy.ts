import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ClsService } from "nestjs-cls";
import { ExtractJwt, Strategy } from "passport-jwt";
import { BaseConfigInterface } from "src/common/config/interfaces/base.config.interface";
import { ConfigJwtInterface } from "src/common/config/interfaces/config.jwt.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly cls: ClsService,
    private readonly config: ConfigService<BaseConfigInterface>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<ConfigJwtInterface>("jwt").secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const now = new Date();
    const expiration = new Date(payload.expiration);

    if (expiration < now) throw new HttpException("Token expired", 401);

    this.cls.set("userId", payload.userId);

    return payload;
  }
}
