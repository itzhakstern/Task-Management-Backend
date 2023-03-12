import { IsEnum } from 'class-validator';
import { taskStatus } from '../task-status.enum';

export class updateTaskStatusDto {
  @IsEnum(taskStatus)
  status: taskStatus;
}
