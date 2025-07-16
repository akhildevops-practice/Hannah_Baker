import { Module } from '@nestjs/common';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { SerialNumberController } from './serial-number.controller';
import { SerialNumberService } from './serial-number.service';
import { CustomLogger } from 'src/audit-trial/logger.provider';

@Module({
  exports: [SerialNumberService],
  imports: [AuthenticationModule],
  controllers: [SerialNumberController],
  providers: [
    SerialNumberService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class SerialNumberModule {}
