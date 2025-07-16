import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { EntityController } from './entity.controller';
import { EntityService } from './entity.service';

@Module({
    imports: [AuthenticationModule, UserModule],
    controllers: [EntityController],
    providers: [EntityService, PrismaService],
    exports: [EntityService]
})
export class EntityModule {}
