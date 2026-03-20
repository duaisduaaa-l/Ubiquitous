import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const logs = await (prisma as any).loginLog.findMany({
            orderBy: { loggedInAt: 'desc' },
            take: 50,
        });
        return NextResponse.json({ success: true, logs });
    } catch (err) {
        console.error('[login-logs GET]', err);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}