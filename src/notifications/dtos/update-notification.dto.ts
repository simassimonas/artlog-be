import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  isSeen?: boolean;
}