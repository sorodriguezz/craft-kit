import { Injectable } from "@nestjs/common";
import { UtilsRegistry } from "../utils.registry";
import { IPasswordStrategy } from "./password-strategy";
import { SimplePassword } from "./simple-password.service";
import { IParamsGenerate } from "./params-generate.interface";

import { PasswordStrategy } from "./password-strategy.type";
import { DefaultConstants } from "../constants/default.constant";
import { PasswordConstants } from "../constants/password.constant";

@Injectable()
export class PasswordFacade {
  private registry = new UtilsRegistry<
    PasswordStrategy | string,
    IPasswordStrategy
  >();

  constructor(private readonly simplePassword: SimplePassword) {
    this.registry.register(
      PasswordConstants.DEFAULT_STRATEGY_PASSWORD,
      this.simplePassword
    );
  }

  /**
   * Generates a password based on the provided parameters.
   *
   * @param length - The length of the password. **Default value: 10.**
   * @param strategyName - The password generation strategy. **Default value: "SIMPLE".**
   * @param useUppercase - Indicates whether uppercase letters should be included. **Default value: true.**
   * @param useLowercase - Indicates whether lowercase letters should be included. **Default value: true.**
   * @param useDigits - Indicates whether digits should be included. **Default value: true.**
   * @param useSymbols - Indicates whether symbols should be included. **Default value: true.**
   * @returns The generated password.
   */
  generatePassword(opts: IParamsGenerate): string {
    const options = {
      length: opts.length ?? PasswordConstants.DEFAULT_LENGTH_PASSWORD,
      strategyName:
        opts.strategyName ?? PasswordConstants.DEFAULT_STRATEGY_PASSWORD,
      useUppercase: opts.useUppercase ?? DefaultConstants.DEFAULT_TRUE_VALUE,
      useLowercase: opts.useLowercase ?? DefaultConstants.DEFAULT_TRUE_VALUE,
      useDigits: opts.useDigits ?? DefaultConstants.DEFAULT_TRUE_VALUE,
      useSymbols: opts.useSymbols ?? DefaultConstants.DEFAULT_TRUE_VALUE,
    };

    const strategy = this.registry.get(options.strategyName);

    return strategy.generate(options);
  }

  /**
   * Registers a new password generation strategy.
   *
   * @param name - The name of the strategy to register.
   * @param strategy - The password strategy instance that implements `IPasswordStrategy`.
   *
   * @remarks
   * This method adds the provided strategy to the internal registry,
   * allowing it to be used later for generating passwords.
   */
  registerStrategy(name: string, strategy: IPasswordStrategy): void {
    this.registry.register(name, strategy);
  }
}
