import { Injectable } from "@nestjs/common";
import { IPasswordStrategy } from "./password-strategy";

import { NameStrategy } from "./types/name-strategy.type";
import { IStrategyParamsMap } from "./interfaces/strategy-params-map.interface";
import { UtilsRegistry } from "../utils.registry";
import { SimplePassword } from "./simple-password.service";
import { PasswordConstants } from "../constants/password.constant";
import { PBKDF2Password } from "./pbkdf2-password.service";

@Injectable()
export class PasswordFacade {
  private registry = new UtilsRegistry<
    NameStrategy | string,
    IPasswordStrategy<any>
  >();

  constructor(
    private readonly simplePassword: SimplePassword,
    private readonly pbkdf2Password: PBKDF2Password
  ) {
    this.registry.register(
      PasswordConstants.SIMPLE_STRATEGY_PASSWORD,
      this.simplePassword
    );
    this.registry.register(
      PasswordConstants.PBKDF2_STRATEGY_PASSWORD,
      this.pbkdf2Password
    );
  }

  registerStrategy<K extends NameStrategy>(
    name: K | string,
    strategy: IPasswordStrategy<IStrategyParamsMap[K]>
  ): void {
    this.registry.register(name, strategy);
  }

  generatePassword<K extends NameStrategy>(
    strategyName: K,
    params: IStrategyParamsMap[K]
  ): string {
    const strategy = this.registry.get(strategyName);

    if (!strategy) {
      throw new Error(`Strategy ${strategyName} is not registered.`);
    }

    return (strategy as IPasswordStrategy<IStrategyParamsMap[K]>).generate(
      params
    );
  }
}
