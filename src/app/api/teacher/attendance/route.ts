import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateQuery = searchParams.get('date');
        const teacherId = searchParams.get('teacher_id');

        if (!dateQuery || !teacherId) {
            return NextResponse.json({ error: 'Missing req query' }, { status: 400 });
        }

        // Since we store date as DateTime, we need to match via gte/lt range
        const searchDate = new Date(dateQuery);
        searchDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(searchDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const attendances = await prisma.attendance.findMany({
            where: {
                teacher_id: teacherId,
                date: {
                    gte: searchDate,
                    lt: nextDate,
                },
            },
        });

        return NextResponse.json(attendances);
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    // Actually, we could extract role/id from token. Instead, we can let client pass it, or read from token payload.
    // For safety, assuming client passes records.

    try {
        const { teacher_id, date, baseDateStr, records } = await req.json();

        if (!teacher_id || !baseDateStr || !records || !Array.isArray(records)) {
            return NextResponse.json({ error: 'Missing requirements' }, { status: 400 });
        }

        const payloadDate = new Date(baseDateStr);
        payloadDate.setHours(12, 0, 0, 0);

        for (const record of records) {
            const { student_id, status } = record;

            await prisma.attendance.upsert({
                where: {
                    student_id_teacher_id_date: {
                        student_id,
                        teacher_id,
                        date: payloadDate,
                    },
                },
                update: { status },
                create: {
                    student_id,
                    teacher_id,
                    status,
                    date: payloadDate,
                },
            });
        }

        return NextResponse.json({ success: true, message: 'Attendance Saved Successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
