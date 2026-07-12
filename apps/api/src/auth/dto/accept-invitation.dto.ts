import { IsString, IsUUID, MinLength } from 'class-validator';

export class AcceptInvitationDto {
  /** ID del registro Member (enviado como `token` en el link de invitación). */
  @IsUUID()
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
