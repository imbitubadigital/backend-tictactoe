import { JwtPayload } from './../auth/models/jwt-payload.model';
import { UserSchema } from './schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { User } from './models/user.model';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { SigninDto } from './dto/signin.dto';
import { UpdateUserDto } from './dto/userUpdate.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly usersModel: Model<User>,
    private readonly authService: AuthService,
  ) {}

  public async findAll(): Promise<User[]> {
    return this.usersModel.find();
  }

  public async signup(signupDto: SignupDto): Promise<User> {
    const checkEmail = await this.findByEmailExist(signupDto.email);
    if (!checkEmail) {
      const user = new this.usersModel(signupDto);
      return user.save();
    }
  }
  public async signin(
    signinDto: SigninDto,
  ): Promise<{ name: string; email: string; jwtToken: string }> {
    const user = await this.findByEmail(signinDto.email);
    const match = await this.checkPassword(signinDto.password, user);
    if (!match) {
      throw new NotFoundException('Invalid credentials.');
    }
    const { _id, name, email } = user;
    const jwtToken = await this.authService.createAccessToken(_id);

    return { name, email, jwtToken };
  }

  public async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  private async findByEmailExist(email: string): Promise<boolean> {
    const user = await this.usersModel.findOne({ email });
    if (user) {
      throw new NotFoundException('Este email já está sendo utilizado.');
    }

    return false;
  }
  private async findByEmail(email: string): Promise<User> {
    const user = await this.usersModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('Email e/ou senha não conferem.');
    }

    return user;
  }

  private async checkPassword(password: string, user: User): Promise<boolean> {
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new NotFoundException('Email e/ou senha não conferem.');
    }

    return match;
  }
}
