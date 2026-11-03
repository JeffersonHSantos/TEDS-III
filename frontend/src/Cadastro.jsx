import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import AppShell from '@/components/layout/AppShell';
import EmployeeFormFields from '@/components/employees/EmployeeFormFields';
import { INITIAL_FORM_DATA, validateEmployeeForm } from '@/components/employees/constants';
import { createUser } from '@/services/user';
import { apiMessage } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Cadastro() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = validateEmployeeForm(formData, { requirePassword: true });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Verifique os campos destacados.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createUser(formData);
      toast.success(`${formData.nome} cadastrado com sucesso.`);
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
    } catch (err) {
      toast.error(apiMessage(err, 'Falha ao cadastrar colaborador.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastro de funcionário</h1>
          <p className="text-sm text-muted-foreground">
            Inclui um colaborador novo na base. A gestão da lista fica em Usuários.
          </p>
        </div>
        <Button variant="outline" render={<Link to="/usuarios" />}>
          <Users data-icon="inline-start" />
          Ver lista de usuários
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            Novo colaborador
          </CardTitle>
          <CardDescription>Todos os campos obrigatórios são enviados para POST /auth/registrar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <EmployeeFormFields
              formData={formData}
              formErrors={formErrors}
              onChange={handleChange}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(INITIAL_FORM_DATA);
                  setFormErrors({});
                }}
                disabled={isSubmitting}
              >
                Limpar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <UserPlus data-icon="inline-start" />
                )}
                Cadastrar funcionário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
