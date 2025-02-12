import { Injectable } from "@nestjs/common";
import { SimplePassword } from "./simple-password.service";
import { IParamsGenerate } from "./params-generate.interface";
import { IPasswordStrategy } from "./password-strategy";

@Injectable()
export class PasswordService {
  private strategy: IPasswordStrategy;

  constructor(private readonly simplePassword: SimplePassword) {
    this.strategy = this.simplePassword;
  }

  setStrategy(strategy: IPasswordStrategy) {
    this.strategy = strategy;
  }

  generatePassword(params: IParamsGenerate): string {
    return this.strategy.generate(params);
  }
}
