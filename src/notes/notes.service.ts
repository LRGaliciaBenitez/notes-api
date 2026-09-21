import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async createNote (
        createNoteDto: CreateNoteDto,
        userId: number,
    ) {
        const { title, content } = createNoteDto;

        return this.prisma.note.create({
            data: {
                title,
                content,
                userId,
            },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async getNotes(userId: number) {
        return this.prisma.note.findMany({
            where: {
                userId,
            },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true,
            }
        })
    }

    async getNoteById(
        id: number,
        userId: number
    ) {
        const note = await this.prisma.note.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                userId: true,
            },
        });

        if(!note) {
            throw new NotFoundException(
                `Note with id ${id} not found`,
            );
        }

        if(note.userId !== userId) {
            throw new ForbiddenException(
                `No tienes permiso para consultar esta nota`,
            )
        }

        return {
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
        }
    }

    async updateNote(
        id: number,
        data: UpdateNoteDto,
        userId: number,
    ) {
        const note = await this.prisma.note.findUnique({
            where: {
                id
            },
        })

        if(!note) {
            throw new NotFoundException(
                `Note with id ${id} not found`,
            );
        }

        if(note.userId !== userId) {
            throw new ForbiddenException(
                'No tienes permiso para modificar esta nota',
            )
        }

        return this.prisma.note.update({
            where: {
                id,
            },
            data,
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true,
            }
        })
    }

    async deleteNote(
        id: number,
        userId: number,
    ) {
        const note = await this.prisma.note.findUnique({
            where: {
                id,
            },
        })

        if(!note) {
            throw new NotFoundException(
                `Note with id ${id} not found`
            )
        }

        if(note.userId !== userId) {
            throw new ForbiddenException(
                'No tienes permiso para eliminar esta nota'
            )
        }

        return this.prisma.note.delete({
            where: {
                id,
            },
            select: {
                id: true,
                title: true,
                content: true,
            }
        })
    }
}
