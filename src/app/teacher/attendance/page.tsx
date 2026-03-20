// 'use client';

// import { useEffect, useState } from 'react';
// import { Users, MapPin, CheckCircle, XCircle, Clock, ChevronDown, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// // ─── Geo-fence ────────────────────────────────────────────────────────
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
// // ─────────────────────────────────────────────────────────────────────

// interface Student { student_id: string; name: string; roll_number: string; section: string; }
// interface Schedule { schedule_id: string; subject: string; section: string; }
// interface AttendanceRecord { student_id: string; status: 'Present' | 'Absent'; date: string; }

// type GeoStatus = 'idle' | 'checking' | 'allowed' | 'denied' | 'error';

// const isToday = (dateStr: string) => dateStr === new Date().toISOString().slice(0, 10);

// export default function MarkAttendance() {
//     const [students, setStudents] = useState<Student[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [saving, setSaving] = useState(false);
//     const [teacherId, setTeacherId] = useState('');
//     const [schedules, setSchedules] = useState<Schedule[]>([]);
//     const [selectedSection, setSelectedSection] = useState('All');
//     const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
//     const [attendanceState, setAttendanceState] = useState<Record<string, 'Present' | 'Absent'>>({});
//     const [savedRecords, setSavedRecords] = useState<AttendanceRecord[]>([]);
//     const [savedAt, setSavedAt] = useState<string | null>(null);
//     const [isHistoryMode, setIsHistoryMode] = useState(false);
//     const [isAlreadySaved, setIsAlreadySaved] = useState(false); // today's attendance already exists in DB
//     const [message, setMessage] = useState({ type: '', text: '' });
//     const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
//     const [geoError, setGeoError] = useState('');

//     const fetchContext = async () => {
//         try {
//             const res = await fetch('/api/teacher/me');
//             const data = await res.json();
//             if (data.success && data.user) setTeacherId(data.user.id);
//         } catch { }
//     };

//     const fetchSchedules = async (tid: string) => {
//         try {
//             const res = await fetch(`/api/teacher/schedule?teacher_id=${tid}`);
//             const data = await res.json();
//             if (data.success && data.schedules) setSchedules(data.schedules);
//         } catch { }
//     };

//     const fetchStudentsAndAttendance = async (tid: string, date: string, section: string) => {
//         setLoading(true);
//         setSavedAt(null);
//         setSavedRecords([]);
//         setIsAlreadySaved(false);
//         const isPast = !isToday(date);
//         setIsHistoryMode(isPast);

//         try {
//             const studRes = await fetch('/api/teacher/students');
//             let studData: Student[] = await studRes.json();
//             if (section && section !== 'All') studData = studData.filter(s => s.section === section);
//             setStudents(studData);

//             if (tid) {
//                 const attRes = await fetch(`/api/teacher/attendance?date=${date}&teacher_id=${tid}`);
//                 const attData = await attRes.json();
//                 const newState: Record<string, 'Present' | 'Absent'> = {};
//                 if (Array.isArray(attData)) {
//                     attData.forEach((a: AttendanceRecord) => { newState[a.student_id] = a.status; });
//                     setSavedRecords(attData);
//                     if (attData.length > 0 && attData[0].date) {
//                         const d = new Date(attData[0].date);
//                         setSavedAt(d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
//                         // If this is today and records exist → freeze in read-only
//                         if (!isPast && attData.length > 0) setIsAlreadySaved(true);
//                     }
//                 }
//                 setAttendanceState(newState);
//             }
//         } catch { }
//         finally { setLoading(false); }
//     };

//     useEffect(() => { fetchContext(); }, []);
//     useEffect(() => {
//         if (teacherId) {
//             fetchSchedules(teacherId);
//             fetchStudentsAndAttendance(teacherId, dateStr, selectedSection);
//         }
//     }, [teacherId, dateStr, selectedSection]);

//     // Reset geoStatus when date changes
//     useEffect(() => { setGeoStatus('idle'); setGeoError(''); }, [dateStr]);

