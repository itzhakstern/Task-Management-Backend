import { IsEnum, IsOptional, IsString } from 'class-validator';
import { taskStatus } from '../task-status.enum';

export class getTasksFilterDto {
  @IsOptional()
  @IsEnum(taskStatus)
  status: taskStatus;

  @IsOptional()
  @IsString()
  search: string;
}
