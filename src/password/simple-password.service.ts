import { Injectable } from "@nestjs/common";
import { IPasswordStrategy } from "./password-strategy";
import { ISimplePasswordParams } from "./interfaces/simple-password-params.interface";
import { PasswordConstants } from "../constants/password.constant";
import { DefaultConstants } from "../constants/default.constant";

@Injectable()
export class SimplePassword
  implements IPasswordStrategy<ISimplePasswordParams>
{
  generate(opts: ISimplePasswordParams): string {
    const options = {
      length: opts.length ?? PasswordConstants.DEFAULT_LENGTH_PASSWORD,
      useUppercase: opts.useUppercase ?? DefaultConstants.DEFAULT_TRUE_VALUE,
      useLowercase: opts.useLowercase ?? DefaultConstants.DEFAULT_TRUE_VALUE,
      useDigits: opts.useDigits ?? DefaultConstants.DEFAULT_TRUE_VALUE,
      useSymbols: opts.useSymbols ?? DefaultConstants.DEFAULT_TRUE_VALUE,
    };

    let charset = "";

    if (options.useUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.useLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (options.useDigits) charset += "0123456789";
    if (options.useSymbols) charset += "!@#$%^&*()_+[]{}|;:,.<>?";

    let password = "";

    for (let i = 0; i < options.length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }
}
