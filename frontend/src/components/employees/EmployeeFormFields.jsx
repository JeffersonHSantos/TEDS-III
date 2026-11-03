import { Input } from '@/components/ui/input';
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
import { formatCpf } from '@/lib/format';

export default function EmployeeFormFields({
  formData,
  formErrors,
  onChange,
  isEditing = false,
}) {
  function handleInputChange(field, value) {
    onChange(field, field === 'cpf' ? formatCpf(value) : value);
  }

  return (
    <FieldGroup className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field data-invalid={!!formErrors.nome}>
          <FieldLabel htmlFor="field-nome">Nome completo *</FieldLabel>
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
          <FieldLabel htmlFor="field-email">E-mail corporativo *</FieldLabel>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field data-invalid={!!formErrors.cpf}>
          <FieldLabel htmlFor="field-cpf">CPF (11 dígitos) *</FieldLabel>
          <Input
            id="field-cpf"
            value={formatCpf(formData.cpf)}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
            aria-invalid={!!formErrors.cpf}
          />
          {formErrors.cpf && <FieldError>{formErrors.cpf}</FieldError>}
        </Field>

        <Field data-invalid={!!formErrors.senha}>
          <FieldLabel htmlFor="field-senha">
            {isEditing ? 'Nova senha (opcional)' : 'Senha de acesso *'}
          </FieldLabel>
          <Input
            id="field-senha"
            type="password"
            value={formData.senha}
            onChange={(e) => handleInputChange('senha', e.target.value)}
            placeholder={isEditing ? 'Deixe vazio para manter a atual' : 'Mínimo 3 caracteres'}
            aria-invalid={!!formErrors.senha}
          />
          {formErrors.senha && <FieldError>{formErrors.senha}</FieldError>}
          {isEditing && !formErrors.senha && (
            <FieldDescription>Preencha apenas se quiser redefinir a senha.</FieldDescription>
          )}
        </Field>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="field-role">Papel de acesso *</FieldLabel>
          <Select value={formData.role} onValueChange={(val) => handleInputChange('role', val)}>
            <SelectTrigger id="field-role" className="w-full">
              <SelectValue placeholder="Selecione o papel..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="EMPLOYEE">Funcionário (EMPLOYEE)</SelectItem>
                <SelectItem value="ADMIN">Administrador (ADMIN)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>ADMIN acessa cadastro, folha e regras financeiras.</FieldDescription>
        </Field>

        <Field data-invalid={!!formErrors.departamento}>
          <FieldLabel htmlFor="field-departamento">Departamento *</FieldLabel>
          <Input
            id="field-departamento"
            value={formData.departamento}
            onChange={(e) => handleInputChange('departamento', e.target.value)}
            placeholder="Ex: TI, RH, Financeiro"
            aria-invalid={!!formErrors.departamento}
          />
          {formErrors.departamento && <FieldError>{formErrors.departamento}</FieldError>}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field data-invalid={!!formErrors.cargo}>
          <FieldLabel htmlFor="field-cargo">Cargo *</FieldLabel>
          <Input
            id="field-cargo"
            value={formData.cargo}
            onChange={(e) => handleInputChange('cargo', e.target.value)}
            placeholder="Ex: Analista Financeiro"
            aria-invalid={!!formErrors.cargo}
          />
          {formErrors.cargo && <FieldError>{formErrors.cargo}</FieldError>}
        </Field>

        <Field data-invalid={!!formErrors.dataAdmissao}>
          <FieldLabel htmlFor="field-data-admissao">Data de admissão *</FieldLabel>
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

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field data-invalid={!!formErrors.valorHora}>
          <FieldLabel htmlFor="field-valor-hora">Valor hora (R$) *</FieldLabel>
          <Input
            id="field-valor-hora"
            type="number"
            step="0.5"
            min="1"
            value={formData.valorHora}
            onChange={(e) => handleInputChange('valorHora', e.target.value)}
            placeholder="35.50"
            aria-invalid={!!formErrors.valorHora}
          />
          {formErrors.valorHora && <FieldError>{formErrors.valorHora}</FieldError>}
        </Field>

        <Field data-invalid={!!formErrors.cargaHorariaDiaria}>
          <FieldLabel htmlFor="field-carga-diaria">Carga diária (h) *</FieldLabel>
          <Input
            id="field-carga-diaria"
            type="number"
            step="1"
            min="1"
            max="12"
            value={formData.cargaHorariaDiaria}
            onChange={(e) => handleInputChange('cargaHorariaDiaria', e.target.value)}
            aria-invalid={!!formErrors.cargaHorariaDiaria}
          />
          {formErrors.cargaHorariaDiaria && <FieldError>{formErrors.cargaHorariaDiaria}</FieldError>}
        </Field>

        <Field data-invalid={!!formErrors.cargaHorariaSemanal}>
          <FieldLabel htmlFor="field-carga-semanal">Carga semanal (h) *</FieldLabel>
          <Input
            id="field-carga-semanal"
            type="number"
            step="1"
            min="1"
            max="60"
            value={formData.cargaHorariaSemanal}
            onChange={(e) => handleInputChange('cargaHorariaSemanal', e.target.value)}
            aria-invalid={!!formErrors.cargaHorariaSemanal}
          />
          {formErrors.cargaHorariaSemanal && <FieldError>{formErrors.cargaHorariaSemanal}</FieldError>}
        </Field>
      </div>
    </FieldGroup>
  );
}
