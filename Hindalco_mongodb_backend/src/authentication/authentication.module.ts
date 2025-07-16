import { HttpModule, Module } from '@nestjs/common';
import { UserService } from '../user/user.service';

import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';
import { AUTHENTICATION_STRATEGY_TOKEN } from './authentication.strategy';
import { KeycloakAuthenticationStrategy } from './strategy/keycloak.strategy';
import { PrismaService } from '../prisma.service';

import {
  transferredUser,
  transferredUserSchema,
} from 'src/user/schema/transferredUser.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { EmailService } from 'src/email/email.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: transferredUser.name, schema: transferredUserSchema },
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
    ]),
  ],
  providers: [
    PrismaService,
    EmailService,
    AuthenticationGuard,
    AuthenticationService,
    KeycloakAuthenticationStrategy,

    UserService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
    // {
    //     provide: AUTHENTICATION_STRATEGY_TOKEN,
    //     useClass: KeycloakAuthenticationStrategy,
    // },
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
