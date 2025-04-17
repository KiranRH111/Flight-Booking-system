import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, Matches } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character'
    })
    password: string;

    @IsString()
    @IsOptional()
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Please provide a valid phone number'
    })
    phoneNumber?: string;
}