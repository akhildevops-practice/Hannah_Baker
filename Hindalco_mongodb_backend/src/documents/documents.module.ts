import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaService } from '../prisma.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { UserModule } from '../user/user.module';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RefsModule } from 'src/refs/refs.module';
import { EntityModule } from 'src/entity/entity.module';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { Logger } from 'winston';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { RefsSchema, Refs } from 'src/refs/schema/refs.schema';
import { RefsService } from 'src/refs/refs.service';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';
import { OrganizationService } from 'src/organization/organization.service';
import { auditTrial, auditTrialDocument } from '../audit-trial/schema/audit-trial.schema';
import { AuditTrialModule } from '../audit-trial/audit-trial.module'
@Module({
  imports: [
    AuthenticationModule,
    UserModule,
    MongooseModule.forFeature([
      { name: System.name, schema: SystemSchema },
      { name: Refs.name, schema: RefsSchema },
      { name: auditTrial.name, schema: auditTrialDocument },
    ]),
    AuditTrialModule,
    RefsModule,
    EntityModule,
    SerialNumberModule,
    EmailModule,
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    PrismaService,
    OrganizationService,
    SerialNumberService,
    EmailService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
