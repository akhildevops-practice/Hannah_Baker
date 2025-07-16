import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AspectImpact extends Document {

  @Prop({ type: Number, default: 1 })
  sNo: number;

  @Prop({ type: String })
  jobTitle: string; // this is lifecycle  stage

  @Prop({ type: String })
  activity: string; //just like job basic step in hira

  @Prop({ type: String })
  section: string;

  @Prop({ type: Types.ObjectId, ref: 'AspectImpactConfig' })
  hiraConfigId: string;

  @Prop({ type: String, ref: 'ImpactType' })
  impactType: string;

  @Prop({ type: String, ref: 'AspectType' })
  aspectType: string;

  @Prop({ type: String, ref: 'Act' })
  act: string;

  @Prop({ type: String })
  condition: string;

  @Prop({ type: Array })
  interestedParties: [];

  @Prop({ type: String })
  legalImpact: string; //yes , no field radio field

  @Prop({ type: String })
  existingControl: string;

  @Prop({ type: String })
  specificEnvAspect: string;

  @Prop({ type: String })
  specificEnvImpact: string;

  @Prop({ type: Array })
  assesmentTeam: [string];

  @Prop([{ type: String, ref: 'AiMitigation' }])
  mitigations: string[];

  @Prop({
    type: [],
  })
  preMitigation: [];

  @Prop({ type: Number, default: 0 })
  preMitigationScore: number;

  @Prop({ type: Number, default: 1 })
  preSeverity: number;

  @Prop({ type: Number, default: 1 })
  preProbability: number;

  @Prop({
    type: [],
  })
  postMitigation: [];

  @Prop({ type: Number, default: 0 })
  postMitigationScore: number;

  @Prop({ type: Number })
  postSeverity: number;

  @Prop({ type: Number })
  postProbability: number;

  @Prop({ type: Number})
  significanceScore: number;

  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: Array })
  attachments: [];

  @Prop({ type: String })
  prefixSuffix: string;

  @Prop({ type: String })
  locationId: string;

  @Prop({ type: String })
  entityId: string;

  @Prop({ type: String })
  createdBy: string;

  @Prop({ type: String })
  updatedBy: string;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  //below are optional not in use
  @Prop({ type: String })
  area: string; //currently form is not using this

  @Prop({ type: Date })
  closeDate: Date;

  @Prop({ type: Array })
  users: [string];

  @Prop({ type: Number, default: 0 })
  revisionNumber : number;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Array })
  reviewers: [string];

  @Prop({ type: Array })
  approvers: [string];

  @Prop({ type: String })
  year: string;

  @Prop({type : String})
  additionalAssessmentTeam : string;
}

export const aspectImpactSchema = SchemaFactory.createForClass(AspectImpact);
