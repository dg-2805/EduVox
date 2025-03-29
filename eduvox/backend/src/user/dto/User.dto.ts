import {
  IsEmail,
  Matches,
  MaxLength,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class UserDTO {
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*])/, {
    message:
      'Password must contain at least 1 upper case letter, 1 number, and 1 special character',
  })
  hash_password: string;
}
