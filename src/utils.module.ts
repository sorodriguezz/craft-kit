import { Module } from "@nestjs/common";
import { PasswordModule } from "./password/password.module";

@Module({
  imports: [PasswordModule],
  exports: [PasswordModule],
})
export class UtilsModule {}
