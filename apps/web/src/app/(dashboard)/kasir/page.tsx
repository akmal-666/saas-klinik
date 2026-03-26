import type { Metadata } from 'next';
import { KasirClient } from '@/components/kasir/KasirClient';
export const metadata: Metadata = { title: 'Kasir & Pembayaran' };
export default function KasirPage() { return <KasirClient />; }
