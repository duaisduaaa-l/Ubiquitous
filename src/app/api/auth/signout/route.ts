import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const res = NextResponse.redirect(new URL(callbackUrl, request.url));
    res.cookies.set('token', '', { maxAge: 0, path: '/' });

    return res;
}

export async function POST(request: Request) {
    return GET(request);
}
