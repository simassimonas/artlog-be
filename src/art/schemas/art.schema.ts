import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type ArtDocument = Art & Document;

@Schema({ timestamps: true })
export class Art {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ required: true })
  prompt: string;
}

export const ArtSchema = SchemaFactory.createForClass(Art);
