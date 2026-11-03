import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Users,
  ShieldCheck,
  Building,
  DollarSign,
  Loader2,
  X,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '@/components/layout/AppShell';
import EmployeeFormFields from '@/components/employees/EmployeeFormFields';
import { employeeToForm, validateEmployeeForm } from '@/components/employees/constants';
import { getUsers, updateUser, deleteUser } from '@/services/user';
import { apiMessage, formatCpf, formatCurrency, formatDate, getInitials } from '@/lib/format';
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

export default function Usuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function carregarUsuarios() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao carregar colaboradores.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(carregarUsuarios);
  }, []);

  function handleOpenEditModal(emp) {
    setEditingEmployee(emp);
    setFormData(employeeToForm(emp));
    setFormErrors({});
  }

  async function handleSubmitForm(event) {
    event.preventDefault();
    const errors = validateEmployeeForm(formData, { requirePassword: false });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Verifique os campos destacados.');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUser(editingEmployee.id, formData);
      toast.success(`${formData.nome} atualizado.`);
      setEditingEmployee(null);
      await carregarUsuarios();
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao atualizar colaborador.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!employeeToDelete) return;
    try {
      setIsDeleting(true);
      await deleteUser(employeeToDelete.id);
      toast.success(`${employeeToDelete.nome} excluído.`);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
      await carregarUsuarios();
    } catch (err) {
      toast.error(apiMessage(err, 'Erro ao excluir.'));
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase().trim();
    const cleanDigits = term.replace(/\D/g, '');
    return users.filter((u) => {
      return (
        u.nome?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.cargo?.toLowerCase().includes(term) ||
        u.departamento?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term) ||
        (u.cpf ? u.cpf.includes(cleanDigits || term) : false)
      );
    });
  }, [users, searchTerm]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'ADMIN').length;
    const departments = new Set(users.map((u) => u.departamento).filter(Boolean)).size;
    const mediaValorHora =
      total > 0 ? users.reduce((acc, u) => acc + (Number(u.valorHora) || 0), 0) / total : 0;
    return { total, admins, departments, mediaValorHora };
  }, [users]);

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-sm text-muted-foreground">
              Consulte, atualize e remova colaboradores já cadastrados.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={carregarUsuarios} disabled={loading}>
              <RefreshCw data-icon="inline-start" className={loading ? 'animate-spin' : ''} />
              Atualizar
            </Button>
            <Button render={<Link to="/cadastro" />}>
              <UserPlus data-icon="inline-start" />
              Novo cadastro
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Colaboradores</CardTitle>
              <Users className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Administradores</CardTitle>
              <ShieldCheck className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Departamentos</CardTitle>
              <Building className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.departments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Média valor-hora</CardTitle>
              <DollarSign className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.mediaValorHora)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b border-border pb-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="relative max-w-md flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por nome, e-mail, CPF, cargo..."
                  className="h-9 pr-8 pl-9"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Exibindo <b>{filteredUsers.length}</b> de <b>{users.length}</b>
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center gap-3 p-12 text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-primary" />
                Carregando usuários...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-12 text-center text-muted-foreground">
                <Users className="size-12 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">Nenhum usuário encontrado</p>
                <Button render={<Link to="/cadastro" />}>
                  <UserPlus data-icon="inline-start" />
                  Cadastrar colaborador
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">ID</TableHead>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Cargo / Depto</TableHead>
                      <TableHead className="text-center">Papel</TableHead>
                      <TableHead>Remuneração</TableHead>
                      <TableHead>Admissão</TableHead>
                      <TableHead className="pr-6 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((emp) => {
                      const isAdmin = emp.role === 'ADMIN';
                      return (
                        <TableRow key={emp.id}>
                          <TableCell className="text-center font-mono text-xs text-muted-foreground">
                            #{emp.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {getInitials(emp.nome)}
                              </div>
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-medium">{emp.nome}</span>
                                <span className="truncate text-xs text-muted-foreground">{emp.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {formatCpf(emp.cpf)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <span className="font-medium">{emp.cargo || '-'}</span>
                              <span className="text-muted-foreground">{emp.departamento || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={isAdmin ? 'default' : 'secondary'}>
                              {isAdmin ? 'ADMIN' : 'FUNCIONÁRIO'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <span className="font-semibold">{formatCurrency(emp.valorHora)}/h</span>
                              <span className="text-muted-foreground">
                                {emp.cargaHorariaSemanal || 40}h/sem
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(emp.dataAdmissao)}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button variant="outline" size="sm" onClick={() => handleOpenEditModal(emp)}>
                                <Pencil data-icon="inline-start" />
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setEmployeeToDelete(emp);
                                  setDeleteDialogOpen(true);
                                }}
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
      </div>

      <Dialog open={Boolean(editingEmployee)} onOpenChange={(open) => !open && setEditingEmployee(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Atualizar funcionário</DialogTitle>
            <DialogDescription>
              Alterações de {editingEmployee?.nome} são enviadas para PATCH /usuarios/:id.
            </DialogDescription>
          </DialogHeader>
          {formData && (
            <form onSubmit={handleSubmitForm} className="flex flex-col gap-6">
              <EmployeeFormFields
                formData={formData}
                formErrors={formErrors}
                isEditing
                onChange={(field, value) => {
                  setFormData((prev) => ({ ...prev, [field]: value }));
                  if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: null }));
                }}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingEmployee(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
                  Salvar alterações
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              Remover {employeeToDelete?.nome}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Removendo...' : 'Sim, remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
