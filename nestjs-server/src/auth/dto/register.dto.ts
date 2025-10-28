import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate
} from "class-validator";
import { IsPasswordsMatchingConstraint } from "src/libs/common/decorators/is-passwords-matching-constraint.decorator";

export class RegisterDto {
  @IsString({ message: "Имя должно быть строкой" })
  @IsNotEmpty({ message: "Имя не должно быть пустым" })
  name: string;

  @IsString({ message: "Почта должен быть строкой" })
  @IsEmail({}, { message: "Некорректный формат почты" })
  @IsNotEmpty({ message: "Почта не должна быть пустой" })
  email: string;

  @IsString({ message: "Пароль должен быть строкой" })
  @IsNotEmpty({ message: "Пароль не должен быть пустым" })
  @MinLength(6, { message: "Минимальная длина пароля - 6 символов" })
  password: string;

  @IsString({ message: "Пароль подтверждения должен быть строкой" })
  @IsNotEmpty({ message: "Пароль подтверждения не должен быть пустым" })
  @MinLength(6, {
    message: "Минимальная длина пароля подтверждения - 6 символов"
  })
  @Validate(IsPasswordsMatchingConstraint, { message: "Пароли не совпадают" })
  passwordRepeat: string;
}
