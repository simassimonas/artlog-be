import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Art' })
  artId: string;

  @Prop({ required: true })
  timezone: string;

  //   @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Art' })
  //   art: Art;

  //   @Prop({ type: [{ userId: { type: MongooseSchema.Types.ObjectId, ref: 'User' }, content: String }] })
  //   comments: Comment[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  likes: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [{ type: String }], default: [] })
  tags: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
