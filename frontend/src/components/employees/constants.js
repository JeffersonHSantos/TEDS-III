export const INITIAL_FORM_DATA = {
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

export function employeeToForm(emp) {
  return {
    nome: emp.nome || '',
    email: emp.email || '',
    senha: '',
    cpf: emp.cpf || '',
    role: emp.role || 'EMPLOYEE',
    cargo: emp.cargo || '',
    departamento: emp.departamento || '',
    dataAdmissao: emp.dataAdmissao ? String(emp.dataAdmissao).split('T')[0] : '',
    valorHora: emp.valorHora !== undefined && emp.valorHora !== null ? String(emp.valorHora) : '',
    cargaHorariaDiaria:
      emp.cargaHorariaDiaria !== undefined && emp.cargaHorariaDiaria !== null
        ? String(emp.cargaHorariaDiaria)
        : '8',
    cargaHorariaSemanal:
      emp.cargaHorariaSemanal !== undefined && emp.cargaHorariaSemanal !== null
        ? String(emp.cargaHorariaSemanal)
        : '44',
  };
}

export function validateEmployeeForm(formData, { requirePassword = true } = {}) {
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

  if (requirePassword && (!formData.senha || formData.senha.trim().length < 3)) {
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
  if (Number.isNaN(valorHoraNum) || valorHoraNum <= 0) {
    errors.valorHora = 'Informe um valor-hora numérico maior que zero.';
  }

  const diariaNum = Number(formData.cargaHorariaDiaria);
  if (Number.isNaN(diariaNum) || diariaNum <= 0) {
    errors.cargaHorariaDiaria = 'Carga horária diária deve ser maior que zero.';
  }

  const semanalNum = Number(formData.cargaHorariaSemanal);
  if (Number.isNaN(semanalNum) || semanalNum <= 0) {
    errors.cargaHorariaSemanal = 'Carga horária semanal deve ser maior que zero.';
  }

  return errors;
}
