import { Module } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { PasswordFacade } from "./password.facade";

@Module({
  providers: [PasswordFacade],
  exports: [PasswordFacade],
})
export class PasswordModule {}
