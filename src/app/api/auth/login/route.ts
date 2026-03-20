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

        // Generate token
        const tokenPayload = {
            id: role === 'admin' ? (user as { admin_id: string }).admin_id : (user as { teacher_id: string }).teacher_id,
            role: role,
            name: user.name,
            email: user.email,
        };
        const token = signToken(tokenPayload);

        const res = NextResponse.json({ success: true, user: tokenPayload });
        res.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400, // 1 day
            path: '/',
        });

        return res;
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}
