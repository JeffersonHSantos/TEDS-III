import { useCallback, useEffect, useState } from 'react';
import { Loader2, Play, Save } from 'lucide-react';
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
import { getUsers } from '@/services/user';
import { detalheFolha, gerarFolha, listarFolhas, preCalculoFolha } from '@/services/folha';
import { apiMessage, formatCurrency, formatDate, periodoMesAtual } from '@/lib/format';

function ResumoFolha({ data }) {
  if (!data) return null;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">Horas normais</p>
        <p className="text-lg font-semibold">{data.totalHorasNormais}</p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">Horas extras</p>
        <p className="text-lg font-semibold">{data.totalHorasExtras}</p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">Bruto</p>
        <p className="text-lg font-semibold">{formatCurrency(data.salarioBruto)}</p>
      </div>
      <div className="rounded-lg border border-border p-3">
        <p className="text-xs text-muted-foreground">Líquido</p>
        <p className="text-lg font-semibold">{formatCurrency(data.salarioLiquido)}</p>
      </div>
    </div>
  );
}

export default function Folha() {
  const { user, isAdmin } = useAuth();
  const mes = periodoMesAtual();
  const [users, setUsers] = useState([]);
  const [usuarioId, setUsuarioId] = useState(String(user.id));
  const [dataInicio, setDataInicio] = useState(mes.dataInicio);
  const [dataFim, setDataFim] = useState(mes.dataFim);
  const [preCalculo, setPreCalculo] = useState(null);
  const [folhas, setFolhas] = useState([]);
  const [detalhe, setDetalhe] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    getUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(apiMessage(err)));
  }, [isAdmin]);

  const carregarFolhas = useCallback(async (id = Number(usuarioId)) => {
    try {
      const data = await listarFolhas(id);
      setFolhas(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(apiMessage(err, 'Não foi possível listar as folhas.'));
    }
  }, [usuarioId]);

  useEffect(() => {
    void Promise.resolve().then(() => carregarFolhas(Number(usuarioId)));
    void Promise.resolve().then(() => {
      setPreCalculo(null);
      setDetalhe(null);
    });
  }, [carregarFolhas, usuarioId]);

  async function handlePreCalculo() {
    try {
      setLoading(true);
      const data = await preCalculoFolha(Number(usuarioId), { dataInicio, dataFim });
      setPreCalculo(data);
      toast.success('Pré-cálculo gerado.');
    } catch (err) {
      toast.error(apiMessage(err, 'Falha no pré-cálculo.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGerar() {
    try {
      setLoading(true);
      await gerarFolha(Number(usuarioId), { periodoInicio: dataInicio, periodoFim: dataFim });
      toast.success('Folha persistida.');
      await carregarFolhas();
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao gerar a folha.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDetalhe(folhaId) {
    try {
      const data = await detalheFolha(Number(usuarioId), folhaId);
      setDetalhe(data);
    } catch (err) {
      toast.error(apiMessage(err, 'Não foi possível abrir o detalhe.'));
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Folha de pagamento</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? 'Simule e gere a folha de qualquer colaborador.'
              : 'Consulte as folhas já geradas no seu cadastro.'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Período</CardTitle>
            <CardDescription>O cálculo usa ponto, valor-hora e regras financeiras ativas.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {isAdmin && (
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
              )}
              <Field>
                <FieldLabel>Início</FieldLabel>
                <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Fim</FieldLabel>
                <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </Field>
              {isAdmin && (
                <div className="flex items-end gap-2">
                  <Button onClick={handlePreCalculo} disabled={loading}>
                    {loading ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Play data-icon="inline-start" />}
                    Simular
                  </Button>
                  <Button variant="outline" onClick={handleGerar} disabled={loading}>
                    <Save data-icon="inline-start" />
                    Gerar
                  </Button>
                </div>
              )}
            </FieldGroup>
          </CardContent>
        </Card>

        {preCalculo && (
          <Card>
            <CardHeader>
              <CardTitle>Pré-cálculo</CardTitle>
              <CardDescription>
                Bruto extra {formatCurrency(preCalculo.salarioBrutoExtra)} · descontos {formatCurrency(preCalculo.totalDescontos)} · adicionais {formatCurrency(preCalculo.totalAdicionais)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ResumoFolha data={preCalculo} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Folhas geradas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {folhas.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Nenhuma folha neste colaborador.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Bruto</TableHead>
                    <TableHead>Líquido</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {folhas.map((folha) => (
                    <TableRow key={folha.id}>
                      <TableCell>#{folha.id}</TableCell>
                      <TableCell>
                        {formatDate(folha.periodoInicio)} — {formatDate(folha.periodoFim)}
                      </TableCell>
                      <TableCell>{formatCurrency(folha.salarioBruto)}</TableCell>
                      <TableCell>{formatCurrency(folha.salarioLiquido)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => handleDetalhe(folha.id)}>
                          Detalhe
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {detalhe && (
          <Card>
            <CardHeader>
              <CardTitle>Folha #{detalhe.id}</CardTitle>
              <CardDescription>
                {formatDate(detalhe.periodoInicio)} a {formatDate(detalhe.periodoFim)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ResumoFolha data={detalhe} />
              <div className="flex flex-col gap-2">
                {(detalhe.itens || []).map((item, index) => (
                  <div key={`${item.descricao}-${index}`} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.natureza === 'DESCONTO' ? 'destructive' : 'secondary'}>
                        {item.natureza}
                      </Badge>
                      <span>{item.descricao}</span>
                    </div>
                    <span>{formatCurrency(item.valor)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
