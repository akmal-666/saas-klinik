import type { Metadata } from 'next';
import { AppointmentClient } from '@/components/appointment/AppointmentClient';

export const metadata: Metadata = { title: 'Appointment' };

export default function AppointmentPage() {
  return <AppointmentClient />;
}
