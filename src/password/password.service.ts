import { Injectable } from "@nestjs/common";
import { SimplePassword } from "./simple-password.service";
import { IParamsGenerate } from "./params-generate.interface";
import { IPasswordStrategy } from "./password-strategy";

@Injectable()
export class PasswordService {
  private strategy: IPasswordStrategy;

  constructor(strategy?: IPasswordStrategy) {
    this.strategy = strategy || new SimplePassword();
  }

  setStrategy(strategy: IPasswordStrategy) {
    this.strategy = strategy;
  }

  generatePassword(params: IParamsGenerate): string {
    return this.strategy.generate(params);
  }
}
