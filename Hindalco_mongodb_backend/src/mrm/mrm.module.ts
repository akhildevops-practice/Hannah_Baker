import { Module } from '@nestjs/common';
import { MRMController } from './mrm.controller';
import { MRMService } from './mrm.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MRM, MRMDocument } from './schema/mrm.schema';
import { ScheduleMRM, ScheduleMRMDocument } from './schema/scheduleMrm.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { OrganizationModule } from 'src/organization/organization.module';
import { UserModule } from 'src/user/user.module';
import { ActionPoint, ActionPointDocument } from './schema/actionPoint.schema';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { LocationModule } from 'src/location/location.module';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { Agenda, AgendaDocument } from './schema/agenda.schema';
import {
  MeetingType,
  MeetingTypeDocument,
} from 'src/key-agenda/schema/meetingType.schema';
import { Meeting, MeetingDocument } from './schema/meeting.schema';
import { EmailService } from 'src/email/email.service';
import {
  ActionItems,
  actionitemsSchema,
} from 'src/actionitems/schema/actionitems.schema';
import {
  carasettingsSchema,
  cara_settings,
} from 'src/cara/schema/cara-setting.schema';

import { CaraService } from 'src/cara/cara.service';
import { cara, caraSchema } from 'src/cara/schema/cara.schema';
import { RefsService } from 'src/refs/refs.service';
import { Refs, RefsSchema } from 'src/refs/schema/refs.schema';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import {
  CapaComments,
  CaraComments,
} from 'src/cara/schema/cara-comments.schema';
import {
  CapaCapaOwner,
  CaraCapaOwner,
} from 'src/cara/schema/cara-capaowner.schema';
import { Clauses, ClausesSchema } from 'src/systems/schema/clauses.schema';
import {
  MailTemplate,
  mailTemplateSchema,
} from 'src/mailtemplate/schema/mailTemplate.schema';
import { DocumentsService } from 'src/documents/documents.service';
import { EntityService } from 'src/entity/entity.service';
import { Analyse, AnalyseSchema } from 'src/cara/schema/analyse.schema';
import { CapaDefects, CaraDefects } from 'src/cara/schema/cara-defects.schema';
import {
  CaraRcaSettings,
  cararcasettingsSchema,
} from 'src/cara/schema/cara-rca-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MRM.name, schema: MRMDocument },
      { name: ScheduleMRM.name, schema: ScheduleMRMDocument },
      { name: MeetingType.name, schema: MeetingTypeDocument },
      { name: ActionPoint.name, schema: ActionPointDocument },
      { name: Agenda.name, schema: AgendaDocument },
      { name: Meeting.name, schema: MeetingDocument },
      { name: ActionItems.name, schema: actionitemsSchema },
      { name: Refs.name, schema: RefsSchema },
      { name: cara_settings.name, schema: carasettingsSchema },
      { name: CaraComments.name, schema: CapaComments },
      { name: CaraCapaOwner.name, schema: CapaCapaOwner },
      { name: Clauses.name, schema: ClausesSchema },
      { name: MailTemplate.name, schema: mailTemplateSchema },
      { name: Analyse.name, schema: AnalyseSchema },
      { name: CaraDefects.name, schema: CapaDefects },
      { name: CaraRcaSettings.name, schema: cararcasettingsSchema },
    ]),
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
    MongooseModule.forFeature([{ name: cara.name, schema: caraSchema }]),
    SerialNumberModule,
    OrganizationModule,
    UserModule,
    AuthenticationModule,
    LocationModule,
  ],
  controllers: [MRMController],
  providers: [
    MRMService,
    SerialNumberService,
    EmailService,
    CaraService,
    RefsService,
    DocumentsService,
    EntityService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class MRMModule {}
