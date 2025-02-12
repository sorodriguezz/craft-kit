<p align="center"> <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a> </p> <p align="center"> <a href='https://img.shields.io/npm/l/resilience-kit'><img src="https://img.shields.io/npm/l/resilience-kit" alt="MIT License" /></a> </p>

**Craft Kit** is a library that provides utilities for developers, facilitating the implementation of common functionalities.

## 🚀 Main Features

- ✅ Password Generation:
  - ✅ Simple Generation.
  - ✅ Generation with Crypto.

## 📦 Installation

You can install it using [NPM](https://www.npmjs.com/):

```bash
npm install craft-kit
```

Or using [Yarn](https://yarnpkg.com/):

```bash
yarn add craft-kit
```

### Requirements

- NestJS (v9 or higher recommended).
- Node.js 16+

## 📌 Basic Usage in NestJS

Import the module:

```typescript
import { Module } from "@nestjs/common";
import { UtilsModule } from "craft-kit";

@Module({
  imports: [UtilsModule],
})
export class AppModule {}
```

### Password Generation

The library allows you to generate passwords using two main strategies.

#### SIMPLE Strategy

Use the SIMPLE strategy to generate a password with random characters:

```typescript
import { PasswordFacade } from "craft-kit";
import type { ISimplePasswordParams } from "craft-kit";

const passwordFacade = new PasswordFacade(/* dependency injection in NestJS */);
const simpleParams: ISimplePasswordParams = {
  length: 12,
  useUppercase: true,
  useLowercase: true,
  useDigits: true,
  useSymbols: false,
};

const passwordSimple = passwordFacade.generatePassword("SIMPLE", simpleParams);
console.log("SIMPLE Password:", passwordSimple);
```

#### PBKDF2 Strategy

Use the PBKDF2 strategy for secure password generation, relying on a key derivation algorithm:

```typescript
import { PasswordFacade } from "craft-kit";
import type { IPBKDF2PasswordParams } from "craft-kit";

const pbkdf2Params: IPBKDF2PasswordParams = {
  password: "miPasswordSecreto",
  salt: "salAleatoria",
  iterations: 100000,
  keylen: 64,
  digest: "sha512",
  encoding: "hex",
};

const passwordPBKDF2 = passwordFacade.generatePassword("PBKDF2", pbkdf2Params);
console.log("PBKDF2 Password:", passwordPBKDF2);
```

#### Registering New Strategies

If you want to extend the functionality, you can register custom strategies using the ```registerStrategy``` method:

```typescript
passwordFacade.registerStrategy("CUSTOM", myCustomPasswordStrategy);
```

#### Direct Use of the Password Service

You can also use the PasswordService to dynamically switch strategies:

```typescript
import { PasswordService } from "craft-kit";
import { SimplePassword } from "craft-kit";

const passwordService = new PasswordService(new SimplePassword());
const generated = passwordService.generatePassword({
  length: 10,
  useUppercase: true,
  useLowercase: true,
  useDigits: true,
  useSymbols: true,
});
console.log("Generated Password:", generated);
```

## 📜 License

This project is distributed under the MIT license. You are free to use it in both personal and commercial environments.
