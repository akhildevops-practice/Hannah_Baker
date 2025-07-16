import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { LocationService } from 'src/location/location.service';
import { UserService } from 'src/user/user.service';

import { RolesService } from 'src/roles/roles.service';

import {
  transferredUser,
  transferredUserSchema,
} from 'src/user/schema/transferredUser.schema';
import { EmailService } from 'src/email/email.service';
import {
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  controllers: [BusinessController],
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
    ]),
    MongooseModule.forFeature([
      { name: transferredUser.name, schema: transferredUserSchema },
    ]),
  ],
  providers: [
    BusinessService,
    PrismaService,
    LocationService,
    UserService,
    EmailService,
    RolesService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class BusinessModule {}
