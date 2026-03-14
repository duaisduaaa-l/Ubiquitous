import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const totalTeachers = await prisma.teacher.count();
        const allStudents = await prisma.student.findMany();
        const totalStudents = allStudents.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAttendance = await prisma.attendance.findMany({
            where: { date: { gte: today } }
        });

        const presentToday = todayAttendance.filter((a: { status: string }) => a.status === 'Present').length;
        const todayAttendancePercentage = todayAttendance.length > 0
            ? Math.round((presentToday / todayAttendance.length) * 100)
            : 0;

        // Last 30 days monthly trend
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const lastMonthAttendance = await prisma.attendance.findMany({
            where: { date: { gte: thirtyDaysAgo } }
        });

        const trendMap: Record<string, { present: number; total: number }> = {};
        lastMonthAttendance.forEach((a: { date: Date, status: string }) => {
            const d = a.date.toISOString().split('T')[0];
            if (!trendMap[d]) trendMap[d] = { present: 0, total: 0 };
            trendMap[d].total++;
            if (a.status === 'Present') trendMap[d].present++;
        });

        const monthlyTrend = Object.keys(trendMap).sort().map(d => ({
            date: d,
            percentage: Math.round((trendMap[d].present / trendMap[d].total) * 100)
        }));

        // Student aggregates for Leaderboard & Risky
        const allAtt = await prisma.attendance.findMany({ include: { student: true } });
        const studentStats: Record<string, { name: string; roll: string; total: number; present: number }> = {};

        allAtt.forEach((a: { student_id: string, status: string, student: { name: string, roll_number: string } }) => {
            if (!studentStats[a.student_id]) {
                studentStats[a.student_id] = { name: a.student.name, roll: a.student.roll_number, total: 0, present: 0 };
            }
            studentStats[a.student_id].total++;
            if (a.status === 'Present') studentStats[a.student_id].present++;
        });

        const studentAggregates = Object.keys(studentStats).map(id => {
            const s = studentStats[id];
            return { id, name: s.name, roll: s.roll, percentage: Math.round((s.present / s.total) * 100), total: s.total };
        });

        const leaderboard = [...studentAggregates].sort((a, b) => b.percentage - a.percentage).slice(0, 10);
        const lowAttendance = studentAggregates.filter(s => s.percentage < 75).sort((a, b) => a.percentage - b.percentage);

        // Department wise
        const teacherData = await prisma.teacher.findMany();
        const deptMap: Record<string, string> = {};
        teacherData.forEach((t: { teacher_id: string, department: string }) => { deptMap[t.teacher_id] = t.department; });

        const deptStats: Record<string, { present: number; total: number }> = {};
        allAtt.forEach((a: { teacher_id: string, status: string }) => {
            const dept = deptMap[a.teacher_id] || 'General';
            if (!deptStats[dept]) deptStats[dept] = { present: 0, total: 0 };
            deptStats[dept].total++;
            if (a.status === 'Present') deptStats[dept].present++;
        });

        const departmentWise = Object.keys(deptStats).map(dept => ({
            name: dept,
            present: deptStats[dept].present,
            absent: deptStats[dept].total - deptStats[dept].present
        }));

        return NextResponse.json({
            success: true,
            stats: {
                totalTeachers,
                totalStudents,
                todayAttendancePercentage,
                monthlyTrend,
                leaderboard,
                lowAttendance,
                departmentWise
            }
        });

    } catch {
        return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
    }
}
