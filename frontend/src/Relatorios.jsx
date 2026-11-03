import { useEffect, useState } from 'react';
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
import { historicoPonto, resumoHoras } from '@/services/ponto';
import { consultarDsr } from '@/services/folha';
import { calcularFerias } from '@/services/ferias';
import { listarBonus } from '@/services/bonus';
import { apiMessage, formatCurrency, formatDate, formatTime, periodoMesAtual } from '@/lib/format';

const ABAS = [
  { id: 'horas', label: 'Horas e ponto' },
  { id: 'dsr', label: 'DSR' },
  { id: 'ferias', label: 'Férias' },
  { id: 'bonus', label: 'Bônus' },
];

export default function Relatorios() {
  const { user, isAdmin } = useAuth();
  const mes = periodoMesAtual();
  const [aba, setAba] = useState('horas');
  const [users, setUsers] = useState([]);
  const [usuarioId, setUsuarioId] = useState(String(user.id));
  const [dataInicio, setDataInicio] = useState(mes.dataInicio);
  const [dataFim, setDataFim] = useState(mes.dataFim);
  const [resumo, setResumo] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [dsr, setDsr] = useState(null);
  const [ferias, setFerias] = useState(null);
  const [diasFerias, setDiasFerias] = useState(30);
  const [bonus, setBonus] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    getUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => toast.error(apiMessage(err)));
  }, [isAdmin]);

  async function carregarHoras() {
    try {
      const id = isAdmin ? Number(usuarioId) : undefined;
      const [r, h] = await Promise.all([
        resumoHoras({ dataInicio, dataFim, usuarioId: id }),
        historicoPonto({ dataInicio, dataFim, usuarioId: id }),
      ]);
      setResumo(r);
      setHistorico(h.registros || []);
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao consultar horas.'));
    }
  }

  async function carregarDsr() {
    try {
      setDsr(await consultarDsr(Number(usuarioId), { dataInicio, dataFim }));
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao consultar DSR.'));
    }
  }

  async function carregarFerias() {
    if (!isAdmin) {
      toast.error('Apenas administradores calculam férias.');
      return;
    }
    try {
      setFerias(await calcularFerias(Number(usuarioId), Number(diasFerias)));
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao calcular férias.'));
    }
  }

  async function carregarBonus() {
    try {
      const data = await listarBonus(Number(usuarioId));
      setBonus(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao listar bônus.'));
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Horas, DSR, férias e bônus a partir da API.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ABAS.map((item) => (
            <Button
              key={item.id}
              variant={aba === item.id ? 'default' : 'outline'}
              onClick={() => setAba(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {isAdmin && (
                <Field>
                  <FieldLabel>Colaborador</FieldLabel>
                  <Select value={usuarioId} onValueChange={setUsuarioId}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
              {aba === 'ferias' && (
                <Field>
                  <FieldLabel>Dias de férias</FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={diasFerias}
                    onChange={(e) => setDiasFerias(e.target.value)}
                  />
                </Field>
              )}
            </FieldGroup>
            <div className="mt-4">
              {aba === 'horas' && <Button onClick={carregarHoras}>Consultar horas</Button>}
              {aba === 'dsr' && <Button onClick={carregarDsr}>Calcular DSR</Button>}
              {aba === 'ferias' && <Button onClick={carregarFerias}>Calcular férias</Button>}
              {aba === 'bonus' && <Button onClick={carregarBonus}>Listar bônus</Button>}
            </div>
          </CardContent>
        </Card>

        {aba === 'horas' && resumo && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo de horas</CardTitle>
              <CardDescription>
                Normais {resumo.totalHorasNormais} · extras {resumo.totalHorasExtras}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Almoço</TableHead>
                    <TableHead>Retorno</TableHead>
                    <TableHead>Saída</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historico.map((reg) => (
                    <TableRow key={reg.id || reg.data}>
                      <TableCell>{formatDate(reg.data)}</TableCell>
                      <TableCell>{formatTime(reg.entrada)}</TableCell>
                      <TableCell>{formatTime(reg.saidaAlmoco)}</TableCell>
                      <TableCell>{formatTime(reg.retornoAlmoco)}</TableCell>
                      <TableCell>{formatTime(reg.saida)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {aba === 'dsr' && dsr && (
          <Card>
            <CardHeader>
              <CardTitle>DSR sobre horas extras</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Dias úteis</p>
                <p className="text-lg font-semibold">{dsr.diasUteis}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Dias de descanso</p>
                <p className="text-lg font-semibold">{dsr.diasDescanso}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Extra</p>
                <p className="text-lg font-semibold">{formatCurrency(dsr.salarioBrutoExtra)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Valor DSR</p>
                <p className="text-lg font-semibold">{formatCurrency(dsr.valorDsr)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {aba === 'ferias' && ferias && (
          <Card>
            <CardHeader>
              <CardTitle>Cálculo de férias</CardTitle>
              <CardDescription>{ferias.diasFerias} dias + 1/3 constitucional</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Salário base</p>
                <p className="text-lg font-semibold">{formatCurrency(ferias.salarioBase)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Adicional 1/3</p>
                <p className="text-lg font-semibold">{formatCurrency(ferias.adicionalUmTerco)}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{formatCurrency(ferias.valorFerias)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {aba === 'bonus' && (
          <Card>
            <CardHeader>
              <CardTitle>Bônus concedidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bonus.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">Nenhum bônus neste colaborador.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bonus.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell>{item.tipo}</TableCell>
                        <TableCell>{formatCurrency(item.valorCalculado)}</TableCell>
                        <TableCell>{formatDate(item.concedidoEm)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
