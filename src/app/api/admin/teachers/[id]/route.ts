import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const dataToUpdate: Record<string, string> = {
            name: body.name,
            email: body.email,
            department: body.department,
        };

        if (body.password) {
            dataToUpdate.password = await bcrypt.hash(body.password, 10);
        }

        const updatedTeacher = await prisma.teacher.update({
            where: { teacher_id: id },
            data: dataToUpdate,
        });

        return NextResponse.json({ success: true, teacher: updatedTeacher });
    } catch {
        return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await prisma.teacher.delete({
            where: { teacher_id: id },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
    }
}
