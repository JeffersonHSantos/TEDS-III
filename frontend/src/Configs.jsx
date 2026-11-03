import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { updateOwnProfile } from '@/services/user';
import { atualizarRegra, criarRegra, listarRegras, removerRegra } from '@/services/regras';
import { apiMessage, formatCurrency } from '@/lib/format';

const TIPOS = ['FALTA', 'ATRASO', 'VALE_TRANSPORTE', 'VALE_REFEICAO', 'IMPOSTO', 'OUTRO'];

export default function Configs() {
  const { user, isAdmin } = useAuth();
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [senha, setSenha] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [regras, setRegras] = useState([]);
  const [form, setForm] = useState({
    tipo: 'OUTRO',
    descricao: '',
    natureza: 'DESCONTO',
    modo: 'percentual',
    valor: '',
  });

  async function carregarRegras() {
    try {
      const data = await listarRegras();
      setRegras(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao listar regras.'));
    }
  }

  useEffect(() => {
    void Promise.resolve().then(carregarRegras);
  }, []);

  async function handleSaveProfile(event) {
    event.preventDefault();
    try {
      setSavingProfile(true);
      await updateOwnProfile(user.id, { nome, email, senha });
      toast.success('Perfil atualizado. O nome no menu vale no próximo login.');
      setSenha('');
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao atualizar perfil.'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleCreateRegra(event) {
    event.preventDefault();
    const payload = {
      tipo: form.tipo,
      descricao: form.descricao,
      natureza: form.natureza,
    };
    if (form.modo === 'percentual') payload.percentual = Number(form.valor);
    else payload.valorFixo = Number(form.valor);

    try {
      await criarRegra(payload);
      toast.success('Regra criada.');
      setForm((prev) => ({ ...prev, descricao: '', valor: '' }));
      await carregarRegras();
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao criar regra.'));
    }
  }

  async function toggleRegra(regra) {
    try {
      await atualizarRegra(regra.id, { ativo: !regra.ativo });
      await carregarRegras();
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao atualizar regra.'));
    }
  }

  async function handleRemove(id) {
    try {
      await removerRegra(id);
      toast.success('Regra removida.');
      await carregarRegras();
    } catch (err) {
      toast.error(apiMessage(err, 'Não foi possível remover. Se já entrou em folha, desative.'));
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">Perfil da conta e regras financeiras da folha.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meu perfil</CardTitle>
            <CardDescription>Colaboradores só alteram nome, e-mail e senha.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field>
                  <FieldLabel>Nome</FieldLabel>
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>E-mail</FieldLabel>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Nova senha</FieldLabel>
                  <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Opcional" />
                </Field>
              </FieldGroup>
              <div>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile && <Loader2 data-icon="inline-start" className="animate-spin" />}
                  Salvar perfil
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regras financeiras</CardTitle>
            <CardDescription>
              Descontos e adicionais aplicados no cálculo da folha.
              {!isAdmin && ' Colaboradores veem apenas as regras ativas.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {isAdmin && (
              <form onSubmit={handleCreateRegra} className="flex flex-col gap-4 rounded-lg border border-border p-4">
                <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <Field>
                    <FieldLabel>Tipo</FieldLabel>
                    <Select value={form.tipo} onValueChange={(tipo) => setForm((p) => ({ ...p, tipo }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {TIPOS.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Natureza</FieldLabel>
                    <Select value={form.natureza} onValueChange={(natureza) => setForm((p) => ({ ...p, natureza }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="DESCONTO">DESCONTO</SelectItem>
                          <SelectItem value="ADICIONAL">ADICIONAL</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Modo</FieldLabel>
                    <Select value={form.modo} onValueChange={(modo) => setForm((p) => ({ ...p, modo }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="percentual">Percentual</SelectItem>
                          <SelectItem value="fixo">Valor fixo</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel>Descrição</FieldLabel>
                    <Input value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} />
                  </Field>
                  <Field>
                    <FieldLabel>{form.modo === 'percentual' ? 'Percentual' : 'Valor (R$)'}</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.valor}
                      onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))}
                    />
                  </Field>
                </FieldGroup>
                <Button type="submit">
                  <Plus data-icon="inline-start" />
                  Adicionar regra
                </Button>
              </form>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Natureza</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {regras.map((regra) => (
                  <TableRow key={regra.id}>
                    <TableCell>{regra.descricao}</TableCell>
                    <TableCell>{regra.tipo}</TableCell>
                    <TableCell>
                      <Badge variant={regra.natureza === 'DESCONTO' ? 'destructive' : 'secondary'}>
                        {regra.natureza}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {regra.valorFixo != null ? formatCurrency(regra.valorFixo) : `${(regra.percentual * 100).toFixed(1)}%`}
                    </TableCell>
                    <TableCell>{regra.ativo ? 'Ativa' : 'Inativa'}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => toggleRegra(regra)}>
                            {regra.ativo ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRemove(regra.id)}>
                            <Trash2 data-icon="inline-start" />
                            Remover
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
