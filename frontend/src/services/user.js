import api from './api';

export async function getUsers() {
  const response = await api.get('/usuarios');
  return response.data;
}

export async function getUserById(id) {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
}

export async function createUser(data) {
  const payload = {
    nome: data.nome?.trim(),
    email: data.email?.trim(),
    senha: data.senha,
    cpf: String(data.cpf || '').replace(/\D/g, ''),
    role: data.role || 'EMPLOYEE',
    cargo: data.cargo?.trim(),
    departamento: data.departamento?.trim(),
    dataAdmissao: data.dataAdmissao,
    valorHora: Number(data.valorHora),
    cargaHorariaDiaria: Number(data.cargaHorariaDiaria),
    cargaHorariaSemanal: Number(data.cargaHorariaSemanal),
  };
  const response = await api.post('/auth/registrar', payload);
  return response.data;
}

export async function updateUser(id, data) {
  const payload = {
    nome: data.nome?.trim(),
    email: data.email?.trim(),
    cpf: String(data.cpf || '').replace(/\D/g, ''),
    role: data.role,
    cargo: data.cargo?.trim(),
    departamento: data.departamento?.trim(),
    dataAdmissao: data.dataAdmissao,
    valorHora: Number(data.valorHora),
    cargaHorariaDiaria: Number(data.cargaHorariaDiaria),
    cargaHorariaSemanal: Number(data.cargaHorariaSemanal),
  };

  // Envia senha apenas se tiver sido preenchida
  if (data.senha && data.senha.trim() !== '') {
    payload.senha = data.senha;
  }

  const response = await api.patch(`/usuarios/${id}`, payload);
  return response.data;
}

export async function deleteUser(id) {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
}
