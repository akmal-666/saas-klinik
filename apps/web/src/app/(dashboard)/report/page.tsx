import type { Metadata } from 'next';
import { ReportClient } from '@/components/report/ReportClient';
export const metadata: Metadata = { title: 'Laporan' };
export default function ReportPage() { return <ReportClient />; }
