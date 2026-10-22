import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  RefreshCw,
  Users,
  ShieldCheck,
  Building,
  DollarSign,
  AlertCircle,
  Loader2,
  X,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

import NavBar from './components/navbar/Nav';
import { getUsers, createUser, updateUser, deleteUser } from './services/user';
import { login } from './services/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';

const INITIAL_FORM_DATA = {
  nome: '',
  email: '',
  senha: '',
  cpf: '',
  role: 'EMPLOYEE',
  cargo: '',
  departamento: '',
  dataAdmissao: new Date().toISOString().split('T')[0],
  valorHora: '',
  cargaHorariaDiaria: '8',
  cargaHorariaSemanal: '44',
};

function formatCpf(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const clean = String(dateStr).split('T')[0];
  const parts = clean.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Cadastro() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Cadastro/Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de Exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carregamento dos dados da API
  async function carregarUsuarios() {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar colaboradores:', err);
      const msg = err.response?.data?.mensagem || err.message || 'Falha ao conectar com o servidor.';
      setError(msg);
      toast.error('Erro ao carregar colaboradores: ' + msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getUsers()
      .then((data) => {
        if (active) {
          setUsers(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error('Erro ao buscar colaboradores:', err);
          const msg = err.response?.data?.mensagem || err.message || 'Falha ao conectar com o servidor.';
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Atalho para autenticar com admin padrão de teste, se necessário
  async function handleQuickLogin() {
    try {
      setLoading(true);
      const authData = await login({ email: 'admin@empresa.com', senha: 'Admin@123' });
      localStorage.setItem('token', authData.token);
      toast.success('Autenticado com sucesso como Administrador!');
      await carregarUsuarios();
    } catch (err) {
      console.error('Falha no login:', err);
      toast.error('Não foi possível autenticar automaticamente.');
    } finally {
      setLoading(false);
    }
  }

  // Abertura da modal para ADICIONAR funcionário
  function handleOpenAddModal() {
    setEditingEmployee(null);
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
    setIsModalOpen(true);
  }

  // Abertura da modal para ATUALIZAR funcionário
  function handleOpenEditModal(emp) {
    setEditingEmployee(emp);
    setFormData({
      nome: emp.nome || '',
      email: emp.email || '',
      senha: '', // Senha vazia para manter a atual na edição
      cpf: formatCpf(emp.cpf || ''),
      role: emp.role || 'EMPLOYEE',
      cargo: emp.cargo || '',
      departamento: emp.departamento || '',
      dataAdmissao: emp.dataAdmissao ? emp.dataAdmissao.split('T')[0] : '',
      valorHora: emp.valorHora !== undefined && emp.valorHora !== null ? String(emp.valorHora) : '',
      cargaHorariaDiaria: emp.cargaHorariaDiaria !== undefined && emp.cargaHorariaDiaria !== null ? String(emp.cargaHorariaDiaria) : '8',
      cargaHorariaSemanal: emp.cargaHorariaSemanal !== undefined && emp.cargaHorariaSemanal !== null ? String(emp.cargaHorariaSemanal) : '44',
    });
    setFormErrors({});
    setIsModalOpen(true);
  }

  // Confirmação para EXCLUIR funcionário
  function handleRequestDelete(emp) {
    setEmployeeToDelete(emp);
    setDeleteDialogOpen(true);
  }

  // Execução da exclusão via API
  async function handleConfirmDelete() {
    if (!employeeToDelete) return;
    try {
      setIsDeleting(true);
      await deleteUser(employeeToDelete.id);
      toast.success(`Funcionário ${employeeToDelete.nome} excluído com sucesso!`);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      await carregarUsuarios();
    } catch (err) {
      console.error('Erro ao remover colaborador:', err);
      const msg = err.response?.data?.mensagem || err.message || 'Erro ao excluir.';
      toast.error(`Falha ao remover colaborador: ${msg}`);
    } finally {
      setIsDeleting(false);
    }
  }

  // Manipulação de campos do formulário
  function handleInputChange(field, value) {
    let processedValue = value;
    if (field === 'cpf') {
      processedValue = formatCpf(value);
    }
    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  // Validação do formulário
  function validateForm() {
    const errors = {};
    if (!formData.nome || formData.nome.trim().length < 2) {
      errors.nome = 'O nome completo é obrigatório.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Informe um e-mail válido.';
    }

    const rawCpf = String(formData.cpf || '').replace(/\D/g, '');
    if (rawCpf.length !== 11) {
      errors.cpf = 'O CPF deve ter exatamente 11 dígitos.';
    }

    if (!editingEmployee && (!formData.senha || formData.senha.trim().length < 3)) {
      errors.senha = 'A senha inicial deve ter pelo menos 3 caracteres.';
    }

    if (!formData.cargo || formData.cargo.trim().length === 0) {
      errors.cargo = 'O cargo é obrigatório.';
    }

    if (!formData.departamento || formData.departamento.trim().length === 0) {
      errors.departamento = 'O departamento é obrigatório.';
    }

    if (!formData.dataAdmissao) {
      errors.dataAdmissao = 'A data de admissão é obrigatória.';
    } else if (new Date(formData.dataAdmissao) > new Date()) {
      errors.dataAdmissao = 'A data de admissão não pode ser futura.';
    }

    const valorHoraNum = Number(formData.valorHora);
    if (isNaN(valorHoraNum) || valorHoraNum <= 0) {
      errors.valorHora = 'Informe um valor-hora numérico maior que zero.';
    }

    const diariaNum = Number(formData.cargaHorariaDiaria);
    if (isNaN(diariaNum) || diariaNum <= 0) {
      errors.cargaHorariaDiaria = 'Carga horária diária deve ser maior que zero.';
    }

    const semanalNum = Number(formData.cargaHorariaSemanal);
    if (isNaN(semanalNum) || semanalNum <= 0) {
      errors.cargaHorariaSemanal = 'Carga horária semanal deve ser maior que zero.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Submissão do formulário (Inserir ou Atualizar via API)
  async function handleSubmitForm(e) {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Verifique os campos destacados no formulário.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingEmployee) {
        // Atualizar via API
        await updateUser(editingEmployee.id, formData);
        toast.success(`Funcionário ${formData.nome} atualizado com sucesso!`);
      } else {
        // Inserir via API
        await createUser(formData);
        toast.success(`Funcionário ${formData.nome} cadastrado com sucesso!`);
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      await carregarUsuarios();
    } catch (err) {
      console.error('Erro ao salvar colaborador:', err);
      const msg = err.response?.data?.mensagem || err.message || 'Falha ao salvar dados.';
      toast.error(`Erro ao salvar colaborador: ${msg}`);
      setFormErrors((prev) => ({ ...prev, general: msg }));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Filtragem da tabela com a barra de pesquisa
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase().trim();
    const cleanDigits = term.replace(/\D/g, '');

    return users.filter((u) => {
      const matchNome = u.nome?.toLowerCase().includes(term);
      const matchEmail = u.email?.toLowerCase().includes(term);
      const matchCargo = u.cargo?.toLowerCase().includes(term);
      const matchDepto = u.departamento?.toLowerCase().includes(term);
      const matchRole = u.role?.toLowerCase().includes(term);
      const matchCpf = u.cpf ? u.cpf.includes(cleanDigits || term) : false;
      return matchNome || matchEmail || matchCargo || matchDepto || matchRole || matchCpf;
    });
  }, [users, searchTerm]);

  // Estatísticas resumidas para os cards de topo
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'ADMIN').length;
    const departments = new Set(users.map((u) => u.departamento).filter(Boolean)).size;
    const mediaValorHora =
      total > 0
        ? users.reduce((acc, u) => acc + (Number(u.valorHora) || 0), 0) / total
        : 0;

    return { total, admins, departments, mediaValorHora };
  }, [users]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <Toaster position="top-right" richColors />

      <main className="container mx-auto max-w-7xl px-4 py-8 flex flex-col gap-8">
        {/* Cabeçalho da página */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-primary animate-pulse" />
              <h1 className="text-3xl font-bold tracking-tight">Cadastro de Funcionários</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Gerencie colaboradores, atribuições, remuneração e credenciais corporativas integradas à API MegaPonto.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={carregarUsuarios}
              disabled={loading}
              title="Recarregar lista"
            >
              <RefreshCw data-icon="inline-start" className={loading ? 'animate-spin' : ''} />
              Atualizar
            </Button>
            <Button
              onClick={handleOpenAddModal}
              size="default"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
            >
              <UserPlus data-icon="inline-start" />
              Adicionar Funcionário
            </Button>
          </div>
        </div>

        {/* Cards de Métricas e Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-border bg-card/60 backdrop-blur-xs shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Colaboradores
              </CardTitle>
              <Users className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Colaboradores cadastrados</p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/60 backdrop-blur-xs shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Administradores
              </CardTitle>
              <ShieldCheck className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
              <p className="text-xs text-muted-foreground mt-1">Acesso irrestrito de gestão</p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/60 backdrop-blur-xs shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Departamentos
              </CardTitle>
              <Building className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.departments}</div>
              <p className="text-xs text-muted-foreground mt-1">Áreas ativas na empresa</p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card/60 backdrop-blur-xs shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Média Valor-Hora
              </CardTitle>
              <DollarSign className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.mediaValorHora)}</div>
              <p className="text-xs text-muted-foreground mt-1">Média salarial base por hora</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de erro ou necessidade de autenticação */}
        {error && (
          <Card className="border border-destructive/40 bg-destructive/10 text-destructive shadow-xs">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Não foi possível carregar os funcionários da API</p>
                  <p className="text-xs opacity-90">{error}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleQuickLogin}
                  className="border-destructive/40 hover:bg-destructive/20 text-destructive text-xs"
                >
                  <Lock data-icon="inline-start" />
                  Entrar como Admin
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={carregarUsuarios}
                  className="text-xs"
                >
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seção Principal: Busca e Tabela */}
        <Card className="border border-border shadow-sm bg-card">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Barra de Pesquisa */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por nome, email, CPF, cargo..."
                  className="pl-9 pr-8 h-9 text-sm bg-background/50 border-input focus:bg-background"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title="Limpar pesquisa"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Informações da filtragem */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  Exibindo <b>{filteredUsers.length}</b> de <b>{users.length}</b> colaboradores
                </span>
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    Filtro ativo
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Carregando lista de funcionários...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-3">
                <Users className="size-12 stroke-[1.2] text-muted-foreground/40" />
                <p className="text-base font-semibold text-foreground">
                  {searchTerm ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário cadastrado'}
                </p>
                <p className="text-xs max-w-md">
                  {searchTerm
                    ? `Nenhum resultado corresponde à busca "${searchTerm}". Tente outros termos ou limpe o campo.`
                    : 'Ainda não há colaboradores registrados na base de dados. Clique no botão acima para adicionar o primeiro.'}
                </p>
                {searchTerm ? (
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                    Limpar pesquisa
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleOpenAddModal} className="bg-primary text-primary-foreground font-semibold">
                    <UserPlus data-icon="inline-start" />
                    Cadastrar Primeiro Funcionário
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/60 hover:bg-transparent">
                      <TableHead className="w-16 text-center">ID</TableHead>
                      <TableHead className="min-w-56">Colaborador</TableHead>
                      <TableHead className="min-w-32">CPF</TableHead>
                      <TableHead className="min-w-44">Cargo / Depto</TableHead>
                      <TableHead className="min-w-28 text-center">Papel</TableHead>
                      <TableHead className="min-w-36">Remuneração</TableHead>
                      <TableHead className="min-w-28">Admissão</TableHead>
                      <TableHead className="min-w-44 text-right pr-6">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((emp) => {
                      const isAdmin = emp.role === 'ADMIN';
                      return (
                        <TableRow key={emp.id} className="border-b border-border/40 transition-colors hover:bg-muted/30">
                          {/* ID */}
                          <TableCell className="text-center font-mono text-xs text-muted-foreground">
                            #{emp.id}
                          </TableCell>

                          {/* Colaborador */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-xs text-primary shrink-0">
                                {getInitials(emp.nome)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-sm text-foreground truncate">{emp.nome}</span>
                                <span className="text-xs text-muted-foreground truncate">{emp.email}</span>
                              </div>
                            </div>
                          </TableCell>

                          {/* CPF */}
                          <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {formatCpf(emp.cpf)}
                          </TableCell>

                          {/* Cargo & Departamento */}
                          <TableCell>
                            <div className="flex flex-col text-xs leading-tight">
                              <span className="font-medium text-foreground">{emp.cargo || '-'}</span>
                              <span className="text-muted-foreground">{emp.departamento || '-'}</span>
                            </div>
                          </TableCell>

                          {/* Papel */}
                          <TableCell className="text-center">
                            <Badge
                              variant={isAdmin ? 'default' : 'secondary'}
                              className={
                                isAdmin
                                  ? 'bg-primary/20 text-primary border-primary/30 font-semibold'
                                  : 'text-muted-foreground font-normal'
                              }
                            >
                              {isAdmin ? 'ADMIN' : 'FUNCIONÁRIO'}
                            </Badge>
                          </TableCell>

                          {/* Remuneração */}
                          <TableCell>
                            <div className="flex flex-col text-xs leading-tight">
                              <span className="font-semibold text-foreground">
                                {formatCurrency(emp.valorHora)}/h
                              </span>
                              <span className="text-muted-foreground">
                                {emp.cargaHorariaSemanal || 40}h/sem ({emp.cargaHorariaDiaria || 8}h/dia)
                              </span>
                            </div>
                          </TableCell>

                          {/* Admissão */}
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(emp.dataAdmissao)}
                          </TableCell>

                          {/* Ações (Atualizar e Remover) */}
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEditModal(emp)}
                                className="h-8 px-2.5 text-xs hover:border-primary hover:text-primary transition-colors"
                                title="Atualizar funcionário"
                              >
                                <Pencil data-icon="inline-start" />
                                Atualizar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRequestDelete(emp)}
                                className="h-8 px-2.5 text-xs transition-colors"
                                title="Remover funcionário"
                              >
                                <Trash2 data-icon="inline-start" />
                                Remover
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modal Dialog Unificada para Inserir e Atualizar Funcionário */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-card border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              {editingEmployee ? (
                <>
                  <Pencil className="size-5 text-primary" />
                  Atualizar Funcionário
                </>
              ) : (
                <>
                  <UserPlus className="size-5 text-primary" />
                  Novo Funcionário
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingEmployee
                ? `Altere as informações de "${editingEmployee.nome}". As alterações serão persistidas via API.`
                : 'Preencha todos os campos obrigatórios para cadastrar o colaborador via API.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="flex flex-col gap-6 mt-2">
            {formErrors.general && (
              <div className="p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{formErrors.general}</span>
              </div>
            )}

            <FieldGroup className="flex flex-col gap-4">
              {/* Linha 1: Nome e E-mail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field data-invalid={!!formErrors.nome}>
                  <FieldLabel htmlFor="field-nome">Nome Completo *</FieldLabel>
                  <Input
                    id="field-nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Ex: Carlos Eduardo de Souza"
                    aria-invalid={!!formErrors.nome}
                  />
                  {formErrors.nome && <FieldError>{formErrors.nome}</FieldError>}
                </Field>

                <Field data-invalid={!!formErrors.email}>
                  <FieldLabel htmlFor="field-email">E-mail Corporativo *</FieldLabel>
                  <Input
                    id="field-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="carlos@empresa.com"
                    aria-invalid={!!formErrors.email}
                  />
                  {formErrors.email && <FieldError>{formErrors.email}</FieldError>}
                </Field>
              </div>

              {/* Linha 2: CPF e Senha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field data-invalid={!!formErrors.cpf}>
                  <FieldLabel htmlFor="field-cpf">CPF (11 dígitos) *</FieldLabel>
                  <Input
                    id="field-cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    aria-invalid={!!formErrors.cpf}
                  />
                  {formErrors.cpf && <FieldError>{formErrors.cpf}</FieldError>}
                </Field>

                <Field data-invalid={!!formErrors.senha}>
                  <FieldLabel htmlFor="field-senha">
                    {editingEmployee ? 'Nova Senha (opcional)' : 'Senha de Acesso *'}
                  </FieldLabel>
                  <Input
                    id="field-senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    placeholder={editingEmployee ? 'Deixe vazio para manter atual' : 'Mínimo 3 caracteres'}
                    aria-invalid={!!formErrors.senha}
                  />
                  {formErrors.senha && <FieldError>{formErrors.senha}</FieldError>}
                  {editingEmployee && !formErrors.senha && (
                    <FieldDescription className="text-xs">
                      Preencha apenas se desejar redefinir a senha do usuário.
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <Separator className="my-1" />

              {/* Linha 3: Papel (Role) e Departamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="field-role">Papel de Acesso *</FieldLabel>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => handleInputChange('role', val)}
                  >
                    <SelectTrigger id="field-role" className="w-full">
                      <SelectValue placeholder="Selecione o papel..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="EMPLOYEE">Funcionário Padrão (EMPLOYEE)</SelectItem>
                        <SelectItem value="ADMIN">Administrador (ADMIN)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription className="text-xs">
                    ADMIN possui acesso completo a todos os módulos e colaboradores.
                  </FieldDescription>
                </Field>

                <Field data-invalid={!!formErrors.departamento}>
                  <FieldLabel htmlFor="field-departamento">Departamento *</FieldLabel>
                  <Input
                    id="field-departamento"
                    value={formData.departamento}
                    onChange={(e) => handleInputChange('departamento', e.target.value)}
                    placeholder="Ex: TI, RH, Financeiro, Vendas..."
                    aria-invalid={!!formErrors.departamento}
                  />
                  {formErrors.departamento && <FieldError>{formErrors.departamento}</FieldError>}
                </Field>
              </div>

              {/* Linha 4: Cargo e Data de Admissão */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field data-invalid={!!formErrors.cargo}>
                  <FieldLabel htmlFor="field-cargo">Cargo *</FieldLabel>
                  <Input
                    id="field-cargo"
                    value={formData.cargo}
                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                    placeholder="Ex: Analista Financeiro, Desenvolvedor..."
                    aria-invalid={!!formErrors.cargo}
                  />
                  {formErrors.cargo && <FieldError>{formErrors.cargo}</FieldError>}
                </Field>

                <Field data-invalid={!!formErrors.dataAdmissao}>
                  <FieldLabel htmlFor="field-data-admissao">Data de Admissão *</FieldLabel>
                  <Input
                    id="field-data-admissao"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.dataAdmissao}
                    onChange={(e) => handleInputChange('dataAdmissao', e.target.value)}
                    aria-invalid={!!formErrors.dataAdmissao}
                  />
                  {formErrors.dataAdmissao && <FieldError>{formErrors.dataAdmissao}</FieldError>}
                </Field>
              </div>

              <Separator className="my-1" />

              {/* Linha 5: Remuneração e Cargas Horárias */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field data-invalid={!!formErrors.valorHora}>
                  <FieldLabel htmlFor="field-valor-hora">Valor Hora (R$) *</FieldLabel>
                  <Input
                    id="field-valor-hora"
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.valorHora}
                    onChange={(e) => handleInputChange('valorHora', e.target.value)}
                    placeholder="Ex: 35.50"
                    aria-invalid={!!formErrors.valorHora}
                  />
                  {formErrors.valorHora && <FieldError>{formErrors.valorHora}</FieldError>}
                </Field>

                <Field data-invalid={!!formErrors.cargaHorariaDiaria}>
                  <FieldLabel htmlFor="field-carga-diaria">Carga Diária (h) *</FieldLabel>
                  <Input
                    id="field-carga-diaria"
                    type="number"
                    step="1"
                    min="1"
                    max="12"
                    value={formData.cargaHorariaDiaria}
                    onChange={(e) => handleInputChange('cargaHorariaDiaria', e.target.value)}
                    placeholder="8"
                    aria-invalid={!!formErrors.cargaHorariaDiaria}
                  />
                  {formErrors.cargaHorariaDiaria && (
                    <FieldError>{formErrors.cargaHorariaDiaria}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!formErrors.cargaHorariaSemanal}>
                  <FieldLabel htmlFor="field-carga-semanal">Carga Semanal (h) *</FieldLabel>
                  <Input
                    id="field-carga-semanal"
                    type="number"
                    step="1"
                    min="1"
                    max="60"
                    value={formData.cargaHorariaSemanal}
                    onChange={(e) => handleInputChange('cargaHorariaSemanal', e.target.value)}
                    placeholder="44"
                    aria-invalid={!!formErrors.cargaHorariaSemanal}
                  />
                  {formErrors.cargaHorariaSemanal && (
                    <FieldError>{formErrors.cargaHorariaSemanal}</FieldError>
                  )}
                </Field>
              </div>
            </FieldGroup>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                    Salvando via API...
                  </>
                ) : editingEmployee ? (
                  <>
                    <Pencil data-icon="inline-start" />
                    Atualizar Funcionário
                  </>
                ) : (
                  <>
                    <UserPlus data-icon="inline-start" />
                    Cadastrar Funcionário
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="size-5" />
              Remover Funcionário
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              Você tem certeza de que deseja remover o funcionário{' '}
              <strong className="text-foreground">{employeeToDelete?.nome}</strong> (
              {employeeToDelete?.email})?
              <br />
              <br />
              Esta ação enviará uma chamada de exclusão diretamente para a API e não poderá ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 mt-4">
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
            >
              {isDeleting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Removendo...
                </>
              ) : (
                <>
                  <Trash2 data-icon="inline-start" />
                  Sim, remover funcionário
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Cadastro;
