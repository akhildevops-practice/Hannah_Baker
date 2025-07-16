import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AiOwnwerComments extends Document {
  @Prop({ type: Date, default: Date.now()})
  CommentDate: Date;

  @Prop({ type: String })
  ReviewComments: string;

  @Prop({ type: Types.ObjectId , ref: "aspectimpact" })
  risk: string;

 
}

export const aiOwnerCommentsSchema = SchemaFactory.createForClass(AiOwnwerComments);