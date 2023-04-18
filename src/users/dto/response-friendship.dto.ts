import { IsEnum } from 'class-validator';
import { EFriendshipResponse } from 'src/common/constants/friendship-response.enum';

export class FriendshipResponseDto {
  @IsEnum(EFriendshipResponse)
  response: EFriendshipResponse;
}