//     const checkLocation = (): Promise<{ allowed: boolean; lat?: number; lng?: number }> => {
//         return new Promise((resolve) => {
//             if (!navigator.geolocation) {
//                 setGeoStatus('error'); setGeoError('Geolocation not supported.');
//                 resolve({ allowed: false }); return;
//             }
//             setGeoStatus('checking'); setGeoError('');
//             navigator.geolocation.getCurrentPosition(
//                 (pos) => {
//                     const { latitude: lat, longitude: lng } = pos.coords;
//                     const allowed = isWithinCampus(lat, lng);
//                     setGeoStatus(allowed ? 'allowed' : 'denied');
//                     if (!allowed) {
//                         const dist = Math.round(getDistanceMeters(lat, lng, CAMPUS.lat, CAMPUS.lng));
//                         setGeoError(`You are ${dist}m from campus. Must be within ${CAMPUS.radiusMeters}m.`);
//                     }
//                     resolve({ allowed, lat, lng });
//                 },
//                 (err) => {
//                     setGeoStatus('error');
//                     setGeoError(err.code === 1 ? 'Location permission denied. Please allow access.' : 'Unable to get location. Try again.');
//                     resolve({ allowed: false });
//                 },
//                 { enableHighAccuracy: true, timeout: 8000 }
//             );
//         });
//     };

//     const handleSave = async () => {
//         if (!teacherId) return;
//         setSaving(true);
//         setMessage({ type: '', text: '' });
//         try {
//             const records = students.map(s => ({
//                 student_id: s.student_id,
//                 status: attendanceState[s.student_id] || 'Absent',
//             }));
//             const res = await fetch('/api/teacher/attendance', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ teacher_id: teacherId, baseDateStr: dateStr, records }),
//             });
//             const data = await res.json();
//             if (!res.ok) throw new Error(data.error || 'Failed to save');
//             const now = new Date();
//             setSavedAt(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
//             setSavedRecords(records.map(r => ({ ...r, date: dateStr })));
//             setIsAlreadySaved(true); // freeze the page immediately after saving
//             setMessage({ type: 'success', text: 'Attendance saved successfully' });
//             setTimeout(() => setMessage({ type: '', text: '' }), 4000);
//         } catch (err) {
//             setMessage({ type: 'error', text: (err as Error).message });
//         } finally { setSaving(false); }
//     };

//     const toggleAttendance = (id: string, status: 'Present' | 'Absent') => {
//         if (isHistoryMode || isAlreadySaved) return;
//         setAttendanceState(prev => ({ ...prev, [id]: status }));
//     };

//     const uniqueSections = Array.from(new Set(schedules.map(s => s.section)));
//     const presentCount = Object.values(attendanceState).filter(v => v === 'Present').length;
//     const absentCount = Object.values(attendanceState).filter(v => v === 'Absent').length;
//     const notMarked = students.length - presentCount - absentCount;
//     const displayDate = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
//     // Read-only if: past date OR today already saved
//     const isReadOnly = isHistoryMode || isAlreadySaved;
//     const isPast = isHistoryMode; // kept for banner label distinction

//     const geoColors: Record<GeoStatus, string> = {
//         idle: 'transparent', checking: '#f97316', allowed: '#10b981', denied: '#ef4444', error: '#ef4444',
//     };
//     const geoBgs: Record<GeoStatus, string> = {
//         idle: 'transparent', checking: 'rgba(249,115,22,0.08)', allowed: 'rgba(16,185,129,0.08)', denied: 'rgba(239,68,68,0.08)', error: 'rgba(239,68,68,0.08)',
//     };
//     const geoMessages: Record<GeoStatus, string> = {
//         idle: '', checking: 'Verifying your location…', allowed: 'Location verified — you are on campus.', denied: geoError, error: geoError,
//     };

//     return (
//         <div style={{ paddingBottom: '3rem' }}>
//             <style>{`
//                 @keyframes spin { to { transform: rotate(360deg); } }
//                 @keyframes fadeInUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
//                 .att-row { transition: background 0.15s; }
//                 .att-row:hover { background: rgba(79,70,229,0.02); }
//                 .att-btn { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); border-radius: 8px; padding: 0.35rem 0.9rem; font-size: 0.8rem; font-weight: 600; border: 1.5px solid; cursor: pointer; }
//                 .att-btn:active { transform: scale(0.95); }
//                 .att-btn:disabled { opacity: 0.5; cursor: not-allowed; }
//             `}</style>

