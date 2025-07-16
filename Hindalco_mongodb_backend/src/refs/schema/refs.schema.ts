import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Refs extends Document {
  @Prop({ type: String })
  organizationId: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  comments: string;

  @Prop({ type: Types.ObjectId, required: true })
  refTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  refId: Types.ObjectId;

  @Prop({ type: String })
  link: string;

  @Prop({ type: String })
  createdBy: string;

  // @Prop({ type: Date, default: Date.now })
  // createdAt: Date;

  // @Prop({ type: Date, default: Date.now })
  // updatedAt: Date;

  @Prop({ type: String })
  updatedBy: string;
}

export const RefsSchema = SchemaFactory.createForClass(Refs);
