import { 
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';


@Controller('notes')
export class NotesController {
    constructor(
        private readonly notesService: NotesService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async createNote(
        @Body() body: CreateNoteDto,
        @Req() request: any,
    ) {
        return this.notesService.createNote(
            body,
            request.user.sub,
        )
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getNotes(
        @Req() request: any,
    ) {
        return this.notesService.getNotes(
            request.user.sub
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getNoteById(
        @Param('id') id: string,
        @Req() request: any,
    ) {
        return this.notesService.getNoteById(
            Number(id),
            request.user.sub,
        );
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async updateNote(
        @Param('id') id: string,
        @Body() body: UpdateNoteDto,
        @Req() request: any,
    ) {
        return this.notesService.updateNote(
            Number(id),
            body,
            request.user.sub,
        )
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteNote(
        @Param('id') id: string,
        @Req() request: any,
    ) {
        return this.notesService.deleteNote(
            Number(id),
            request.user.sub,
        )
    }
}
