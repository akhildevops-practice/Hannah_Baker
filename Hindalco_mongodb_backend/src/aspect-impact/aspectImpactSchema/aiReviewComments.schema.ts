import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AiReviewComments extends Document {
  @Prop({ type: String })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: 'aspectimpact' })
  riskId: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;
}

export const aiReviewCommentsSchema =
  SchemaFactory.createForClass(AiReviewComments);
