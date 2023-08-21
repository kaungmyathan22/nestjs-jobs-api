import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      if (error.code === '23505') {
        // Handle duplicate key violation error here
        throw new HttpException(
          'User with this email already exists.',
          HttpStatus.CONFLICT,
        );
      } else {
        throw error; // Re-throw other errors
      }
    }
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException(
        `The user with given id ${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(
      { id },
      {
        ...updateUserDto,
      },
    );
    if (result.affected) {
      return this.findOne(id);
    }
    throw new HttpException(
      `The user with given id ${id} not found`,
      HttpStatus.NOT_FOUND,
    );
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.delete(user.id);
    return {
      success: true,
    };
  }
}
