import { ApiProperty } from '@nestjs/swagger';

export class ProbeResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';
}

export class ErrorResponseDto {
  @ApiProperty({ example: 503 })
  statusCode!: number;

  @ApiProperty({ example: 'NOT_READY' })
  code!: string;

  @ApiProperty({ example: 'Приложение не готово принимать трафик' })
  message!: string;

  @ApiProperty({ example: '3f1c0b4e-6a2d-4f7a-9c1e-2b8d5a7c9e11' })
  requestId!: string;

  @ApiProperty({ example: '2026-10-28T12:00:00.000Z' })
  timestamp!: string;
}
