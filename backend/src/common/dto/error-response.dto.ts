import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({ example: 'Unauthorized' })
    message: string;

    @ApiProperty({ example: 401 })
    statusCode: number;
}
