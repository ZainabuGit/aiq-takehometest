import {Controller, Post, UploadedFile, UseInterceptors, Get, Query,UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { PowerplantService } from './powerplant.service';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth , ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('powerplants')
@ApiBearerAuth('access-token')
@Controller('powerplants')
export class PowerplantController {
    constructor(
        private readonly powerplantService: PowerplantService

    ) {}

    @Get('test')
    @UseGuards(AuthGuard('jwt'))
    getTest() {
        return { message: 'Test successful' };
    }


    @Get()
    @UseGuards(AuthGuard('jwt'))
    getTopPlants(@Query('state') state: string, @Query('top') top: number) {
        console.log('Received:', state, top);

        const result = this.powerplantService.getTopPlants(state, Number(top));
        console.log('Returning:', result);

        return result;
    }

    // @Post('upload')
    // @UseInterceptors(
    //     FileInterceptor('file', {
    //         storage: diskStorage({
    //             destination: './uploads',
    //             filename: (req, file, cb) => {
    //                 cb(null, `${Date.now()}-${file.originalname}`);
    //             },
    //         }),
    //     }),
    // )
    // @ApiConsumes('multipart/form-data')
    // @ApiBody({
    //     schema: {
    //         type: 'object',
    //         properties: {
    //             file: { type: 'string', format: 'binary' },
    //         },
    //     },
    // })
    // async uploadFile(@UploadedFile() file: Express.Multer.File) {
    //     await this.powerplantService.loadCSV(file.path); // file.path is now valid
    //     return { message: 'CSV uploaded and processed' };
    // }
}
