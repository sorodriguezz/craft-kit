<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
    <a href='https://img.shields.io/npm/l/resilience-kit'><img src="https://img.shields.io/npm/l/resilience-kit" alt="MIT License" /></a>
</p>

**Dev Kit** es una biblioteca que provee utilidades para desarrolladores, facilitando la implementación de funcionalidades comunes.

## 🚀 Características principales

- ✅ Generación de contraseñas:
  - ✅ Generación Simple.
  - ✅ Generación con Crypto.

## 📦 Instalación

Puedes realizar la instalación con [NPM](https://www.npmjs.com/):

```bash
npm install dev-kit
```

O usando [Yarn](https://yarnpkg.com/):

```bash
yarn add dev-kit
```

### Requisitos

- NestJS (v9 o superior recomendado).
- Node.js 16+

## 📌 Uso básico en NestJS

Importar el módulo:

```typescript
import { Module } from "@nestjs/common";
import { UtilsModule } from "dev-kit";

@Module({
  imports: [UtilsModule],
})
export class AppModule {}
```

### Generación de Contraseñas

La librería permite generar contraseñas utilizando dos estrategias principales.

#### Estrategia SIMPLE

Utiliza la estrategia SIMPLE para generar una contraseña con caracteres aleatorios:

```typescript
import { PasswordFacade } from "dev-kit/src/password/password.facade";
import type { ISimplePasswordParams } from "dev-kit/src/password/interfaces/simple-password-params.interface";

const passwordFacade =
  new PasswordFacade(/* inyección de dependencias en NestJS */);
const simpleParams: ISimplePasswordParams = {
  length: 12,
  useUppercase: true,
  useLowercase: true,
  useDigits: true,
  useSymbols: false,
};

const passwordSimple = passwordFacade.generatePassword("SIMPLE", simpleParams);
console.log("Contraseña SIMPLE:", passwordSimple);
```

#### Estrategia PBKDF2

Utiliza la estrategia PBKDF2 para una generación de contraseña segura, apoyándose en un algoritmo de derivación de claves:

```typescript
import { PasswordFacade } from "dev-kit/src/password/password.facade";
import type { IPBKDF2PasswordParams } from "dev-kit/src/password/interfaces/pbkdf2-password-params.interface";

const pbkdf2Params: IPBKDF2PasswordParams = {
  password: "miPasswordSecreto",
  salt: "salAleatoria",
  iterations: 100000,
  keylen: 64,
  digest: "sha512",
  encoding: "hex",
};

const passwordPBKDF2 = passwordFacade.generatePassword("PBKDF2", pbkdf2Params);
console.log("Contraseña PBKDF2:", passwordPBKDF2);
```

#### Registro de Nuevas Estrategias

Si deseas ampliar la funcionalidad, puedes registrar estrategias personalizadas a través del método `registerStrategy`:

```typescript
passwordFacade.registerStrategy("CUSTOM", myCustomPasswordStrategy);
```

#### Uso Directo del Servicio de Contraseña

También puedes usar el PasswordService para cambiar de estrategia de manera dinámica:

```typescript
import { PasswordService } from "dev-kit/src/password/password.service";
import { SimplePassword } from "dev-kit/src/password/simple-password.service";

const passwordService = new PasswordService(new SimplePassword());
const generated = passwordService.generatePassword({
  length: 10,
  useUppercase: true,
  useLowercase: true,
  useDigits: true,
  useSymbols: true
});
console.log("Password generado:", generated);
```

## 📜 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Puedes usarlo libremente en entornos personales y comerciales.