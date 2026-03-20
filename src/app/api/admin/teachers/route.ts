import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const teachers = await prisma.teacher.findMany({
            select: {
                teacher_id: true,
                name: true,
                email: true,
                department: true,
            },
        });
        return NextResponse.json(teachers);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, email, department, password } = await req.json();

        if (!name || !email || !department || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
        if (existingTeacher) {
            return NextResponse.json({ error: 'Teacher email already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const teacher = await prisma.teacher.create({
            data: {
                name,
                email,
                department,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ success: true, teacher });
    } catch {
        return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
    }
}
