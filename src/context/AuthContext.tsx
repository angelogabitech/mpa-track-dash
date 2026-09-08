import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const manualSignOutRef = useRef(false);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_OUT' && !manualSignOutRef.current) {
        toast.warning('Sua sessão foi encerrada porque esta conta entrou em outro dispositivo.');
      }
      if (event === 'SIGNED_OUT') manualSignOutRef.current = false;

      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    if (!user) {
      setIsAdmin(false);
      return () => { active = false; };
    }

    void supabase.rpc('is_platform_admin').then(({ data, error }) => {
      if (active) setIsAdmin(!error && data === true);
    });

    return () => { active = false; };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    const { error: revokeError } = await supabase.auth.signOut({ scope: 'others' });
    if (revokeError) {
      manualSignOutRef.current = true;
      await supabase.auth.signOut({ scope: 'local' });
      return { error: new Error('Não foi possível garantir a sessão única. Tente novamente.') };
    }

    return { error: null };
  };

  const requestPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/definir-senha`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const signOut = async () => {
    manualSignOutRef.current = true;
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      manualSignOutRef.current = false;
      toast.error('Não foi possível encerrar a sessão.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signIn, requestPasswordReset, updatePassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
