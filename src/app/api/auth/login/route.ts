import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, password, role } = await req.json();

        if (!email || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        let user;
        if (role === 'admin') {
            user = await prisma.admin.findUnique({ where: { email } });
        } else if (role === 'teacher') {
            user = await prisma.teacher.findUnique({ where: { email } });
        } else {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const tokenPayload = {
            id: role === 'admin' ? (user as { admin_id: string }).admin_id : (user as { teacher_id: string }).teacher_id,
            role,
            name: user.name,
            email: user.email,
        };
        const token = signToken(tokenPayload);

        // ─── Log this login ───────────────────────────────────────────────
        const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';
        try {
            await (prisma as any).loginLog.create({
                data: {
                    user_id: tokenPayload.id,
                    user_name: user.name,
                    user_email: user.email,
                    role,
                    ipAddress,
                    userAgent,
                },
            });
            console.log(`[LOGIN] ${role} "${user.name}" logged in from ${ipAddress}`);
        } catch (logErr) {
            // Don't fail login if logging fails — just warn
            console.warn('[LOGIN] Could not write login log:', logErr);
        }
        // ─────────────────────────────────────────────────────────────────

        const res = NextResponse.json({ success: true, user: tokenPayload });
        res.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400,
            path: '/',
        });

        return res;
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}