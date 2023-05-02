import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  initiatorId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  receiverId: string;

  @Prop({ required: true, type: Types.ObjectId })
  refId: string;

  @Prop({ default: 'post' })
  refType: 'post' | 'comment';

  @Prop({ required: true })
  type: string;

  @Prop({ default: false })
  isSeen: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export interface PartialNotification {
  initiatorId: string;
  receiverId: string;
  refId: string;
  type: string;
  refType?: 'post' | 'comment';
  isSeen?: boolean;
}
