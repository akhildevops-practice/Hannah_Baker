import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true })
export class HiraSteps extends Document {

  @Prop({ type: Number, default: 1 })
  sNo: number;

  @Prop({ type: String, default: '1.1' })
  subStepNo: string;

  @Prop({type: String})
  jobBasicStep: string;

  @Prop({ type: String })
  hazardType: string;

  @Prop({ type: String })
  hazardDescription: string;

  @Prop({ type: String})
  impactText: string;

  @Prop({ type: String })
  existingControl: string;

  @Prop({ type: Number, default: 1 })
  preSeverity: number;

  @Prop({ type: Number, default: 1 })
  preProbability: number;

  @Prop({ type: Number, default: 0 })
  preMitigationScore: number

  @Prop({ type: String})
  additionalControlMeasure: string;

  @Prop({ type: String})
  responsiblePerson: string;

  @Prop({ type: String})
  implementationStatus: string;

  @Prop({ type: Number, default: 1 })
  postSeverity: number;

  @Prop({ type: Number, default: 1 })
  postProbability: number;

  @Prop({ type: Number, default: 0 })
  postMitigationScore: number;

  @Prop({ type: String})
  status: string;

  @Prop({ type: String })
  locationId: string;

  @Prop({ type: String })
  entityId: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: Date, default : null })
  deletedAt : Date
}

export const HiraStepsSchema = SchemaFactory.createForClass(HiraSteps);

