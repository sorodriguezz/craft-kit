import { SimplePassword } from "./simple-password.service";
import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { PasswordFacade } from "./password.facade";
import { PBKDF2Password } from "./pbkdf2-password.service";

@Module({
  providers: [PasswordFacade, PasswordService, SimplePassword, PBKDF2Password],
  exports: [PasswordFacade, PasswordService],
})
export class PasswordModule {}
