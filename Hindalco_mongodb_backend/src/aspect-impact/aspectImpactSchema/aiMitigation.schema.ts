import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AiMitigation extends Document {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  stage: string;

  @Prop({ type: String })
  status: string;

  @Prop({ type: String })
  owner: string;

  @Prop({ type: Date, default: Date.now })
  targetDate: Date;

  @Prop({ type: Date, default: Date.now })
  completionDate: Date;

  @Prop({ type: String })
  responsiblePerson: string

  @Prop({ type: String })
  comments: string;

  @Prop({ type: Number, default: 0 })
  revisionNumber : number;

  @Prop({ type: String })
  mitigationStatus: string;

  @Prop({
    type: Object,
    refType: { type: String },
    id: { type: String },
    name: { type: String },
    url: { type: String },
  })
  references: {
    refType: string;
    id: string;
    name: string;
    url: string;
  };

  @Prop({ type: Date })
  lastScoreUpdatedAt?: Date;

  @Prop({ type: String })
  lastScore: string;


}
export const aiMitigationSchema =
  SchemaFactory.createForClass(AiMitigation);
