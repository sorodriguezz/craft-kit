import { Injectable } from "@nestjs/common";
import { UtilsRegistry } from "../utils.registry";
import { IPasswordStrategy } from "./password-strategy";
import { SimplePassword } from "./simple-password.service";
import { IParamsGenerate } from "./params-generate.interface";

import { PasswordStrategy } from "./password-strategy.type";
import { DefaultConstants } from "../constants/default.constant";

@Injectable()
export class PasswordFacade {
  private registry = new UtilsRegistry<PasswordStrategy, IPasswordStrategy>();

  constructor(private readonly simplePassword: SimplePassword) {
    this.registry.register(
      DefaultConstants.DEFAULT_STRATEGY_PASSWORD,
      this.simplePassword
    );
  }

  generatePassword(
    strategyName: PasswordStrategy = DefaultConstants.DEFAULT_STRATEGY_PASSWORD,
    params: IParamsGenerate
  ): string {
    const strategy = this.registry.get(strategyName);

    const paramsGenerate: IParamsGenerate = {
      length: params.length,
      useUppercase: params.useUppercase ?? DefaultConstants.DEFAULT_TRUE_VALUE,
      useLowercase: params.useLowercase ?? DefaultConstants.DEFAULT_TRUE_VALUE,
      useDigits: params.useDigits ?? DefaultConstants.DEFAULT_TRUE_VALUE,
      useSymbols: params.useSymbols ?? DefaultConstants.DEFAULT_TRUE_VALUE,
    };

    return strategy.generate(paramsGenerate);
  }

  registerStrategy(name: PasswordStrategy, strategy: IPasswordStrategy): void {
    this.registry.register(name, strategy);
  }
}
