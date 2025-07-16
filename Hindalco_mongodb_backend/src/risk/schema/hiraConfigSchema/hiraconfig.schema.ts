import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class HiraConfig extends Document {
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
  condition: any[];


  @Prop({ type: Array })
  hiraMatrixHeader: any[];


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
  hiraMatrixData: {
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
        riskIndicator: String,
        riskLevel: String,
        description : String,
      },
    ],
  })
  riskLevelData: {
    riskIndicator: string;
    riskIndicatorColor: string;
    riskLevel: string;
    description: string;
  }[];

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

}

export const HiraConfigSchema = SchemaFactory.createForClass(HiraConfig);
