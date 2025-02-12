import { DigestPBKDF2 } from "../types/digest-pbkdf2.type";

export interface IPBKDF2PasswordParams {
  password: string;
  salt: string;
  iterations?: number;
  keylen?: number;
  digest?: DigestPBKDF2;
  encoding?: BufferEncoding;
}
