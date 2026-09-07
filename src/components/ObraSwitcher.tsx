import { FormEvent, useState } from 'react';
import { Building2, ChevronDown, Loader2, UserPlus } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ObraSwitcher() {
  const { obras, activeObraId, selectObra, inviteMember } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    const invited = await inviteMember(email);
    setSubmitting(false);

    if (invited) {
      setEmail('');
      setDialogOpen(false);
    }
  };

  if (!activeObraId) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <Building2 className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select
          aria-label="Obra ativa"
          className="h-9 max-w-[120px] appearance-none rounded-md border border-input bg-background py-1 pl-8 pr-7 text-xs font-medium outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:max-w-[180px] sm:text-sm lg:max-w-[240px]"
          value={activeObraId}
          onChange={(event) => selectObra(event.target.value)}
        >
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9" title="Compartilhar obra">
            <UserPlus className="h-4 w-4" />
            <span className="sr-only">Compartilhar obra</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleInvite} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Compartilhar obra</DialogTitle>
              <DialogDescription>
                O usuário terá acesso completo a todos os dados desta obra. Ele precisa ter criado uma conta antes do convite.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="member-email">E-mail do usuário</Label>
              <Input
                id="member-email"
                type="email"
                autoComplete="email"
                placeholder="engenheiro@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting || !email.trim()}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Conceder acesso completo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
