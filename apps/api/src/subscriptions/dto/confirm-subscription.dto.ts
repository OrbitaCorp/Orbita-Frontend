import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmSubscriptionDto {
  // Id del preapproval que MP devuelve en la URL de vuelta. Se usa solo para
  // ir a preguntarle a MP el estado real — nunca se toma como prueba de pago.
  @IsString()
  @IsNotEmpty()
  preapprovalId!: string;
}
