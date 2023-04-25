import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type NotificationtDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  initiatorId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  receiverId: string;

  @Prop({ required: true, type: Types.ObjectId })
  refId: string;

  @Prop({ required: true })
  refType: 'Post' | 'Comment';

  @Prop({ required: true })
  type: string;

  @Prop({ default: false })
  isSeen: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
