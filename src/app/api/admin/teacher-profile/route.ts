import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacher_id');

        if (!teacherId) {
            return NextResponse.json({ error: 'Missing teacher_id' }, { status: 400 });
        }

        const teacher = await prisma.teacher.findUnique({
            where: { teacher_id: teacherId },
            select: { teacher_id: true, name: true, email: true, department: true },
        });

        if (!teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });

        const schedules = await prisma.schedule.findMany({
            where: { teacher_id: teacherId },
            orderBy: { dayOfWeek: 'asc' },
        });

        const students = await prisma.student.findMany();

        const attendance = await prisma.attendance.findMany({
            where: { teacher_id: teacherId },
            orderBy: { date: 'desc' },
        });

        // Login logs
        const loginLogs = await (prisma as any).loginLog.findMany({
            where: { user_id: teacherId },
            orderBy: { loggedInAt: 'desc' },
            take: 30,
        });

        // Stats
        const totalClasses = attendance.length > 0
            ? [...new Set(attendance.map((a: any) => a.date.toISOString().slice(0, 10)))].length
            : 0;

        const presentCount = attendance.filter((a: any) => a.status === 'Present').length;
        const totalRecords = attendance.length;

        return NextResponse.json({
            success: true,
            teacher,
            schedules,
            students,
            attendance,
            loginLogs,
            stats: { totalClasses, presentCount, totalRecords, totalStudents: students.length },
        });
    } catch (err) {
        console.error('[teacher-profile]', err);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}