import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

const supabaseUrl = 'https://ggraprtaxuysvaaiccqv.supabase.co';
const supabaseKey = 'sb_publishable_AHStuHwH550DhcIwWi_e0A_vv1SKbYU';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // No mobile, desativamos o armazenamento local web tradicional e usamos o fluxo nativo
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Capacitor.isNativePlatform(),
  },
});