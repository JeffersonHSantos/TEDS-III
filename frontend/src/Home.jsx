import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, Loader2, Timer, Users, Wallet } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import PontoCard from '@/components/ponto/PontoCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getUsers } from '@/services/user';
import { listarFolhas } from '@/services/folha';
import { resumoHoras } from '@/services/ponto';
import { periodoMesAtual } from '@/lib/format';

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ total: 0, horas: 0, extras: 0, folhas: 0 });
  const [loading, setLoading] = useState(true);
  const periodo = periodoMesAtual();

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [resumo, folhas, users] = await Promise.all([
          resumoHoras(periodo).catch(() => null),
          listarFolhas(user.id).catch(() => []),
          isAdmin ? getUsers().catch(() => []) : Promise.resolve([]),
        ]);
        if (!active) return;
        setStats({
          total: Array.isArray(users) ? users.length : 0,
          horas: resumo?.totalHorasNormais ?? 0,
          extras: resumo?.totalHorasExtras ?? 0,
          folhas: Array.isArray(folhas) ? folhas.length : 0,
        });
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [isAdmin, user.id]);

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.nome?.split(' ')[0]}</h1>
          <p className="text-sm text-muted-foreground">
            Painel do {isAdmin ? 'administrador' : 'colaborador'} · período {periodo.dataInicio} a {periodo.dataFim}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Colaboradores</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-2xl font-bold">{loading ? '—' : stats.total}</p>
                <Users className="size-5 text-primary" />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Horas no mês</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-2xl font-bold">{loading ? '—' : stats.horas}</p>
              <Timer className="size-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Horas extras</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-2xl font-bold">{loading ? '—' : stats.extras}</p>
              <Wallet className="size-5 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Folhas geradas</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-2xl font-bold">{loading ? '—' : stats.folhas}</p>
              <FileSpreadsheet className="size-5 text-primary" />
            </CardContent>
          </Card>
        </div>

        <PontoCard />

        <Card>
          <CardHeader>
            <CardTitle>Atalhos</CardTitle>
            <CardDescription>Os módulos abaixo usam a API já existente no backend.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {isAdmin && (
              <>
                <Button variant="outline" render={<Link to="/cadastro" />}>Cadastrar colaborador</Button>
                <Button variant="outline" render={<Link to="/usuarios" />}>Gerir usuários</Button>
              </>
            )}
            <Button variant="outline" render={<Link to="/folha" />}>Folha de pagamento</Button>
            <Button variant="outline" render={<Link to="/relatorios" />}>Relatórios</Button>
            <Button variant="outline" render={<Link to="/configs" />}>Configurações</Button>
            {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
