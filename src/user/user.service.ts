import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { ICreateUserResponse, IUsersResponse } from './interfaces';
import { CreateUserDto } from './dto/create-user.dto';
const { v4: uuidv4 } = require('uuid');

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
      ) {}

    async getUsers(orderBy?: string, searchPhrase?: string): Promise<IUsersResponse> {
        const queryBuilder = this.usersRepository.createQueryBuilder('user');
        if(orderBy) {
            if(['firstName', 'lastName', 'createTime'].includes(orderBy)) {
                queryBuilder.orderBy(`user.${orderBy}`);
            } else {
                throw new HttpException('orderBy must be one of the following values: firstName, lastName, createTime', HttpStatus.BAD_REQUEST);
            }
        }
        
        if(searchPhrase) {
            queryBuilder.where(`
                user.firstName LIKE :searchPhrase 
                or user.lastName LIKE :searchPhrase 
                or user.userName LIKE :searchPhrase`, { searchPhrase: `%${searchPhrase}%` })
        }
        const total = await queryBuilder.getCount();
        const users = await queryBuilder.getMany();
        return { total, users };
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) {
            throw new HttpException("user not found", HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async createUser(user: CreateUserDto): Promise<ICreateUserResponse> {
        const newUser = new User();
        newUser.id = uuidv4();
        newUser.firstName = user.firstName;
        newUser.lastName = user.lastName;
        newUser.userName = user.userName;
         
        const response = await this.usersRepository.save(newUser);
        return { userId: response.id };
    }
}
