import { Module } from '@nestjs/common';
import { ConnectedAppsController } from './connected-apps.controller';
import { ConnectedAppsService } from './connected-apps.service';
import { AuthenticationModule } from '../authentication/authentication.module'
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [AuthenticationModule],
  controllers: [ConnectedAppsController],
  providers: [ConnectedAppsService,PrismaService]
})
export class ConnectedAppsModule {}
