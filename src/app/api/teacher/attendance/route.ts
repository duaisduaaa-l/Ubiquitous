import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// ─── Geo-fence (same logic as lib/geofence.ts, safe to use in server routes) ───
const CAMPUS = {
    // lat: 30.771972863020316,
    // lng: 76.56376098460782,
    lat:30.77090509432338,
    lng: 76.57029968083211,
    radiusMeters: 100,

    // 30.77090509432338, 76.57029968083211
};

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isWithinCampus(lat: number, lng: number): boolean {
    return getDistanceMeters(lat, lng, CAMPUS.lat, CAMPUS.lng) <= CAMPUS.radiusMeters;
}
// ────────────────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateQuery = searchParams.get('date');
        const teacherId = searchParams.get('teacher_id');

        if (!dateQuery || !teacherId) {
            return NextResponse.json({ error: 'Missing req query' }, { status: 400 });
        }

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

    try {
        const { teacher_id, baseDateStr, records, latitude, longitude } = await req.json();

        // ─── Geo-fence check ─────────────────────────────────────────────────────
        if (latitude === undefined || longitude === undefined) {
            return NextResponse.json(
                { error: 'Location data is required to mark attendance.' },
                { status: 400 }
            );
        }

        if (!isWithinCampus(latitude, longitude)) {
            const dist = Math.round(getDistanceMeters(latitude, longitude, CAMPUS.lat, CAMPUS.lng));
            return NextResponse.json(
                { error: `You are ${dist}m away from campus. Attendance can only be marked within ${CAMPUS.radiusMeters}m.` },
                { status: 403 }
            );
        }
        // ────────────────────────────────────────────────────────────────────────

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