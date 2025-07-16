import { Module } from '@nestjs/common';
import { AspectImpactService } from './aspect-impact.service';
import { AspectImpactController } from './aspect-impact.controller';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  aspectImpactSchema,
  AspectImpact,
} from './aspectImpactSchema/aspectImpact.schema';
import {
  RiskConfig,
  RiskConfigSchema,
} from 'src/risk/riskConfigSchema/riskconfig.schema';
import {
  aiMitigationSchema,
  AiMitigation,
} from './aspectImpactSchema/aiMitigation.schema';
import {
  aiReviewCommentsSchema,
  AiReviewComments,
} from './aspectImpactSchema/aiReviewComments.schema';
import {
  AspectImpactConfig,
  AspectImpactConfigSchema,
} from './aspectImpactConfigSchema/aspectImpactConfig.schema';
import {
  AspectType,
  AspectTypeSchema,
} from './aspectTypesSchema/aspectTypes.schema';
import {
  ImpactType,
  ImpactTypeSchema,
} from './impactTypesSchema/impactTypes.schema';
import { Act, ActSchema } from './actSchema/act.schema';
import {
  AspImpConsolidatedStatus,
  AspImpConsolidatedStatusSchema,
} from './aspImpConsolidatedStatusSchema/aspImpConsolidatedStatus.schema';

import {
  AspImpSignificanceConfiguration,
  AspImpSignificanceConfigurationSchema,
} from './aspImpSignicanceConfigurationSchema/aspImpSignicanceConfiguration.schema';

import {
  AspectImpactReviewHistory,
  AspectImpactReviewHistorySchema,
} from './aspectImpactSchema/aspectImpactReviewHistory.schema';

import {
  AspImpChangesTrack,
  AspImpChangesTrackSchema,
} from './aspectImpactSchema/aspImpChangesTrack.schema';

import { EmailService } from 'src/email/email.service';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { OrganizationModule } from 'src/organization/organization.module';

import { CustomLogger } from 'src/audit-trial/logger.provider';
@Module({
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([
      { name: RiskConfig.name, schema: RiskConfigSchema },
      { name: AspectImpact.name, schema: aspectImpactSchema },
      { name: AiMitigation.name, schema: aiMitigationSchema },
      { name: AiReviewComments.name, schema: aiReviewCommentsSchema },
      { name: AspectImpactConfig.name, schema: AspectImpactConfigSchema },
      { name: AspectType.name, schema: AspectTypeSchema },
      { name: ImpactType.name, schema: ImpactTypeSchema },
      { name: Act.name, schema: ActSchema },
      {
        name: AspImpConsolidatedStatus.name,
        schema: AspImpConsolidatedStatusSchema,
      },

      {
        name: AspImpSignificanceConfiguration.name,
        schema: AspImpSignificanceConfigurationSchema,
      },

      {
        name: AspectImpactReviewHistory.name,
        schema: AspectImpactReviewHistorySchema,
      },

      {
        name: AspImpChangesTrack.name,
        schema: AspImpChangesTrackSchema,
      },
    ]),
    SerialNumberModule,
    OrganizationModule,
  ],
  providers: [
    AspectImpactService,
    PrismaService,
    EmailService,
    SerialNumberService, {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
  controllers: [AspectImpactController],
})
export class AspectImpactModule {}
