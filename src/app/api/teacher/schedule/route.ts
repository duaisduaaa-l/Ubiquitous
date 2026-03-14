import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacher_id');

        if (!teacherId) {
            return NextResponse.json({ error: 'Missing teacher id' }, { status: 400 });
        }

        const schedules = await prisma.schedule.findMany({
            where: { teacher_id: teacherId },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' }
            ]
        });

        return NextResponse.json({ success: true, schedules });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { teacher_id, dayOfWeek, startTime, endTime, subject, section } = await req.json();

        if (!teacher_id || !dayOfWeek || !startTime || !endTime || !subject || !section) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const schedule = await prisma.schedule.create({
            data: {
                teacher_id,
                dayOfWeek,
                startTime,
                endTime,
                subject,
                section
            }
        });

        return NextResponse.json({ success: true, schedule });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
