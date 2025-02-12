export class PasswordConstants {
  static readonly SIMPLE_STRATEGY_PASSWORD = "SIMPLE";
  static readonly PBKDF2_STRATEGY_PASSWORD = "PBKDF2";
  static readonly DEFAULT_LENGTH_PASSWORD = 10;
  static readonly DEFAULT_ENCODIGN_PASSWORD = "hex";
  static readonly DEFAULT_ITERATIONS_PASSWORD = 100000;
  static readonly DEFAULT_KEYLEN_PASSWORD = 64;
  static readonly DEFAULT_DIGEST_PASSWORD = "sha512";
  static readonly VALUE_UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  static readonly VALUE_LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
  static readonly VALUE_DIGITS = "0123456789";
  static readonly VALUE_SYMBOLS = "!@#$%^&*()_+[]{}|;:,.<>?";
}
