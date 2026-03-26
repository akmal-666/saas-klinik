import type { Metadata } from 'next';
import { EMRClient } from '@/components/emr/EMRClient';

export const metadata: Metadata = { title: 'Rekam Medis (EMR)' };

export default function EmrPage() {
  return <EMRClient />;
}
