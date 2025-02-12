import { Injectable } from "@nestjs/common";
import { IPasswordStrategy } from "./password-strategy";

import { NameStrategy } from "./name-strategy.type";
import { IStrategyParamsMap } from "./interfaces/strategy-params-map.interface";

@Injectable()
export class PasswordFacade {
  private registry = new Map<NameStrategy, IPasswordStrategy<any>>();

  registerStrategy<K extends NameStrategy>(
    name: K,
    strategy: IPasswordStrategy<IStrategyParamsMap[K]>
  ): void {
    this.registry.set(name, strategy);
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
