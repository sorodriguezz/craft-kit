import { PasswordStrategy } from "./password-strategy.type";

export interface IParamsGenerate {
  length: number;
  strategyName: PasswordStrategy;
  useUppercase?: boolean;
  useLowercase?: boolean;
  useDigits?: boolean;
  useSymbols?: boolean;
}
