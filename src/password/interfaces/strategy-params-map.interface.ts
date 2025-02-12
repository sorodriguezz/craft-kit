import type { IPBKDF2PasswordParams } from "./pbkdf2-password-params.interface";
import type { ISimplePasswordParams } from "./simple-password-params.interface";

export interface IStrategyParamsMap {
  SIMPLE: ISimplePasswordParams;
  PBKDF2: IPBKDF2PasswordParams;
}
