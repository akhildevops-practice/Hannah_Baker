import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RiskConfig extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  riskCategory: string;

  @Prop({
    type: [
      {
        name: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  })
  condition: any[];

  @Prop({
    type: [
      {
        name: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  })
  riskType: any[];

  @Prop({
    type: [
      {
        name: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  })
  impactType: any[];

  @Prop({ type: Array })
  riskCumulativeHeader: any[];



  @Prop({
    type: [
      {
        criteriaType: String,
        score1Text: String,
        score2Text: String,
        score3Text: String,
        score4Text: String,
        score5Text: String,
      },
    ],
  })
  riskCumulative: {
    criteriaType: string;
    score1Text: string;
    score2Text: string;
    score3Text: string;
    score4Text: string;
    score5Text: string;
  }[];

  @Prop({
    type: [
      {
        criteriaType: String,
        score1Text: String,
        score2Text: String,
        score3Text: String,
        score4Text: String,
      },
    ],
  })
  riskFactorial: {
    criteriaType: string;
    score1Text: string;
    score2Text: string;
    score3Text: string;
    score4Text: string;
  }[];
  
  @Prop({
    type: [
      {
        riskIndicator: String,
        riskLevel: String,
      },
    ],
  })
  riskSignificance: {
    riskIndicator: string;
    riskLevel: string;
  }[];

  @Prop({ type: String })
  computationType: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: String })
  updatedBy: string;
}

export const RiskConfigSchema = SchemaFactory.createForClass(RiskConfig);
