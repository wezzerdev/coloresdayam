import { createClient } from '@supabase/supabase-js';

// URL y ANON KEY fijas de supabasedayam.nocodepy.com
const SUPABASE_URL = 'https://supabasedayam.nocodepy.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODcwODUzNTksImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.yCjM7gqjQnZRv577dAW8vvMDK9e8H2-eWvSHisg2lfM';

console.log('[API Client] Conectado nativamente a Supabase:', SUPABASE_URL);

// Cliente oficial de Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Extensiones de compatibilidad para nuestro flujo de UI profesional
supabase.auth.verifyCode = async function({ email, code }) {
  return await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'signup'
  });
};

supabase.auth.forgotPassword = async function({ email }) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth?reset=true`
  });
};

supabase.auth.resetPassword = async function({ newPassword }) {
  return await supabase.auth.updateUser({
    password: newPassword
  });
};

supabase.auth.updateProfile = async function({ name }) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: userError };

  const { error: updateError } = await supabase.auth.updateUser({
    data: { name }
  });

  if (updateError) return { data: null, error: updateError };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, name, email: user.email, updated_at: new Date().toISOString() })
    .select()
    .single();

  return { data: profile || { ...user, name }, error: profileError };
};

supabase.auth.changePassword = async function({ newPassword }) {
  return await supabase.auth.updateUser({
    password: newPassword
  });
};
