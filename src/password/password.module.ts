import { SimplePassword } from "./simple-password.service";
import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { PasswordFacade } from "./password.facade";

@Module({
  providers: [PasswordFacade, PasswordService, SimplePassword],
  exports: [PasswordFacade, PasswordService],
})
export class PasswordModule {}
