import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

export default function AuthPage() {
  const { user, signIn, requestPasswordReset, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (error) {
      toast.error('E-mail ou senha inválidos.');
      return;
    }

    toast.success('Login realizado com sucesso!');
    navigate('/', { replace: true });
  };

  const handlePasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await requestPasswordReset(email.trim());
    setSubmitting(false);

    if (error) {
      toast.error('Não foi possível solicitar a recuperação de senha.');
      return;
    }

    toast.success('Se o e-mail estiver cadastrado, você receberá as instruções de acesso.');
    setResetMode(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center space-y-3 text-center">
          <img src="/mpaflow.png" alt="MPaFlow" className="h-40 max-w-full object-contain" />
          <CardDescription>
            {resetMode
              ? 'Informe seu e-mail para receber um link de recuperação.'
              : 'Acesso exclusivo para usuários convidados pelo administrador.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={resetMode ? handlePasswordReset : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email">E-mail</Label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                required
              />
            </div>

            {!resetMode && (
              <div className="space-y-2">
                <Label htmlFor="auth-password">Senha</Label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  maxLength={128}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {resetMode ? 'Enviar link de recuperação' : 'Entrar'}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setResetMode((current) => !current)}
              disabled={submitting}
            >
              {resetMode ? 'Voltar para o login' : 'Esqueci minha senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
