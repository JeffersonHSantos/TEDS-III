# MegaPonto

Sistema web de gestão de colaboradores, controle de ponto e folha de pagamento. O projeto é composto por uma API REST em Node.js/Express e uma aplicação web em React/Vite.

## Visão geral

O MegaPonto centraliza rotinas comuns de Recursos Humanos:

- cadastro e gerenciamento de colaboradores;
- autenticação com JWT e perfis `ADMIN` e `EMPLOYEE`;
- marcação e consulta de ponto;
- cálculo de horas normais e extras;
- regras financeiras de descontos e adicionais;
- pré-cálculo e geração de folha;
- consulta de folhas e itens de cálculo;
- cálculo de DSR sobre horas extras;
- cálculo de férias com um terço constitucional;
- cadastro e consulta de bônus;
- relatórios e telas de acompanhamento.

## Tecnologias

### Backend

- Node.js
- Express
- SQLite com `better-sqlite3`
- JWT com `jsonwebtoken`
- Hash de senhas com `bcryptjs`
- Vitest e Supertest para testes de integração

### Frontend

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- componentes reutilizáveis e `lucide-react`
- ESLint

## Arquitetura

```text
TEDS-III/
├── backend/                 # API REST, banco SQLite e testes
│   ├── server.js
│   ├── scripts/seed.js
│   ├── src/
│   └── tests/integration/
├── frontend/                # aplicação React/Vite
│   ├── src/
│   ├── vite.config.js
│   └── package.json
└── README.md
```

O backend separa responsabilidades em rotas, controllers, models, services, middlewares e validações. O frontend consome a API por meio dos serviços em `frontend/src/services/`.

## Pré-requisitos

- Node.js 18 ou superior
- npm
- Git

Confira as versões instaladas:

```bash
node --version
npm --version
```

## Instalação completa

Clone o repositório e entre na pasta do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd TEDS-III
```

Instale as dependências de cada parte:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Não há um `package.json` na raiz: backend e frontend são aplicações independentes e devem ser instalados separadamente.

## Executando localmente

São necessários dois terminais.

### Terminal 1 — API

```bash
cd backend
npm run seed
npm start
```

A API ficará disponível em `http://localhost:3000`.

Para desenvolvimento com reinício automático:

```bash
npm run dev
```

### Terminal 2 — frontend

```bash
cd frontend
npm run dev
```

Abra a URL exibida pelo Vite, normalmente `http://localhost:5173`.

O frontend está configurado para consumir a API em `http://localhost:3000`, conforme `frontend/src/services/api.js`.

## Credenciais de demonstração

Depois de executar `npm run seed` no backend:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@empresa.com` | `Admin@123` |
| Colaborador | `ana.silva@empresa.com` | `Emp@123` |
| Colaborador | `bruno.lima@empresa.com` | `Emp@123` |
| Colaboradores restantes | `carlos.souza@empresa.com`, `diana.alves@empresa.com`, `eduardo.santos@empresa.com`, `fernanda.melo@empresa.com` | `Emp@123` |

As credenciais são exclusivamente para demonstração. Em um ambiente real, altere as senhas e o segredo JWT.

## Fluxo recomendado para demonstração

1. Execute o seed e inicie a API.
2. Inicie o frontend.
3. Entre como `admin@empresa.com`.
4. Acesse **Usuários** para consultar os colaboradores.
5. Acesse **Cadastro** para criar um novo colaborador.
6. Acesse **Configurações** para consultar ou administrar regras financeiras.
7. Acesse **Folha** para consultar a folha de Ana Silva ou executar um pré-cálculo.
8. Acesse **Relatórios** para consultar horas e registros de ponto.
9. Faça logout e entre como `ana.silva@empresa.com` para visualizar as permissões de colaborador.
10. Na tela inicial, use o cartão de ponto para registrar os eventos na ordem: entrada, saída para almoço, retorno e saída.

## Banco de dados

O backend usa SQLite. Por padrão, o banco fica em `backend/usuarios.db` e é criado automaticamente.

Para recriar a base de demonstração:

```bash
cd backend
rm usuarios.db
npm run seed
```

O seed remove os dados existentes e cria:

- 1 administrador;
- 6 colaboradores;
- registros de ponto de Ana Silva;
- 2 regras financeiras;
- 1 folha de pagamento de demonstração.

Para usar outro arquivo de banco:

```bash
DB_PATH=/caminho/para/usuarios.db npm start
```

## Variáveis de ambiente da API

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta do servidor |
| `JWT_SECRET` | `segredo-de-desenvolvimento` | Segredo para os tokens JWT |
| `DB_PATH` | `backend/usuarios.db` | Caminho do SQLite |

Exemplo:

```bash
cd backend
JWT_SECRET=um-segredo-forte PORT=4000 npm start
```

Se a API for executada fora da porta `3000`, atualize `baseURL` em `frontend/src/services/api.js` antes de iniciar o frontend ou gerar o build.

## API

As rotas principais são:

| Grupo | Rotas |
| --- | --- |
| Autenticação | `POST /auth/registrar`, `POST /auth/login` |
| Usuários | `GET/PUT/PATCH/DELETE /usuarios/:id`, `GET /usuarios` |
| Remuneração | `GET/PATCH /usuarios/:id/remuneracao` |
| Ponto | `POST /ponto/marcar`, `GET /ponto/hoje`, `GET /ponto/historico`, `GET /ponto/resumo-horas` |
| Regras | `POST/GET /regras-financeiras`, `PATCH/DELETE /regras-financeiras/:id` |
| Folha | `GET /usuarios/:id/folha/pre-calculo`, `POST /usuarios/:id/folha/gerar` |
| Consultas | `GET /usuarios/:id/folhas`, `GET /usuarios/:id/folhas/:folhaId` |
| Cálculos | `GET /usuarios/:id/dsr`, `POST /usuarios/:id/ferias/calcular` |
| Bônus | `POST/GET /usuarios/:id/bonus` |

Rotas protegidas exigem:

```http
Authorization: Bearer <token>
```

Para a documentação detalhada dos endpoints, consulte [backend/README.md](./backend/README.md).

## Testes e validação

### Testes da API

```bash
cd backend
npm test
```

A suíte contém 17 arquivos de integração e valida os principais fluxos da API com SQLite em memória.

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

O build de produção é gerado em `frontend/dist/`.

## Segurança e produção

- Não utilize `segredo-de-desenvolvimento` em produção.
- Não publique o arquivo `backend/usuarios.db` com dados reais.
- Não use as credenciais de demonstração em ambiente real.
- Configure CORS para aceitar somente os domínios oficiais.
- Use HTTPS para proteger credenciais e tokens em trânsito.
- Altere a URL da API no frontend para o endereço do ambiente publicado.
- Faça backup do SQLite antes de executar o seed, pois ele apaga os dados.

## Documentação por módulo

- [Documentação da API](./backend/README.md)
- [Documentação do frontend](./frontend/README.md)

