import { useEffect, useState } from 'react';
import { Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { useAuth } from '@/context/AuthContext';
import { getUsers } from '@/services/user';
import { criarBonus } from '@/services/bonus';
import { apiMessage, formatCurrency } from '@/lib/format';

export default function Funcionario() {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [tempo, setTempo] = useState('1');
  const [valor, setValor] = useState('500');
  const [foto, setFoto] = useState('');
  const [resultado, setResultado] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('https://dog.ceo/api/breeds/image/random')
      .then((resp) => resp.json())
      .then((data) => setFoto(data.message))
      .catch(() => {});

    if (isAdmin) {
      getUsers()
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setUsers(list);
          if (list[0]) setUsuarioId(String(list[0].id));
        })
        .catch((err) => toast.error(apiMessage(err)));
    }
  }, [isAdmin]);

  const colaborador = users.find((item) => String(item.id) === usuarioId);

  async function handleSalvar() {
    const valorNum = Number(valor);
    const tempoNum = Number(tempo);
    const total = valorNum * tempoNum;
    const nome = colaborador?.nome || user.nome;

    if (isAdmin && usuarioId) {
      try {
        setSaving(true);
        await criarBonus(Number(usuarioId), {
          descricao: `Colaborador destaque · ${tempoNum} ano(s) de casa`,
          tipo: 'FIXO',
          valorFixo: total,
        });
        toast.success('Bônus registrado na API.');
      } catch (err) {
        toast.error(apiMessage(err, 'Não foi possível gravar o bônus.'));
        return;
      } finally {
        setSaving(false);
      }
    }

    setResultado({ nome, tempo: tempoNum, total });
  }

  return (
    <AppShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Colaborador destaque</h1>
          <p className="text-sm text-muted-foreground">
            Reconhecimento interno. Administradores gravam o valor como bônus fixo na API.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5 text-primary" />
              Escolher destaque
            </CardTitle>
            <CardDescription>O valor total é tempo de casa × gratificação anual.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {isAdmin ? (
                <Field>
                  <FieldLabel>Colaborador</FieldLabel>
                  <Select value={usuarioId} onValueChange={setUsuarioId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {users.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.nome}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              ) : (
                <Field>
                  <FieldLabel>Colaborador</FieldLabel>
                  <Input value={user.nome} disabled />
                </Field>
              )}
              <Field>
                <FieldLabel>Anos de casa</FieldLabel>
                <Input type="number" min="1" value={tempo} onChange={(e) => setTempo(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Gratificação por ano (R$)</FieldLabel>
                <Input type="number" min="1" value={valor} onChange={(e) => setValor(e.target.value)} />
              </Field>
            </FieldGroup>
            <Button onClick={handleSalvar} disabled={saving}>
              {saving && <Loader2 data-icon="inline-start" className="animate-spin" />}
              Confirmar destaque
            </Button>
          </CardContent>
        </Card>

        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle>{resultado.nome}</CardTitle>
              <CardDescription>
                Reconhecido por {resultado.tempo} ano(s) de empresa. Gratificação de {formatCurrency(resultado.total)}.
              </CardDescription>
            </CardHeader>
            {foto && (
              <CardContent>
                <img src={foto} alt="Ilustração do destaque" className="max-h-72 w-full rounded-xl object-cover" />
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </AppShell>
  );
}
