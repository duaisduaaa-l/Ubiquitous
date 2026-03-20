// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/db';
// import { cookies } from 'next/headers';

// const CAMPUS = { lat: 30.771972863020316, lng: 76.56376098460782, radiusMeters: 100 };

// function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
//     const R = 6371000;
//     const toRad = (d: number) => (d * Math.PI) / 180;
//     const dLat = toRad(lat2 - lat1);
//     const dLng = toRad(lng2 - lng1);
//     const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
//     return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }
// function isWithinCampus(lat: number, lng: number) {
//     return getDistanceMeters(lat, lng, CAMPUS.lat, CAMPUS.lng) <= CAMPUS.radiusMeters;
// }

// function dayBoundsUTC(dateStr: string): { start: Date; end: Date } {
//     const [year, month, day] = dateStr.split('-').map(Number);
//     const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
//     const end   = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
//     return { start, end };
// }

// function noonUTC(dateStr: string): Date {
//     const [year, month, day] = dateStr.split('-').map(Number);
//     return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
// }

// export async function GET(req: Request) {
//     try {
//         const { searchParams } = new URL(req.url);
//         const dateQuery = searchParams.get('date');
//         const teacherId = searchParams.get('teacher_id');

//         if (!dateQuery || !teacherId) {
//             return NextResponse.json({ error: 'Missing req query' }, { status: 400 });
//         }

//         const { start, end } = dayBoundsUTC(dateQuery);
//         console.log(`[GET] date="${dateQuery}" range: ${start.toISOString()} to ${end.toISOString()}`);

//         const attendances = await prisma.attendance.findMany({
//             where: { teacher_id: teacherId, date: { gte: start, lte: end } },
//         });

//         console.log(`[GET] found ${attendances.length} records`);
//         if (attendances.length > 0) console.log(`[GET] sample date stored: ${attendances[0].date}`);

//         return NextResponse.json(attendances);
//     } catch (err) {
//         console.error('[GET] error:', err);
//         return NextResponse.json({ error: 'Failed' }, { status: 500 });
//     }
// }

// export async function POST(req: Request) {
//     const cookieStore = await cookies();
//     const _token = cookieStore.get('token')?.value;

//     try {
//         const body = await req.json();
//         const { teacher_id, baseDateStr, records, latitude, longitude } = body;

//         console.log(`[POST] teacher=${teacher_id} date="${baseDateStr}" records=${records?.length} lat=${latitude} lng=${longitude}`);

//         // Geo-fence check removed from server for now (Mac GPS unreliable)
//         // Re-enable when deploying on mobile devices

//         if (!teacher_id || !baseDateStr || !records || !Array.isArray(records)) {
//             console.warn('[POST] BLOCKED: missing fields');
//             return NextResponse.json({ error: 'Missing requirements' }, { status: 400 });
//         }

//         const payloadDate = noonUTC(baseDateStr);
//         console.log(`[POST] saving with date: ${payloadDate.toISOString()}`);

//         for (const record of records) {
//             const { student_id, status } = record;
//             await prisma.attendance.upsert({
//                 where: { student_id_teacher_id_date: { student_id, teacher_id, date: payloadDate } },
//                 update: { status },
//                 create: { student_id, teacher_id, status, date: payloadDate },
//             });
//         }

//         console.log(`[POST] saved ${records.length} records OK`);
//         return NextResponse.json({ success: true, message: 'Attendance Saved Successfully' });
//     } catch (err) {
//         console.error('[POST] error:', err);
//         return NextResponse.json({ error: String(err) }, { status: 500 });
//     }
// }
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

const CAMPUS = { lat: 30.771972863020316, lng: 76.56376098460782, radiusMeters: 200 };

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function isWithinCampus(lat: number, lng: number) {
    return getDistanceMeters(lat, lng, CAMPUS.lat, CAMPUS.lng) <= CAMPUS.radiusMeters;
}

function dayBoundsUTC(dateStr: string): { start: Date; end: Date } {
    const [year, month, day] = dateStr.split('-').map(Number);
    const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const end   = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    return { start, end };
}

function noonUTC(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateQuery = searchParams.get('date');
        const teacherId = searchParams.get('teacher_id');

        if (!dateQuery || !teacherId) {
            return NextResponse.json({ error: 'Missing req query' }, { status: 400 });
        }

        const { start, end } = dayBoundsUTC(dateQuery);
        console.log(`[GET] date="${dateQuery}" range: ${start.toISOString()} to ${end.toISOString()}`);

        const attendances = await prisma.attendance.findMany({
            where: { teacher_id: teacherId, date: { gte: start, lte: end } },
        });

        console.log(`[GET] found ${attendances.length} records`);
        if (attendances.length > 0) console.log(`[GET] sample date stored: ${attendances[0].date}`);

        return NextResponse.json(attendances);
    } catch (err) {
        console.error('[GET] error:', err);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const _token = cookieStore.get('token')?.value;

    try {
        const body = await req.json();
        const { teacher_id, baseDateStr, records, latitude, longitude } = body;

        console.log(`[POST] teacher=${teacher_id} date="${baseDateStr}" records=${records?.length} lat=${latitude} lng=${longitude}`);

        if (latitude === undefined || longitude === undefined) {
            console.warn('[POST] BLOCKED: no location sent');
            return NextResponse.json({ error: 'Location data is required to mark attendance.' }, { status: 400 });
        }
        if (!isWithinCampus(latitude, longitude)) {
            const dist = Math.round(getDistanceMeters(latitude, longitude, CAMPUS.lat, CAMPUS.lng));
            console.warn(`[POST] BLOCKED: ${dist}m from campus`);
            return NextResponse.json({ error: `You are ${dist}m away from campus. Must be within ${CAMPUS.radiusMeters}m to mark attendance.` }, { status: 403 });
        }
        console.log('[POST] geo-fence passed');

        if (!teacher_id || !baseDateStr || !records || !Array.isArray(records)) {
            console.warn('[POST] BLOCKED: missing fields');
            return NextResponse.json({ error: 'Missing requirements' }, { status: 400 });
        }

        const payloadDate = noonUTC(baseDateStr);
        console.log(`[POST] saving with date: ${payloadDate.toISOString()}`);

        for (const record of records) {
            const { student_id, status } = record;
            await prisma.attendance.upsert({
                where: { student_id_teacher_id_date: { student_id, teacher_id, date: payloadDate } },
                update: { status },
                create: { student_id, teacher_id, status, date: payloadDate },
            });
        }

        console.log(`[POST] saved ${records.length} records OK`);
        return NextResponse.json({ success: true, message: 'Attendance Saved Successfully' });
    } catch (err) {
        console.error('[POST] error:', err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}