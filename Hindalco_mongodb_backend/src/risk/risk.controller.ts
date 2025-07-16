import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RiskConfigService } from './riskconfig.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';

@Controller('/api/risk')
export class RiskController {
  constructor(private readonly riskConfigService: RiskConfigService) {}

  

  @UseGuards(
    AuthenticationGuard, 
    // AbilityGuard
    )
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post()
  create(@Body() data: any, @Req() req: any) {
    return this.riskConfigService.create(data, req.user.id);
  }

  
}