//             {/* ── Page header ── */}
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
//                 <div>
//                     <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-color)', letterSpacing: '-0.02em' }}>
//                         {isPast ? 'Attendance Record' : isAlreadySaved ? 'Attendance Marked' : 'Mark Attendance'}
//                     </h1>
//                     <p style={{ color: 'var(--sidebar-text)', fontSize: '0.82rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
//                         <Calendar size={13} /> {displayDate}
//                         {isPast && <span style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed', padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>Past Record</span>}
//                         {isAlreadySaved && !isPast && <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success-color)', padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>Submitted</span>}
//                         {savedAt && <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> Saved at {savedAt}</span>}
//                     </p>
//                 </div>

//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                         <Users size={15} color="var(--primary-color)" />
//                         <select
//                             className="input-field"
//                             style={{ margin: 0, padding: '0.45rem 0.75rem', fontSize: '0.82rem', minWidth: '130px' }}
//                             value={selectedSection}
//                             onChange={e => setSelectedSection(e.target.value)}
//                         >
//                             <option value="All">All Enrolled</option>
//                             {uniqueSections.map(s => <option key={s} value={s}>Section {s}</option>)}
//                         </select>
//                     </div>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                         <Calendar size={15} color="var(--primary-color)" />
//                         <input
//                             type="date"
//                             className="input-field"
//                             style={{ margin: 0, padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
//                             value={dateStr}
//                             max={new Date().toISOString().slice(0, 10)}
//                             onChange={e => setDateStr(e.target.value)}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* ── Stats bar ── */}
//             {students.length > 0 && !loading && (
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
//                     {[
//                         { label: 'Total', value: students.length, color: 'var(--primary-color)', bg: 'rgba(79,70,229,0.08)' },
//                         { label: 'Present', value: presentCount, color: 'var(--success-color)', bg: 'rgba(16,185,129,0.08)' },
//                         { label: 'Absent', value: absentCount, color: 'var(--danger-color)', bg: 'rgba(239,68,68,0.08)' },
//                         { label: 'Not Marked', value: notMarked, color: 'var(--warning-color)', bg: 'rgba(249,115,22,0.08)' },
//                     ].map(({ label, value, color, bg }) => (
//                         <div key={label} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
//                             <p style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
//                             <p style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)', marginTop: '0.2rem', fontWeight: 500 }}>{label}</p>
//                             <div style={{ marginTop: '0.5rem', height: 3, borderRadius: 2, background: 'var(--border-color)', overflow: 'hidden' }}>
//                                 <div style={{ width: students.length > 0 ? `${(value / students.length) * 100}%` : '0%', height: '100%', background: color, borderRadius: 2 }} />
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             <div className="card" style={{ padding: '1.25rem' }}>

//                 {/* Geo-fence banner */}
//                 <AnimatePresence>
//                     {geoStatus !== 'idle' && (
//                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
//                             style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', marginBottom: '1rem', borderRadius: '8px', background: geoBgs[geoStatus], border: `1px solid ${geoColors[geoStatus]}30`, fontSize: '0.82rem', fontWeight: 600, color: geoColors[geoStatus] }}>
//                             {geoStatus === 'checking'
//                                 ? <div style={{ width: 14, height: 14, border: `2px solid ${geoColors.checking}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
//                                 : <MapPin size={14} style={{ flexShrink: 0 }} />}
//                             {geoMessages[geoStatus]}
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 {/* Message banner */}
//                 <AnimatePresence>
//                     {message.text && (
//                         <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
//                             style={{
//                                 padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem',
//                                 background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
//                                 color: message.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
//                                 border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
//                                 fontSize: '0.85rem', fontWeight: 600,
//                             }}>
//                             {message.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
//                             {message.text}
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 {/* Today already saved — green lock banner with Edit option */}
//                 {isAlreadySaved && !isPast && (
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.82rem', color: 'var(--success-color)', fontWeight: 500 }}>
//                         <CheckCircle size={15} style={{ flexShrink: 0 }} />
//                         <span style={{ flex: 1 }}>
//                             Attendance already submitted for today{savedAt && <> at <strong>{savedAt}</strong></>}. This is a read-only view.
//                         </span>
//                         <button
//                             onClick={() => setIsAlreadySaved(false)}
//                             style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success-color)', borderRadius: '6px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
//                             Edit
//                         </button>
//                     </div>
//                 )}

