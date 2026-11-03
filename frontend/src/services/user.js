import api from './api';

function toPayload(data, { includeSenha = true } = {}) {
  const payload = {
    nome: data.nome?.trim(),
    email: data.email?.trim(),
    cpf: String(data.cpf || '').replace(/\D/g, ''),
    role: data.role || 'EMPLOYEE',
    cargo: data.cargo?.trim(),
    departamento: data.departamento?.trim(),
    dataAdmissao: data.dataAdmissao,
    valorHora: Number(data.valorHora),
    cargaHorariaDiaria: Number(data.cargaHorariaDiaria),
    cargaHorariaSemanal: Number(data.cargaHorariaSemanal),
  };

  if (includeSenha && data.senha && data.senha.trim() !== '') {
    payload.senha = data.senha;
  }

  return payload;
}

export async function getUsers() {
  const response = await api.get('/usuarios');
  return response.data;
}

export async function getUserById(id) {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
}

export async function createUser(data) {
  const response = await api.post('/auth/registrar', toPayload(data, { includeSenha: true }));
  return response.data;
}

export async function updateUser(id, data) {
  const response = await api.patch(`/usuarios/${id}`, toPayload(data));
  return response.data;
}

export async function updateOwnProfile(id, data) {
  const payload = {
    nome: data.nome?.trim(),
    email: data.email?.trim(),
  };
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
