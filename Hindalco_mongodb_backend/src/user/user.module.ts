import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CustomLogger } from 'src/audit-trial/logger.provider';

import {
  transferredUser,
  transferredUserSchema,
} from './schema/transferredUser.schema';
import { EmailService } from 'src/email/email.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalRoles, GlobalRolesSchema } from './schema/globlaRoles.schema';

@Module({
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([
      { name: transferredUser.name, schema: transferredUserSchema },
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    EmailService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
