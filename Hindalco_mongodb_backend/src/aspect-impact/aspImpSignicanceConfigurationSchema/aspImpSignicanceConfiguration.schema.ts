import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AspImpSignificanceConfiguration extends Document {
  @Prop({
    type: String,
    enum: ['product', 'severity', 'probability'],
    // required: true,
  })
  ruleType: string;

  @Prop({
    type: String,
    enum: [
      '>=',
      '<=',
      '>',
      '<',
      //   '=='
    ],
    //    required: true
  })
  operator: string;

  @Prop({
    type: Number,
    //  required: true
  })
  value: number;

  @Prop({
    type: Boolean,
    // required: true
  })
  significance: boolean;

  @Prop({
    type: String,
    // required: true
  })
  organizationId: string;
}

export const AspImpSignificanceConfigurationSchema =
  SchemaFactory.createForClass(AspImpSignificanceConfiguration);
