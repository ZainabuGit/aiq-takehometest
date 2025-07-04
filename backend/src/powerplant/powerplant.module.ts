import { Module } from '@nestjs/common';
import { PowerplantController } from './powerplant.controller';
import { PowerplantService } from './powerplant.service';

@Module({

  controllers: [PowerplantController],
  providers: [PowerplantService],
  exports: [PowerplantService]
})
export class PowerplantModule {}


