import type { Metadata } from 'next';
import { MasterDataClient } from '@/components/masterdata/MasterDataClient';
export const metadata: Metadata = { title: 'Master Data' };
export default function MasterDataPage() { return <MasterDataClient />; }
