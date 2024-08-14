import { IJwtPayload } from '@./interfaces';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configServise: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken,
      ignoreExpiration: true,
      secretOrKey: configServise.get('JWT_SECRET_KEY'),
    });
  }

  async validate({ id }: IJwtPayload): Promise<IJwtPayload['id']> {
    return id;
  }
}
