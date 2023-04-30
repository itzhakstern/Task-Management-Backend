import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { getTasksFilterDto } from './dto/get-tasks-filter.dto';
import { Test } from '@nestjs/testing';
import { taskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';

describe('TasksService', () => {
  let tasksService: TasksService;
  let tasksRepository: Repository<Task>;

  beforeEach(async () => {
    tasksRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      }),
    } as unknown as Repository<Task>;

    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: tasksRepository,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
  });

  describe('getTasks', () => {
    it('should return an array of tasks', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: taskStatus.OPEN,
          user: new User(),
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Description 2',
          status: taskStatus.OPEN,
          user: new User(),
        },
      ];

      (
        tasksRepository.createQueryBuilder().where as jest.Mock
      ).mockReturnThis();
      (
        tasksRepository.createQueryBuilder().andWhere as jest.Mock
      ).mockReturnThis();
      (
        tasksRepository.createQueryBuilder().getMany as jest.Mock
      ).mockReturnValue(mockTasks);

      const filterDto: getTasksFilterDto = {
        status: taskStatus.OPEN,
        search: 'Task 1',
      };
      const user = { id: '1', username: 'user1', password: 'password1' } as any;

      const tasks = await tasksService.getTasks(filterDto, user);

      expect(tasks).toEqual(mockTasks);
    });
  });
});
