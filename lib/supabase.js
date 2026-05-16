import { createClient } from '@supabase/supabase-js';

let supabaseClient;

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const key = serviceKey || anonKey;

    if (!supabaseUrl || !key) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL and a Supabase key (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)',
      );
    }

    supabaseClient = createClient(supabaseUrl, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseClient;
}

export async function insertBusiness(data) {
  try {
    const { data: row, error } = await getSupabase()
      .from('businesses')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`insertBusiness failed: ${err.message}`);
  }
}

export async function getBusiness(id) {
  try {
    const { data: row, error } = await getSupabase()
      .from('businesses')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`getBusiness failed: ${err.message}`);
  }
}

export async function updateBusiness(id, data) {
  try {
    const { data: row, error } = await getSupabase()
      .from('businesses')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`updateBusiness failed: ${err.message}`);
  }
}

export async function getAllBusinesses() {
  try {
    const { data: rows, error } = await getSupabase()
      .from('businesses')
      .select()
      .order('created_at', { ascending: false });

    if (error) throw error;
    return rows;
  } catch (err) {
    throw new Error(`getAllBusinesses failed: ${err.message}`);
  }
}

export async function getBusinessByTwilioPhone(twilio_phone_number) {
  try {
    const { data: rows, error } = await getSupabase()
      .from('businesses')
      .select()
      .eq('twilio_phone_number', twilio_phone_number)
      .limit(1);

    if (error) throw error;
    return rows?.[0] ?? null;
  } catch (err) {
    throw new Error(`getBusinessByTwilioPhone failed: ${err.message}`);
  }
}

export async function getCustomerByPhone(phone_number) {
  try {
    const { data: row, error } = await getSupabase()
      .from('customers')
      .select()
      .eq('phone_number', phone_number)
      .maybeSingle();

    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`getCustomerByPhone failed: ${err.message}`);
  }
}

export async function insertCustomer(phone_number) {
  try {
    const { data: row, error } = await getSupabase()
      .from('customers')
      .insert({ phone_number })
      .select()
      .single();

    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`insertCustomer failed: ${err.message}`);
  }
}

export async function updateCustomerLastSeen(customer_id) {
  try {
    const { data: existing, error: fetchError } = await getSupabase()
      .from('customers')
      .select('total_calls')
      .eq('id', customer_id)
      .single();

    if (fetchError) throw fetchError;

    const { data: row, error } = await getSupabase()
      .from('customers')
      .update({
        last_seen: new Date().toISOString(),
        total_calls: (existing?.total_calls ?? 0) + 1,
      })
      .eq('id', customer_id)
      .select()
      .single();

    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`updateCustomerLastSeen failed: ${err.message}`);
  }
}

export async function insertCall(data) {
  try {
    const { data: row, error } = await getSupabase()
      .from('calls')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`insertCall failed: ${err.message}`);
  }
}

export async function getCallsByBusiness(business_id) {
  try {
    const { data: rows, error } = await getSupabase()
      .from('calls')
      .select(
        `
        *,
        customers (
          name,
          phone_number
        )
      `,
      )
      .eq('business_id', business_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return rows;
  } catch (err) {
    throw new Error(`getCallsByBusiness failed: ${err.message}`);
  }
}

export async function getCallsByCustomer(customer_id) {
  try {
    const { data: rows, error } = await getSupabase()
      .from('calls')
      .select()
      .eq('customer_id', customer_id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return rows;
  } catch (err) {
    throw new Error(`getCallsByCustomer failed: ${err.message}`);
  }
}

export async function insertComparison(
  call_id,
  google_transcript,
  valsea_transcript,
) {
  try {
    const { data: row, error } = await getSupabase()
      .from('call_comparisons')
      .insert({ call_id, google_transcript, valsea_transcript })
      .select()
      .single();

    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`insertComparison failed: ${err.message}`);
  }
}