//                 {/* Past mode notice */}
//                 {isPast && savedRecords.length > 0 && (
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', fontSize: '0.82rem', color: '#7c3aed', fontWeight: 500 }}>
//                         <Clock size={14} />
//                         Attendance was marked for this date
//                         {savedAt && <strong> at {savedAt}</strong>}.
//                         You are viewing a read-only record.
//                     </div>
//                 )}
//                 {isPast && savedRecords.length === 0 && !loading && (
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', fontSize: '0.82rem', color: 'var(--warning-color)', fontWeight: 500 }}>
//                         <AlertCircle size={14} />
//                         No attendance was marked for {displayDate}.
//                     </div>
//                 )}

//                 {loading ? (
//                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}>
//                         <div style={{ width: 22, height: 22, border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
//                         <span style={{ color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>Loading records…</span>
//                     </div>
//                 ) : students.length === 0 ? (
//                     <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>
//                         <Users size={36} color="var(--border-color)" style={{ margin: '0 auto 0.75rem' }} />
//                         <p>No students enrolled yet.</p>
//                     </div>
//                 ) : (
//                     <>
//                         <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem' }}>
//                             <thead>
//                                 <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
//                                     <th style={{ padding: '0.7rem 0.75rem', textAlign: 'left', fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>#</th>
//                                     <th style={{ padding: '0.7rem 0.75rem', textAlign: 'left', fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Roll No</th>
//                                     <th style={{ padding: '0.7rem 0.75rem', textAlign: 'left', fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Student Name</th>
//                                     <th style={{ padding: '0.7rem 0.75rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
//                                         {isReadOnly ? 'Status' : 'Mark Attendance'}
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {students.map((s, idx) => {
//                                     const status = attendanceState[s.student_id];
//                                     return (
//                                         <motion.tr key={s.student_id} className="att-row"
//                                             initial={{ opacity: 0, x: -8 }}
//                                             animate={{ opacity: 1, x: 0 }}
//                                             transition={{ delay: idx * 0.025, duration: 0.3 }}
//                                             style={{ borderBottom: '1px solid var(--border-color)' }}>
//                                             <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.78rem', color: 'var(--sidebar-text)', width: 36 }}>{idx + 1}</td>
//                                             <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.82rem' }}>{s.roll_number}</td>
//                                             <td style={{ padding: '0.85rem 0.75rem' }}>
//                                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
//                                                     <div style={{
//                                                         width: 30, height: 30, borderRadius: '50%',
//                                                         background: status === 'Present' ? 'rgba(16,185,129,0.1)' : status === 'Absent' ? 'rgba(239,68,68,0.1)' : 'rgba(79,70,229,0.08)',
//                                                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                                                         fontSize: '0.7rem', fontWeight: 700,
//                                                         color: status === 'Present' ? 'var(--success-color)' : status === 'Absent' ? 'var(--danger-color)' : 'var(--primary-color)',
//                                                         flexShrink: 0,
//                                                     }}>
//                                                         {s.name.charAt(0).toUpperCase()}
//                                                     </div>
//                                                     <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</span>
//                                                 </div>
//                                             </td>
//                                             <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
//                                                 {isReadOnly ? (
//                                                     // Read-only history view
//                                                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
//                                                         {status === 'Present' ? (
//                                                             <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success-color)', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
//                                                                 <CheckCircle size={13} /> Present
//                                                             </span>
//                                                         ) : status === 'Absent' ? (
//                                                             <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger-color)', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
//                                                                 <XCircle size={13} /> Absent
//                                                             </span>
//                                                         ) : (
//                                                             <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(148,163,184,0.12)', color: 'var(--sidebar-text)', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
//                                                                 — Not recorded
//                                                             </span>
//                                                         )}
//                                                         {savedAt && status && (
//                                                             <span style={{ fontSize: '0.7rem', color: 'var(--sidebar-text)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
//                                                                 <Clock size={11} /> {savedAt}
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 ) : (
//                                                     // Live marking buttons
//                                                     <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
//                                                         <button
//                                                             className="att-btn"
//                                                             onClick={() => toggleAttendance(s.student_id, 'Present')}
//                                                             style={{
//                                                                 background: status === 'Present' ? 'var(--success-color)' : 'transparent',
//                                                                 color: status === 'Present' ? '#fff' : 'var(--success-color)',
//                                                                 borderColor: 'var(--success-color)',
//                                                             }}>
//                                                             {status === 'Present' && <CheckCircle size={12} style={{ display: 'inline', marginRight: 3 }} />}
//                                                             Present
//                                                         </button>
//                                                         <button
//                                                             className="att-btn"
//                                                             onClick={() => toggleAttendance(s.student_id, 'Absent')}
//                                                             style={{
//                                                                 background: status === 'Absent' ? 'var(--danger-color)' : 'transparent',
//                                                                 color: status === 'Absent' ? '#fff' : 'var(--danger-color)',
//                                                                 borderColor: 'var(--danger-color)',
//                                                             }}>
//                                                             {status === 'Absent' && <XCircle size={12} style={{ display: 'inline', marginRight: 3 }} />}
//                                                             Absent
//                                                         </button>
//                                                     </div>
//                                                 )}
//                                             </td>
//                                         </motion.tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>

//                         {/* Footer actions */}
//                         {!isReadOnly && (
//                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
//                                 <div style={{ display: 'flex', gap: '0.5rem' }}>
//                                     <button
//                                         onClick={() => {
//                                             const all: Record<string, 'Present' | 'Absent'> = {};
//                                             students.forEach(s => { all[s.student_id] = 'Present'; });
//                                             setAttendanceState(all);
//                                         }}
//                                         style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--success-color)', borderRadius: '8px', padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
//                                         Mark all present
//                                     </button>
//                                     <button
//                                         onClick={() => fetchStudentsAndAttendance(teacherId, dateStr, selectedSection)}
//                                         style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--sidebar-text)', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
//                                         <RefreshCw size={12} /> Reset
//                                     </button>
//                                 </div>
//                                 <button
//                                     onClick={handleSave}
//                                     className="btn-primary"
//                                     disabled={saving || geoStatus === 'checking'}
//                                     style={{ minWidth: 150, fontSize: '0.88rem' }}>
//                                     {geoStatus === 'checking' ? (
//                                         <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Verifying location…</>
//                                     ) : saving ? 'Saving…' : 'Save Attendance'}
//                                 </button>
//                             </div>
//                         )}
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }
'use client';

import { useEffect, useState } from 'react';
import { Users, MapPin, CheckCircle, XCircle, Clock, ChevronDown, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Geo-fence ────────────────────────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────

interface Student { student_id: string; name: string; roll_number: string; section: string; }
interface Schedule { schedule_id: string; subject: string; section: string; }
interface AttendanceRecord { student_id: string; status: 'Present' | 'Absent'; date: string; }

type GeoStatus = 'idle' | 'checking' | 'allowed' | 'denied' | 'error';

const isToday = (dateStr: string) => dateStr === new Date().toISOString().slice(0, 10);

export default function MarkAttendance() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teacherId, setTeacherId] = useState('');
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedSection, setSelectedSection] = useState('All');
    const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
    const [attendanceState, setAttendanceState] = useState<Record<string, 'Present' | 'Absent'>>({});
    const [savedRecords, setSavedRecords] = useState<AttendanceRecord[]>([]);
    const [savedAt, setSavedAt] = useState<string | null>(null);
    const [isHistoryMode, setIsHistoryMode] = useState(false);
    const [isAlreadySaved, setIsAlreadySaved] = useState(false); // today's attendance already exists in DB
    const [message, setMessage] = useState({ type: '', text: '' });
    const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
    const [geoError, setGeoError] = useState('');

    const fetchContext = async () => {
        try {
            const res = await fetch('/api/teacher/me');
            const data = await res.json();
            if (data.success && data.user) setTeacherId(data.user.id);
        } catch { }
    };

    const fetchSchedules = async (tid: string) => {
        try {
            const res = await fetch(`/api/teacher/schedule?teacher_id=${tid}`);
            const data = await res.json();
            if (data.success && data.schedules) setSchedules(data.schedules);
        } catch { }
    };

    const fetchStudentsAndAttendance = async (tid: string, date: string, section: string) => {
        setLoading(true);
        setSavedAt(null);
        setSavedRecords([]);
        setIsAlreadySaved(false);
        const isPast = !isToday(date);
        setIsHistoryMode(isPast);

        try {
            const studRes = await fetch('/api/teacher/students');
            let studData: Student[] = await studRes.json();
            if (section && section !== 'All') studData = studData.filter(s => s.section === section);
            setStudents(studData);

            if (tid) {
                const attRes = await fetch(`/api/teacher/attendance?date=${date}&teacher_id=${tid}`);
                const attData = await attRes.json();
                const newState: Record<string, 'Present' | 'Absent'> = {};
                if (Array.isArray(attData)) {
                    attData.forEach((a: AttendanceRecord) => { newState[a.student_id] = a.status; });
                    setSavedRecords(attData);
                    if (attData.length > 0 && attData[0].date) {
                        const d = new Date(attData[0].date);
                        setSavedAt(d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
                        // If this is today and records exist → freeze in read-only
                        if (!isPast && attData.length > 0) setIsAlreadySaved(true);
                    }
                }
                setAttendanceState(newState);
            }
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchContext(); }, []);
    useEffect(() => {
        if (teacherId) {
            fetchSchedules(teacherId);
            fetchStudentsAndAttendance(teacherId, dateStr, selectedSection);
        }
    }, [teacherId, dateStr, selectedSection]);

    // Reset geoStatus when date changes
    useEffect(() => { setGeoStatus('idle'); setGeoError(''); }, [dateStr]);

    const checkLocation = (): Promise<{ allowed: boolean; lat?: number; lng?: number }> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                setGeoStatus('error'); setGeoError('Geolocation not supported.');
                resolve({ allowed: false }); return;
            }
            setGeoStatus('checking'); setGeoError('');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    const allowed = isWithinCampus(lat, lng);
                    setGeoStatus(allowed ? 'allowed' : 'denied');
                    if (!allowed) {
                        const dist = Math.round(getDistanceMeters(lat, lng, CAMPUS.lat, CAMPUS.lng));
                        setGeoError(`You are ${dist}m from campus. Must be within ${CAMPUS.radiusMeters}m.`);
                    }
                    resolve({ allowed, lat, lng });
                },
                (err) => {
                    setGeoStatus('error');
                    setGeoError(err.code === 1 ? 'Location permission denied. Please allow access.' : 'Unable to get location. Try again.');
                    resolve({ allowed: false });
                },
                { enableHighAccuracy: true, timeout: 8000 }
            );
        });
    };

    const handleSave = async () => {
        if (!teacherId) return;

        const { allowed, lat, lng } = await checkLocation();
        if (!allowed) return;

        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const records = students.map(s => ({
                student_id: s.student_id,
                status: attendanceState[s.student_id] || 'Absent',
            }));
            const res = await fetch('/api/teacher/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacher_id: teacherId, baseDateStr: dateStr, records, latitude: lat, longitude: lng }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save');
            const now = new Date();
            setSavedAt(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
            setSavedRecords(records.map(r => ({ ...r, date: dateStr })));
            setIsAlreadySaved(true); // freeze the page immediately after saving
            setMessage({ type: 'success', text: 'Attendance saved successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        } catch (err) {
            setMessage({ type: 'error', text: (err as Error).message });
        } finally { setSaving(false); }
    };

    const toggleAttendance = (id: string, status: 'Present' | 'Absent') => {
        if (isHistoryMode || isAlreadySaved) return;
        setAttendanceState(prev => ({ ...prev, [id]: status }));
    };

    const uniqueSections = Array.from(new Set(schedules.map(s => s.section)));
    const presentCount = Object.values(attendanceState).filter(v => v === 'Present').length;
    const absentCount = Object.values(attendanceState).filter(v => v === 'Absent').length;
    const notMarked = students.length - presentCount - absentCount;
    const displayDate = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    // Read-only if: past date OR today already saved
    const isReadOnly = isHistoryMode || isAlreadySaved;
    const isPast = isHistoryMode; // kept for banner label distinction

    const geoColors: Record<GeoStatus, string> = {
        idle: 'transparent', checking: '#f97316', allowed: '#10b981', denied: '#ef4444', error: '#ef4444',
    };
    const geoBgs: Record<GeoStatus, string> = {
        idle: 'transparent', checking: 'rgba(249,115,22,0.08)', allowed: 'rgba(16,185,129,0.08)', denied: 'rgba(239,68,68,0.08)', error: 'rgba(239,68,68,0.08)',
    };
    const geoMessages: Record<GeoStatus, string> = {
        idle: '', checking: 'Verifying your location…', allowed: 'Location verified — you are on campus.', denied: geoError, error: geoError,
    };

    return (
        <div style={{ paddingBottom: '3rem' }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeInUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                .att-row { transition: background 0.15s; }
                .att-row:hover { background: rgba(79,70,229,0.02); }
                .att-btn { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); border-radius: 8px; padding: 0.35rem 0.9rem; font-size: 0.8rem; font-weight: 600; border: 1.5px solid; cursor: pointer; }
                .att-btn:active { transform: scale(0.95); }
                .att-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>

            {/* ── Page header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-color)', letterSpacing: '-0.02em' }}>
                        {isPast ? 'Attendance Record' : isAlreadySaved ? 'Attendance Marked' : 'Mark Attendance'}
                    </h1>
                    <p style={{ color: 'var(--sidebar-text)', fontSize: '0.82rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <Calendar size={13} /> {displayDate}
                        {isPast && <span style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed', padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>Past Record</span>}
                        {isAlreadySaved && !isPast && <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success-color)', padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>Submitted</span>}
                        {savedAt && <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> Saved at {savedAt}</span>}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={15} color="var(--primary-color)" />
                        <select
                            className="input-field"
                            style={{ margin: 0, padding: '0.45rem 0.75rem', fontSize: '0.82rem', minWidth: '130px' }}
                            value={selectedSection}
                            onChange={e => setSelectedSection(e.target.value)}
                        >
                            <option value="All">All Enrolled</option>
                            {uniqueSections.map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={15} color="var(--primary-color)" />
                        <input
                            type="date"
                            className="input-field"
                            style={{ margin: 0, padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                            value={dateStr}
                            max={new Date().toISOString().slice(0, 10)}
                            onChange={e => setDateStr(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ── Stats bar ── */}
            {students.length > 0 && !loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Total', value: students.length, color: 'var(--primary-color)', bg: 'rgba(79,70,229,0.08)' },
                        { label: 'Present', value: presentCount, color: 'var(--success-color)', bg: 'rgba(16,185,129,0.08)' },
                        { label: 'Absent', value: absentCount, color: 'var(--danger-color)', bg: 'rgba(239,68,68,0.08)' },
                        { label: 'Not Marked', value: notMarked, color: 'var(--warning-color)', bg: 'rgba(249,115,22,0.08)' },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--sidebar-text)', marginTop: '0.2rem', fontWeight: 500 }}>{label}</p>
                            <div style={{ marginTop: '0.5rem', height: 3, borderRadius: 2, background: 'var(--border-color)', overflow: 'hidden' }}>
                                <div style={{ width: students.length > 0 ? `${(value / students.length) * 100}%` : '0%', height: '100%', background: color, borderRadius: 2 }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="card" style={{ padding: '1.25rem' }}>

                {/* Geo-fence banner */}
                <AnimatePresence>
                    {geoStatus !== 'idle' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', marginBottom: '1rem', borderRadius: '8px', background: geoBgs[geoStatus], border: `1px solid ${geoColors[geoStatus]}30`, fontSize: '0.82rem', fontWeight: 600, color: geoColors[geoStatus] }}>
                            {geoStatus === 'checking'
                                ? <div style={{ width: 14, height: 14, border: `2px solid ${geoColors.checking}`, borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                                : <MapPin size={14} style={{ flexShrink: 0 }} />}
                            {geoMessages[geoStatus]}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Message banner */}
                <AnimatePresence>
                    {message.text && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            style={{
                                padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                                color: message.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
                                border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                                fontSize: '0.85rem', fontWeight: 600,
                            }}>
                            {message.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Today already saved — green lock banner with Edit option */}
                {isAlreadySaved && !isPast && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.82rem', color: 'var(--success-color)', fontWeight: 500 }}>
                        <CheckCircle size={15} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>
                            Attendance already submitted for today{savedAt && <> at <strong>{savedAt}</strong></>}. This is a read-only view.
                        </span>
                        <button
                            onClick={() => setIsAlreadySaved(false)}
                            style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success-color)', borderRadius: '6px', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                            Edit
                        </button>
                    </div>
                )}

                {/* Past mode notice */}
                {isPast && savedRecords.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', fontSize: '0.82rem', color: '#7c3aed', fontWeight: 500 }}>
                        <Clock size={14} />
                        Attendance was marked for this date
                        {savedAt && <strong> at {savedAt}</strong>}.
                        You are viewing a read-only record.
                    </div>
                )}
                {isPast && savedRecords.length === 0 && !loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', marginBottom: '1rem', borderRadius: '8px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', fontSize: '0.82rem', color: 'var(--warning-color)', fontWeight: 500 }}>
                        <AlertCircle size={14} />
                        No attendance was marked for {displayDate}.
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem' }}>
                        <div style={{ width: 22, height: 22, border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>Loading records…</span>
                    </div>
                ) : students.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--sidebar-text)', fontSize: '0.85rem' }}>
                        <Users size={36} color="var(--border-color)" style={{ margin: '0 auto 0.75rem' }} />
                        <p>No students enrolled yet.</p>
                    </div>
                ) : (
                    <>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '0.7rem 0.75rem', textAlign: 'left', fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>#</th>
                                    <th style={{ padding: '0.7rem 0.75rem', textAlign: 'left', fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Roll No</th>
                                    <th style={{ padding: '0.7rem 0.75rem', textAlign: 'left', fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Student Name</th>
                                    <th style={{ padding: '0.7rem 0.75rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--sidebar-text)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                        {isReadOnly ? 'Status' : 'Mark Attendance'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, idx) => {
                                    const status = attendanceState[s.student_id];
                                    return (
                                        <motion.tr key={s.student_id} className="att-row"
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.025, duration: 0.3 }}
                                            style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.78rem', color: 'var(--sidebar-text)', width: 36 }}>{idx + 1}</td>
                                            <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.82rem' }}>{s.roll_number}</td>
                                            <td style={{ padding: '0.85rem 0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <div style={{
                                                        width: 30, height: 30, borderRadius: '50%',
                                                        background: status === 'Present' ? 'rgba(16,185,129,0.1)' : status === 'Absent' ? 'rgba(239,68,68,0.1)' : 'rgba(79,70,229,0.08)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.7rem', fontWeight: 700,
                                                        color: status === 'Present' ? 'var(--success-color)' : status === 'Absent' ? 'var(--danger-color)' : 'var(--primary-color)',
                                                        flexShrink: 0,
                                                    }}>
                                                        {s.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                                                {isReadOnly ? (
                                                    // Read-only history view
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                                        {status === 'Present' ? (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success-color)', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                                                                <CheckCircle size={13} /> Present
                                                            </span>
                                                        ) : status === 'Absent' ? (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger-color)', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                                                                <XCircle size={13} /> Absent
                                                            </span>
                                                        ) : (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(148,163,184,0.12)', color: 'var(--sidebar-text)', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                                                                — Not recorded
                                                            </span>
                                                        )}
                                                        {savedAt && status && (
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--sidebar-text)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                                <Clock size={11} /> {savedAt}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    // Live marking buttons
                                                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                                        <button
                                                            className="att-btn"
                                                            onClick={() => toggleAttendance(s.student_id, 'Present')}
                                                            style={{
                                                                background: status === 'Present' ? 'var(--success-color)' : 'transparent',
                                                                color: status === 'Present' ? '#fff' : 'var(--success-color)',
                                                                borderColor: 'var(--success-color)',
                                                            }}>
                                                            {status === 'Present' && <CheckCircle size={12} style={{ display: 'inline', marginRight: 3 }} />}
                                                            Present
                                                        </button>
                                                        <button
                                                            className="att-btn"
                                                            onClick={() => toggleAttendance(s.student_id, 'Absent')}
                                                            style={{
                                                                background: status === 'Absent' ? 'var(--danger-color)' : 'transparent',
                                                                color: status === 'Absent' ? '#fff' : 'var(--danger-color)',
                                                                borderColor: 'var(--danger-color)',
                                                            }}>
                                                            {status === 'Absent' && <XCircle size={12} style={{ display: 'inline', marginRight: 3 }} />}
                                                            Absent
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Footer actions */}
                        {!isReadOnly && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => {
                                            const all: Record<string, 'Present' | 'Absent'> = {};
                                            students.forEach(s => { all[s.student_id] = 'Present'; });
                                            setAttendanceState(all);
                                        }}
                                        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--success-color)', borderRadius: '8px', padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                                        Mark all present
                                    </button>
                                    <button
                                        onClick={() => fetchStudentsAndAttendance(teacherId, dateStr, selectedSection)}
                                        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--sidebar-text)', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        <RefreshCw size={12} /> Reset
                                    </button>
                                </div>
                                <button
                                    onClick={handleSave}
                                    className="btn-primary"
                                    disabled={saving || geoStatus === 'checking'}
                                    style={{ minWidth: 150, fontSize: '0.88rem' }}>
                                    {geoStatus === 'checking' ? (
                                        <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Verifying location…</>
                                    ) : saving ? 'Saving…' : 'Save Attendance'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}