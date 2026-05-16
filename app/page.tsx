import { redirect } from 'next/navigation';
import { getAllBusinesses } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const businesses = await getAllBusinesses();
    if (businesses?.length) {
      redirect('/dashboard');
    }
  } catch {
    /* env or DB unavailable — send to onboarding */
  }

  redirect('/onboarding');
}
