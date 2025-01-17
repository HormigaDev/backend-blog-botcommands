import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationInterface } from 'src/common/interfaces/pagination.interface';
import { ServiceInterface } from 'src/common/interfaces/service.interface';
import { Role } from 'src/common/models/role.entity';
import { UtilsService } from 'src/common/services/utils.service';
import { CreateRoleDto } from 'src/common/validators/create-role.dto';
import { UpdateRoleDto } from 'src/common/validators/update-role.dto';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService
    extends UtilsService<Role, UpdateRoleDto>
    implements ServiceInterface<Role, CreateRoleDto, UpdateRoleDto>
{
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) {
        super(roleRepository);
    }

    async findByUser(id: number): Promise<Role[]> {
        return this.roleRepository
            .createQueryBuilder('role')
            .innerJoin('user_roles', 'userRole', 'userRole.roleId = role.id')
            .innerJoin('userRole.user', 'user')
            .where('user.id = :id', { id })
            .getMany();
    }

    async create(dto: CreateRoleDto): Promise<Role> {
        try {
            const role = await new Role();
            role.name = dto.name;
            role.permissions = dto.permissions;

            return await this.roleRepository.save(role);
        } catch (error) {
            this.handleError('RolesService/create', error);
        }
    }

    async findAll(pagination: PaginationInterface): Promise<Role[]> {
        try {
            return await this.roleRepository
                .createQueryBuilder()
                .skip(this.page(pagination))
                .take(pagination.limit)
                .getMany();
        } catch (error) {
            this.handleError('RolesService/findAll', error);
        }
    }

    async findOne(id: number): Promise<Role> {
        try {
            const role = await this.roleRepository.findOneBy({ id });
            if (!role) {
                throw new NotFoundException('Role not found');
            }
            return role;
        } catch (error) {
            this.handleError('RolesService/findOne', error);
        }
    }

    async update(id: number, dto: UpdateRoleDto): Promise<Role> {
        try {
            const role = await this.findOne(id);
            await this.updateEntity(role.id, dto);
            return await this.findOne(id);
        } catch (error) {
            this.handleError('RolesService/update', error);
        }
    }

    async delete(id: number): Promise<Role> {
        try {
            const role = await this.findOne(id);
            await this.roleRepository.delete({ id });
            return role;
        } catch (error) {
            this.handleError('RolesService/delete', error);
        }
    }
}
