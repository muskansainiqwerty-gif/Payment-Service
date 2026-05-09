import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

import { MyService } from '../redis/redis.service';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // constructor(private readonly redis: MyService) {
  //   super({
  //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //     ignoreExpiration: false,
  //     secretOrKeyProvider: async (request, rawJwtToken, done) => {
  //       try {
  //         const decoded: any = jwt.decode(rawJwtToken);
  //         const role = decoded?.role;

  //         const secret = this.authService.getSecretForRole(role); // make sure this is accessible
  //         if (!secret) {
  //           return done(new UnauthorizedException('Invalid role'), null);
  //         }

  //         done(null, secret);
  //       } catch (err) {
  //         done(err, null);
  //       }
  //     },
  //     passReqToCallback: true,
  //   });
  // }
}
