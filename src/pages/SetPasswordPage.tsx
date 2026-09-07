import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SetPasswordPage() {
  const { user, loading, updatePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 8) {
      toast.error('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmation) {
      toast.error('As senhas informadas não coincidem.');
      return;
    }

    setSubmitting(true);
    const { error } = await updatePassword(password);

    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }

    toast.success('Senha definida com sucesso. Entre com seu novo acesso.');
    await signOut();
    navigate('/auth', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <KeyRound className="h-10 w-10 text-muted-foreground" />
            <CardTitle>Link inválido ou expirado</CardTitle>
            <CardDescription>Solicite ao administrador um novo convite ou uma nova recuperação de senha.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/auth', { replace: true })}>
              Voltar para o login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <img src="/mpaflow.png" alt="MPaFlow" className="h-32 max-w-full object-contain" />
          <CardTitle>Defina sua senha</CardTitle>
          <CardDescription>Crie uma senha pessoal para acessar a obra atribuída a você.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
