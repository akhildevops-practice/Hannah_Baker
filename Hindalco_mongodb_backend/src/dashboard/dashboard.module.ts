import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { NotificationService } from 'src/notification/notification.service';
import { DocumentsModule } from 'src/documents/documents.module';
import { DocumentsService } from 'src/documents/documents.service';
import { UserModule } from 'src/user/user.module';
import { Audit, AuditSchema } from 'src/audit/schema/audit.schema';
import {
  Nonconformance,
  NonconformanceSchema,
} from 'src/audit/schema/nonconformance.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationModule } from 'src/organization/organization.module';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { LocationModule } from 'src/location/location.module';
import { SystemsModule } from 'src/systems/systems.module';
import { EntityModule } from 'src/entity/entity.module';
import { AuditModule } from 'src/audit/audit.module';
import { FavoritesService } from 'src/favorites/favorites.service';
import { RefsModule } from 'src/refs/refs.module';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';
import { AuditTrialModule } from 'src/audit-trial/audit-trial.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
    MongooseModule.forFeature([
      { name: Nonconformance.name, schema: NonconformanceSchema },
    ]),
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
    AuthenticationModule,
    DocumentsModule,
    UserModule,
    OrganizationModule,
    UserModule,
    LocationModule,
    SystemsModule,
    EntityModule,
    AuditModule,
    RefsModule,
    SerialNumberModule,
    EmailModule,
    AuditTrialModule
  ],
  exports: [DashboardService],
  providers: [
    DashboardService,
    PrismaService,
    NotificationService,
    DocumentsService,
    EmailService,
    FavoritesService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
