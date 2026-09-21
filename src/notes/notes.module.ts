import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthModule } from '../auth/jwt-auth.module';

@Module({
  imports: [
    PrismaModule,
    JwtAuthModule,
  ],
  controllers: [NotesController],
  providers: [NotesService]
})
export class NotesModule {}
