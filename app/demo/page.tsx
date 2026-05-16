import { redirect } from 'next/navigation';
import DemoPanel from '@/app/components/DemoPanel';
import { getAllBusinesses } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function DemoPage() {
  let businesses;
  try {
    businesses = await getAllBusinesses();
  } catch {
    redirect('/onboarding');
  }

  if (!businesses?.length) {
    redirect('/onboarding');
  }

  return <DemoPanel business={businesses[0]} />;
}
