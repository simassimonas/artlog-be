import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateArtDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;
}
