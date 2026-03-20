'use client';

import { useEffect, useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportRow {
    student_id: string;
    name: string;
    roll_number: string;
    totalClasses: number;
    presentClasses: number;
    absentClasses: number;
    attendancePercentage: number;
}

export default function AttendanceReport() {
    const [report, setReport] = useState<ReportRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [teacherId, setTeacherId] = useState<string>('');

    const fetchContext = async () => {
        try {
            const res = await fetch('/api/teacher/me');
            const data = await res.json();
            if (data.success && data.user) {
                setTeacherId(data.user.id);
            }
        } catch { }
    };

    const fetchReport = async (tid: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/teacher/report?teacher_id=${tid}`);
            const data = await res.json();
            if (data.success) {
                setReport(data.report);
            }
        } catch { }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchContext();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (teacherId) fetchReport(teacherId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teacherId]);

    // EXPORT FUNCTIONALITY ---------------------------------
    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Professional Attendance Report - Ubiquitous", 14, 15);
        const tableColumn = ["Roll No", "Student Name", "Total", "Present", "Absent", "Percentage"];
        const tableRows: (string | number)[][] = [];
        report.forEach(r => {
            const rowData = [r.roll_number, r.name, r.totalClasses, r.presentClasses, r.absentClasses, `${r.attendancePercentage}%`];
            tableRows.push(rowData);
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
        doc.save("Attendance_Report.pdf");
    };

    const downloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(report.map(r => ({
            "Roll No": r.roll_number,
            "Student Name": r.name,
            "Total Classes": r.totalClasses,
            "Present": r.presentClasses,
            "Absent": r.absentClasses,
            "Percentage (%)": r.attendancePercentage
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
        XLSX.writeFile(workbook, "Attendance_Report.xlsx");
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="printable-area">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                    <FileText size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary-color)' }} />
                    Attendance Analytical Report
                </h1>
                <div style={{ display: 'flex', gap: '0.8rem' }} className="no-print">
                    <button onClick={downloadPDF} className="btn-primary" style={{ backgroundColor: 'var(--danger-color)', boxShadow: 'none' }}><Download size={18} /> Export PDF</button>
                    <button onClick={downloadExcel} className="btn-primary" style={{ backgroundColor: 'var(--success-color)' }}><Download size={18} /> Export Excel</button>
                    <button onClick={handlePrint} className="btn-primary" style={{ backgroundColor: '#64748b' }}><Printer size={18} /> Print View</button>
                </div>
            </div>

            <div className="card table-container">
                {loading ? (
                    <p>Analyzing and fetching report data...</p>
                ) : report.length === 0 ? (
                    <p style={{ color: 'var(--sidebar-text)' }}>No data available to generate report. Start taking attendance first!</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Student Name</th>
                                <th>Total Classes</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Percentage</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.map((r) => {
                                const isRisk = r.attendancePercentage < 75 && r.totalClasses > 0;
                                return (
                                    <tr key={r.student_id}>
                                        <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{r.roll_number}</td>
                                        <td style={{ fontWeight: 500 }}>{r.name}</td>
                                        <td>{r.totalClasses}</td>
                                        <td style={{ color: 'var(--success-color)', fontWeight: 600 }}>{r.presentClasses}</td>
                                        <td style={{ color: 'var(--danger-color)', fontWeight: 600 }}>{r.absentClasses}</td>
                                        <td>
                                            <span className="schedule-badge" style={{
                                                backgroundColor: isRisk ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                color: isRisk ? 'var(--danger-color)' : 'var(--success-color)',
                                            }}>
                                                {r.attendancePercentage}%
                                            </span>
                                        </td>
                                        <td>
                                            {isRisk ? (
                                                <span style={{ color: 'var(--danger-color)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>⚠ Action Required</span>
                                            ) : (
                                                <span style={{ color: 'var(--success-color)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>✔ Good Standing</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Hide elements when printing */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          .no-print { display: none !important; }
          .sidebar { display: none !important; }
          .card { box-shadow: none !important; border: none !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />
        </motion.div>
    );
}
