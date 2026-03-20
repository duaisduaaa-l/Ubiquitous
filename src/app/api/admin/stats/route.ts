import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const [teachers, students] = await Promise.all([
            prisma.teacher.count(),
            prisma.student.count(),
        ]);

        return NextResponse.json({ success: true, stats: { teachers, students } });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
