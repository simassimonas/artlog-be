import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FriendshipDocument = Friendship & Document;

@Schema({ timestamps: true })
export class Friendship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: function (value: string) {
        return value !== this.senderId;
      },
      message: 'senderId must be different from receiverId',
    },
  })
  receiverId: string;

  @Prop({ enum: ['pending', 'accepted'], default: 'pending' })
  status: string;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);
