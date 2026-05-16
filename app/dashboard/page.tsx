import { redirect } from 'next/navigation';
import CallSenseApp from '@/app/components/CallSenseApp';
import { getAllBusinesses } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let businesses;
  try {
    businesses = await getAllBusinesses();
  } catch {
    redirect('/onboarding');
  }

  if (!businesses?.length) {
    redirect('/onboarding');
  }

  return <CallSenseApp business={businesses[0]} initialView="dashboard" />;
}
