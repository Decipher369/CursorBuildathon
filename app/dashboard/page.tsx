import { redirect } from 'next/navigation';
import Dashboard from '@/app/components/Dashboard';
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

  return <Dashboard business={businesses[0]} />;
}
