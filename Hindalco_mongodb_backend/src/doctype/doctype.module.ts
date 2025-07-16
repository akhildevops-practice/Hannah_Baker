import { Module } from '@nestjs/common';
import { DoctypeService } from './doctype.service';
import { DoctypeController } from './doctype.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { NotificationModule } from 'src/notification/notification.module';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { CustomLogger } from 'src/audit-trial/logger.provider';

@Module({
  imports: [AuthenticationModule, NotificationModule],
  controllers: [DoctypeController],
  providers: [
    DoctypeService,
    PrismaService,
    SerialNumberService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
  exports: [DoctypeService],
})
export class DoctypeModule {}
