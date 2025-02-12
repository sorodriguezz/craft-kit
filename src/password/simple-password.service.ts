import { Injectable } from "@nestjs/common";
import { IPasswordStrategy } from "./password-strategy";
import { IParamsGenerate } from "./params-generate.interface";

@Injectable()
export class SimplePassword implements IPasswordStrategy {
  generate(params: IParamsGenerate): string {
    let charset = "";

    if (params.useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (params.useLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (params.useDigits) charset += "0123456789";
    if (params.useSymbols) charset += "!@#$%^&*()_+[]{}|;:,.<>?";

    let password = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
}
