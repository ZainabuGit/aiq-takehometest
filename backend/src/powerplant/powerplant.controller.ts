import {Controller, Get, Query,UseGuards } from '@nestjs/common';
import { PowerplantService } from './powerplant.service';
import { ApiTags, ApiBearerAuth ,ApiOperation, ApiResponse , ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('powerplants')
@ApiBearerAuth('access-token')
@Controller('powerplants')
export class PowerplantController {
    constructor(
        private readonly powerplantService: PowerplantService

    ) {}

    @Get('test')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Test endpoint to verify JWT access' })
    @ApiResponse({ status: 200, description: 'Test successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
    getTest() {
        return { message: 'Test successful' };
    }


    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get top N powerplants for a given state' })
    @ApiQuery({ name: 'state', required: true, description: 'State code (e.g. TX, CA)' })
    @ApiQuery({ name: 'top', required: true, description: 'Top N plants to return' })
    @ApiResponse({ status: 200, description: 'List of top powerplants' })
    @ApiResponse({ status: 400, description: 'Missing or invalid query parameters', type: ErrorResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
    @ApiResponse({ status: 500, description: 'Internal server error', type: ErrorResponseDto })
    getTopPlants(@Query('state') state: string, @Query('top') top: number) {
        console.log('Received:', state, top);

        const result = this.powerplantService.getTopPlants(state, Number(top));
        console.log('Returning:', result);

        return result;
    }

    @Get('states')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get list of all US state codes present in memory' })
    @ApiResponse({ status: 200, description: 'List of available state codes (e.g. ["TX", "CA", "NY"])' })
    @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
    getAvailableStates() {
        return this.powerplantService.getAllStates();
    }
}
