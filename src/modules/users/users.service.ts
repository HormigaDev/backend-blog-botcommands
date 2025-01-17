import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from 'src/common/enums/UserStatus.enum';
import { PaginationInterface } from 'src/common/interfaces/pagination.interface';
import { ServiceInterface } from 'src/common/interfaces/service.interface';
import { User } from 'src/common/models/user.entity';
import { UtilsService } from 'src/common/services/utils.service';
import { CreateUserDto } from 'src/common/validators/create-user.dto';
import { UpdateUserDto } from 'src/common/validators/update-user.dto';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService
    extends UtilsService<User, UpdateUserDto>
    implements ServiceInterface<User, CreateUserDto, UpdateUserDto>
{
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly authService: AuthService,
    ) {
        super(usersRepository);
    }

    async create(dto: CreateUserDto): Promise<User> {
        try {
            await this.checkUserExists(dto.email);
            let user = new User();
            user.email = dto.email;
            user.password = await this.authService.hashPassword(dto.password);
            user.name = dto.name;
            user = await this.usersRepository.save(user);
            return user;
        } catch (error) {
            this.handleError('UsersService/create', error);
        }
    }

    async findAll(pagination: PaginationInterface): Promise<User[]> {
        try {
            if (pagination.page < 1 || pagination.limit < 1) {
                throw new BadRequestException('Invalid pagination');
            }
            return await this.usersRepository.find({
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit,
            });
        } catch (error) {
            this.handleError('UsersService/findAll', error);
        }
    }

    async countAll(): Promise<number> {
        try {
            return await this.usersRepository.count();
        } catch (error) {
            this.handleError('UsersService/countAll', error);
        }
    }

    async findOne(id: number): Promise<User> {
        try {
            const user = await this.usersRepository.findOneBy({ id });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            this.handleError('UsersService/findOne', error);
        }
    }

    async findOneByEmail(email: string): Promise<User> {
        try {
            const user = await this.usersRepository.findOneBy({ email });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            this.handleError('UsersService/findOneByEmail', error);
        }
    }

    async update(id: number, dto: UpdateUserDto): Promise<User> {
        try {
            const user = await this.findOne(id);
            await this.updateEntity(user.id, dto);
            return await this.findOne(id);
        } catch (error) {
            this.handleError('UsersService/update', error);
        }
    }

    async updatePassword(id: number, newPassword: string) {
        try {
            const password = await this.authService.hashPassword(newPassword);
            await this.usersRepository
                .createQueryBuilder()
                .update()
                .set({ password })
                .where('id = :id', { id })
                .execute();
        } catch (error) {
            this.handleError('UsersService/updatePassword', error);
        }
    }

    async delete(id: number): Promise<User> {
        try {
            const user = await this.findOne(id);
            await this.usersRepository
                .createQueryBuilder()
                .update()
                .set({ status: UserStatus.Deleted })
                .where('id = :id', { id })
                .execute();
            return user;
        } catch (error) {
            this.handleError('UsersService/delete', error);
        }
    }

    private async checkUserExists(email: string): Promise<void> {
        try {
            const exists = !!(await this.usersRepository.findOneBy({ email }));
            if (exists) {
                throw new ConflictException('User already exists');
            }
        } catch (error) {
            this.handleError('UsersService/checkUserExists', error);
        }
    }
}
