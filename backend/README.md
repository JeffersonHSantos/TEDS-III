# Backend — API MegaPonto

API REST de gestão de colaboradores, ponto e folha de pagamento. O backend foi desenvolvido com Node.js, Express, SQLite e JWT.

## Requisitos

- Node.js 18 ou superior
- npm

## Instalação

Na raiz do repositório:

```bash
cd backend
npm install
```

## Executando a API

### Banco vazio

Para iniciar a API sem dados de demonstração:

```bash
npm start
```

O servidor ficará disponível em `http://localhost:3000`. O arquivo `usuarios.db` será criado automaticamente quando necessário.

O primeiro cadastro em um banco vazio pode ser feito sem token e cria o administrador inicial:

```http
POST /auth/registrar
```

### Banco com dados de demonstração

Para recriar o banco local com dados de demonstração:

```bash
npm run seed
npm start
```

> Atenção: o comando `npm run seed` apaga os dados das tabelas e recria a base de demonstração.

Credenciais criadas pelo seed:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@empresa.com` | `Admin@123` |
| Colaborador | `ana.silva@empresa.com` | `Emp@123` |
| Colaborador | `bruno.lima@empresa.com` | `Emp@123` |
| Outros colaboradores | `carlos.souza@empresa.com`, `diana.alves@empresa.com`, `eduardo.santos@empresa.com`, `fernanda.melo@empresa.com` | `Emp@123` |

O seed cria sete usuários, quatro registros de ponto para Ana Silva, duas regras financeiras ativas e uma folha de pagamento de demonstração para o período de `2026-08-01` a `2026-08-10`.

### Desenvolvimento

Para reiniciar o servidor automaticamente ao alterar arquivos:

```bash
npm run dev
```

## Variáveis de ambiente

| Variável | Padrão | Finalidade |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP da API |
| `JWT_SECRET` | `segredo-de-desenvolvimento` | Segredo usado para assinar os tokens JWT |
| `DB_PATH` | `backend/usuarios.db` | Caminho do arquivo SQLite |

Exemplo:

```bash
JWT_SECRET=troque-este-segredo PORT=4000 npm start
```

Em produção, defina um `JWT_SECRET` forte e não use as credenciais do seed.

## Endpoints

Todas as rotas protegidas usam:

```http
Authorization: Bearer <token>
```

### Autenticação e usuários

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/auth/registrar` | Bootstrap sem token; depois `ADMIN` | Cadastra um colaborador |
| `POST` | `/auth/login` | Público | Retorna um token JWT |
| `GET` | `/usuarios` | `ADMIN` | Lista colaboradores |
| `GET` | `/usuarios/:id` | `ADMIN` ou próprio usuário | Consulta um colaborador |
| `PUT` | `/usuarios/:id` | `ADMIN` | Substitui o cadastro |
| `PATCH` | `/usuarios/:id` | `ADMIN` ou próprio usuário | Atualiza campos permitidos |
| `DELETE` | `/usuarios/:id` | `ADMIN` | Remove um colaborador |

### Remuneração e ponto

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `GET` | `/usuarios/:id/remuneracao` | `ADMIN` ou próprio usuário | Consulta remuneração |
| `PATCH` | `/usuarios/:id/remuneracao` | `ADMIN` | Atualiza remuneração |
| `POST` | `/ponto/marcar` | Autenticado | Marca entrada, almoço, retorno ou saída |
| `GET` | `/ponto/hoje` | Autenticado | Consulta o ponto do dia |
| `GET` | `/ponto/historico` | Autenticado | Consulta o próprio histórico |
| `GET` | `/ponto/resumo-horas` | Autenticado | Calcula horas normais e extras |
| `GET` | `/usuarios/:id/ponto/historico` | `ADMIN` | Consulta histórico de qualquer colaborador |
| `GET` | `/usuarios/:id/ponto/resumo-horas` | `ADMIN` | Consulta resumo de qualquer colaborador |

### Regras financeiras e folha

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/regras-financeiras` | `ADMIN` | Cria desconto ou adicional |
| `GET` | `/regras-financeiras` | Autenticado | Lista regras; colaboradores veem apenas ativas |
| `PATCH` | `/regras-financeiras/:id` | `ADMIN` | Atualiza uma regra |
| `DELETE` | `/regras-financeiras/:id` | `ADMIN` | Remove uma regra não utilizada |
| `GET` | `/usuarios/:id/folha/pre-calculo` | `ADMIN` | Simula uma folha |
| `POST` | `/usuarios/:id/folha/gerar` | `ADMIN` | Persiste uma folha |
| `GET` | `/usuarios/:id/folhas` | `ADMIN` ou próprio usuário | Lista folhas |
| `GET` | `/usuarios/:id/folhas/:folhaId` | `ADMIN` ou próprio usuário | Detalha uma folha |
| `GET` | `/usuarios/:id/dsr` | `ADMIN` ou próprio usuário | Calcula DSR sobre horas extras |
| `POST` | `/usuarios/:id/ferias/calcular` | `ADMIN` | Calcula férias e adicional de um terço |
| `POST` | `/usuarios/:id/bonus` | `ADMIN` | Cadastra bônus fixo ou percentual |
| `GET` | `/usuarios/:id/bonus` | `ADMIN` ou próprio usuário | Lista bônus |

## Exemplos com curl

Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","senha":"Admin@123"}'
```

Listagem de usuários:

```bash
curl http://localhost:3000/usuarios \
  -H "Authorization: Bearer <token>"
```

Marcação de ponto:

```bash
curl -X POST http://localhost:3000/ponto/marcar \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tipo":"ENTRADA"}'
```

Pré-cálculo de folha:

```bash
curl "http://localhost:3000/usuarios/3/folha/pre-calculo?dataInicio=2026-08-01&dataFim=2026-08-10" \
  -H "Authorization: Bearer <token>"
```

## Testes

Os testes usam Vitest, Supertest e SQLite em memória. Portanto, a suíte não altera o arquivo `usuarios.db` local.

```bash
npm test
```

A suíte possui 17 arquivos de integração e cobre autenticação, autorização, usuários, remuneração, ponto, regras financeiras, folha, DSR, férias e bônus.

## Estrutura

```text
backend/
├── server.js
├── scripts/seed.js
├── usuarios.db
├── src/
│   ├── app.js
│   ├── db.js
│   ├── controllers/
│   ├── errors/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── validation/
└── tests/integration/
```

O código segue uma separação entre rotas, controllers, models e services. O banco é criado automaticamente por `src/db.js` e possui tabelas para usuários, registros de ponto, regras financeiras, folhas, itens de folha e bônus.

## Recomeçar a base local

Para apagar a base local e criar novamente os dados de demonstração:

```bash
rm usuarios.db
npm run seed
```
