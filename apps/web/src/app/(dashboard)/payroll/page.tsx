import type { Metadata } from 'next';
import { PayrollClient } from '@/components/payroll/PayrollClient';
export const metadata: Metadata = { title: 'Payroll Dokter' };
export default function PayrollPage() { return <PayrollClient />; }
