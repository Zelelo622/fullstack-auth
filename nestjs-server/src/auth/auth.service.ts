import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { UserService } from "src/user/user.service";
import { AuthMethod, User } from "prisma/__generated__";
import { Request, Response } from "express";
import { LoginDto } from "./dto/login.dto";
import { verify } from "argon2";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  public constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  public async register(req: Request, dto: RegisterDto) {
    const isExists = await this.userService.findByEmail(dto.email);

    if (isExists) {
      throw new Error("Пользователь с такой почтой уже существует");
    }

    const newUser = await this.userService.create(
      dto.email,
      dto.password,
      dto.name,
      "",
      AuthMethod.CREDENTIALS,
      false
    );

    return this.saveSesion(req, newUser);
    // return newUser;
  }

  public async login(req: Request, dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user || !user.password) {
      throw new NotFoundException("Пользователь не найден");
    }

    const isValidPassword = await verify(user.password, dto.password);

    if (!isValidPassword) {
      throw new UnauthorizedException("Неверный пароль");
    }

    return this.saveSesion(req, user);
  }

  public async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          return reject(
            new InternalServerErrorException("Не удалось завершить сессию")
          );
        }

        res.clearCookie(this.configService.getOrThrow("SESSION_NAME"));
        resolve();
      });
    });
  }

  private async saveSesion(req: Request, user: User) {
    return new Promise((resolve, reject) => {
      req.session.userId = user.id;

      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return reject(
            new InternalServerErrorException("Не удалось сохранить сессию")
          );
        }

        resolve({ user });
      });
    });
  }
}
