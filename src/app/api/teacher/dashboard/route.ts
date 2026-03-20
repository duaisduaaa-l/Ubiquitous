import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get('teacher_id');

        if (!teacherId) {
            return NextResponse.json({ error: 'Missing teacher id' }, { status: 400 });
        }

        // 1. Get total students mapped to this teacher's attendance or just in the whole college (usually a teacher has their own mapped students, but for simplicity we fetch all students in the portal, or students they have marked attendance for)
        // To make it more realistic, let's get students who have at least one attendance record from this teacher, or all students if it's a global list.
        const allStudents = await prisma.student.findMany();
        const totalStudents = allStudents.length;

        // 2. Present Today & Absent Today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const todayAttendance = await prisma.attendance.findMany({
            where: {
                teacher_id: teacherId,
                date: {
                    gte: today, // from start of today
                },
            },
        });

        const presentToday = todayAttendance.filter((a: { status: string }) => a.status === 'Present').length;
        const absentToday = todayAttendance.filter((a: { status: string }) => a.status === 'Absent').length;

        // 3. Attendance Percentage Chart (last 7 days grouped by date)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentAttendance = await prisma.attendance.findMany({
            where: {
                teacher_id: teacherId,
                date: {
                    gte: sevenDaysAgo,
                },
            },
        });

        const chartDataMap: Record<string, { present: number; absent: number }> = {};
        recentAttendance.forEach((a: { date: Date, status: string }) => {
            const dateStr = a.date.toISOString().split('T')[0];
            if (!chartDataMap[dateStr]) chartDataMap[dateStr] = { present: 0, absent: 0 };
            if (a.status === 'Present') chartDataMap[dateStr].present++;
            else chartDataMap[dateStr].absent++;
        });

        const chartData = Object.keys(chartDataMap).sort().map((date) => ({
            date,
            present: chartDataMap[date].present,
            absent: chartDataMap[date].absent,
            percentage: Math.round(
                (chartDataMap[date].present / (chartDataMap[date].present + chartDataMap[date].absent)) * 100
            ) || 0
        }));

        // 4. Leaderboard & Risky Students
        // We compute aggregate for all students related to this teacher
        const teacherAllAttendance = await prisma.attendance.findMany({
            where: { teacher_id: teacherId },
            include: { student: true }
        });

        const studentStats: Record<string, { name: string; roll: string; total: number; present: number }> = {};

        teacherAllAttendance.forEach((a: { student_id: string, status: string, student: { name: string, roll_number: string } }) => {
            if (!studentStats[a.student_id]) {
                studentStats[a.student_id] = { name: a.student.name, roll: a.student.roll_number, total: 0, present: 0 };
            }
            studentStats[a.student_id].total++;
            if (a.status === 'Present') studentStats[a.student_id].present++;
        });

        const studentAggregates = Object.keys(studentStats).map((id) => {
            const s = studentStats[id];
            const percentage = Math.round((s.present / s.total) * 100);
            return { id, name: s.name, roll: s.roll, percentage, total: s.total };
        });

        const leaderboard = [...studentAggregates].sort((a, b) => b.percentage - a.percentage).slice(0, 5);
        const riskyStudents = studentAggregates.filter((s) => s.percentage < 75).sort((a, b) => a.percentage - b.percentage);

        return NextResponse.json({
            success: true,
            stats: {
                totalStudents,
                presentToday,
                absentToday,
                chartData,
                leaderboard,
                riskyStudents
            }
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
