import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { taskStatus } from './task-status.enum';
import { createTaskDto } from './dto/create-task.dto';
import { getTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';
import { timeStamp } from 'console';
import { timestamp } from 'rxjs';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService', { timestamp: true });
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async getTasks(filterDto: getTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    try {
      const query = this.tasksRepository.createQueryBuilder('task');
      query.where({ user });
      if (status) {
        query.andWhere('task.status = :status', { status });
      }
      if (search) {
        query.andWhere(
          '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
          { search: `%${search}%` },
        );
      }
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.username
        }". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: createTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    try {
      const task = this.tasksRepository.create({
        title,
        description,
        status: taskStatus.OPEN,
        user,
      });
      await this.tasksRepository.save(task);
      return task;
    } catch (error) {
      this.logger.error(
        `Failed to create task for user "${
          user.username
        }". Data: ${JSON.stringify(createTaskDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.tasksRepository.findOneBy({ id: id, user: user });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  async delateTaskById(id: string, user: User): Promise<void> {
    const deletedTask = await this.tasksRepository.delete({ id, user });
    if (deletedTask.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(
    id: string,
    status: taskStatus,
    user: User,
  ): Promise<Task> {
    try {
      const task = await this.getTaskById(id, user);
      task.status = status;
      await this.tasksRepository.save(task);
      return task;
    } catch (error) {
      this.logger.error(
        `Failed to updated task ${id} to status: ${status} for user "${user.username}"`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }
}
