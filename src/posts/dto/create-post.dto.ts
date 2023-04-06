import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString({ each: true })
  tags: string[];

  @IsNotEmpty()
  @IsString()
  artId: string;

  @IsNotEmpty()
  @IsString()
  timezone: string;
}
