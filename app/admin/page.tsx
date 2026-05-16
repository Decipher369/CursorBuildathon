import { redirect } from 'next/navigation';
import AdminView from '@/app/components/views/AdminView';
import { getAllBusinesses } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let businesses;
  try {
    businesses = await getAllBusinesses();
  } catch {
    redirect('/onboarding');
  }

  if (!businesses?.length) {
    redirect('/onboarding');
  }

  return <AdminView business={businesses[0]} />;
}
