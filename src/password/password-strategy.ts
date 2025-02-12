import { IParamsGenerate } from "./params-generate.interface";

export interface IPasswordStrategy {
  generate(params: IParamsGenerate): string;
}
