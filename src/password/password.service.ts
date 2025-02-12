import { Injectable } from "@nestjs/common";
import { SimplePassword } from "./simple-password.service";
import { IPasswordStrategy } from "./password-strategy";
import { ISimplePasswordParams } from "./interfaces/simple-password-params.interface";

@Injectable()
export class PasswordService {
  private strategy: IPasswordStrategy<ISimplePasswordParams>;

  constructor(private readonly simplePassword: SimplePassword) {
    this.strategy = this.simplePassword;
  }

  setStrategy(strategy: IPasswordStrategy<ISimplePasswordParams>): void {
    this.strategy = strategy;
  }

  generatePassword(params: ISimplePasswordParams): string {
    return this.strategy.generate(params);
  }
}
