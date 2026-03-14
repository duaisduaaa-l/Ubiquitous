import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacher_id');

        if (!teacherId) {
            return NextResponse.json({ error: 'Missing teacher id' }, { status: 400 });
        }

        // Fetch all students and their attendance for this teacher
        const students = await prisma.student.findMany({
            include: {
                attendance: {
                    where: {
                        teacher_id: teacherId,
                    }
                }
            }
        });

        const report = students.map((student) => {
            const totalClasses = student.attendance.length;
            const presentClasses = student.attendance.filter((a) => a.status === 'Present').length;
            const absentClasses = student.attendance.filter((a) => a.status === 'Absent').length;
            const attendancePercentage = totalClasses === 0 ? 0 : Math.round((presentClasses / totalClasses) * 100);

            return {
                student_id: student.student_id,
                name: student.name,
                roll_number: student.roll_number,
                totalClasses,
                presentClasses,
                absentClasses,
                attendancePercentage,
            };
        });

        return NextResponse.json({ success: true, report });
    } catch {
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
