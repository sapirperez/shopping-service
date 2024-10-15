import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto';
import { ICreateUserResponse, IUsersResponse } from './interfaces';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get()
    getUsers(@Query('orderby') orderBy?: string, @Query('searchPhrase') searchPhrase?: string): Promise<IUsersResponse> {
      return this.userService.getUsers(orderBy, searchPhrase);
    }
    
    @Get(':id')
    getUser(@Param('id') id: string): Promise<User> {
      return this.userService.getUserById(id);
    }
    
    @Post()
    createUser(@Body() user: CreateUserDto): Promise<ICreateUserResponse> {
        return this.userService.createUser(user);
    }
}
