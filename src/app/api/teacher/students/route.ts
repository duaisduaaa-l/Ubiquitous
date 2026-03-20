import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        let students;
        if (query) {
            students = await prisma.student.findMany({
                where: {
                    OR: [
                        { name: { contains: query } },
                        { roll_number: { contains: query } },
                    ],
                },
            });
        } else {
            students = await prisma.student.findMany();
        }

        return NextResponse.json(students);
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, roll_number, course, year, section } = await req.json();

        if (!name || !roll_number || !course || !year || !section) {
            return NextResponse.json({ error: 'Missing req fields' }, { status: 400 });
        }

        const exists = await prisma.student.findUnique({ where: { roll_number } });
        if (exists) {
            return NextResponse.json({ error: 'Roll No exists' }, { status: 400 });
        }

        const student = await prisma.student.create({
            data: { name, roll_number, course, year, section },
        });

        return NextResponse.json({ success: true, student });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
