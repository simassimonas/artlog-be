import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  from: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  to: string;

  @Prop({ required: true, type: Types.ObjectId })
  content: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
