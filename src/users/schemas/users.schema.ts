import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: false })
  isPrivate?: boolean;

  @Prop()
  profilePic?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// export interface IUser extends Document {
//   readonly _id: string;
//   firstName: string;
//   lastName: string;
//   username: string;
//   email: string;
//   password: string;
// }
