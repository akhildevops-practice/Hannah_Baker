import { Module } from '@nestjs/common';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { AuditTrialController } from './audit-trial.controller';
import { AuditTrialService } from './audit-trial.service';
import { CustomLogger } from './logger.provider';
import { auditTrial, auditTrialDocument } from './schema/audit-trial.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: auditTrial.name, schema: auditTrialDocument },
    ]),
    AuthenticationModule],
  controllers: [AuditTrialController],
  providers: [
    AuditTrialService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class AuditTrialModule {}
