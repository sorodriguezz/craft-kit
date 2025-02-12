import { Injectable } from "@nestjs/common";
import { IPasswordStrategy } from "./password-strategy";
import { IPBKDF2PasswordParams } from "./interfaces/pbkdf2-password-params.interface";
import { pbkdf2Sync } from "crypto";
import { PasswordConstants } from "../constants/password.constant";

@Injectable()
export class PBKDF2Password
  implements IPasswordStrategy<IPBKDF2PasswordParams>
{
  generate(options: IPBKDF2PasswordParams): string {
    const {
      password,
      salt,
      iterations = PasswordConstants.DEFAULT_ITERATIONS_PASSWORD,
      keylen = PasswordConstants.DEFAULT_KEYLEN_PASSWORD,
      digest = PasswordConstants.DEFAULT_DIGEST_PASSWORD,
      encoding = PasswordConstants.DEFAULT_ENCODIGN_PASSWORD,
    } = options;
    const derivedKey = pbkdf2Sync(password, salt, iterations, keylen, digest);
    return derivedKey.toString(encoding);
  }
}
