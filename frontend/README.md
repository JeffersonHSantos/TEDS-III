# Frontend — MegaPonto

Interface web do sistema MegaPonto, construída com React, Vite, React Router, Tailwind CSS e componentes reutilizáveis.

## Requisitos

- Node.js 18 ou superior
- npm
- API do backend em execução na porta `3000`

## Instalação

Na raiz do repositório:

```bash
cd frontend
npm install
```

## Desenvolvimento

Inicie a API em um terminal:

```bash
cd backend
npm run seed
npm start
```

Em outro terminal, inicie o frontend:

```bash
cd frontend
npm run dev
```

O Vite informará a URL local, normalmente `http://localhost:5173`.

O cliente HTTP está configurado em `src/services/api.js` para usar `http://localhost:3000`. Se a API estiver em outra porta ou domínio, altere `baseURL` antes de gerar o build.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento com HMR |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run preview` | Serve localmente o build de produção |
| `npm run lint` | Executa o ESLint |

## Funcionalidades

- Login e logout com token JWT armazenado no navegador
- Proteção de rotas por autenticação e perfil
- Dashboard inicial com resumo do sistema
- Cadastro e edição de colaboradores para administradores
- Consulta de usuários
- Marcação de entrada, saída para almoço, retorno e saída
- Consulta de relatórios de ponto e horas
- Pré-cálculo e geração de folhas
- Consulta de folhas e detalhes
- Configuração de regras financeiras
- Consulta de remuneração, férias e bônus
- Layout responsivo para desktop e dispositivos móveis

## Rotas da aplicação

| Rota | Acesso | Tela |
| --- | --- | --- |
| `/login` | Público | Login |
| `/` | Autenticado | Início |
| `/cadastro` | Administrador | Cadastro de colaborador |
| `/usuarios` | Administrador | Lista e edição de usuários |
| `/folha` | Autenticado | Folha e pré-cálculo |
| `/relatorios` | Autenticado | Relatórios |
| `/funcionario` | Autenticado | Destaque do funcionário |
| `/configs` | Autenticado | Perfil e configurações |

## Acesso de demonstração

Com o seed do backend executado:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Administrador | `admin@empresa.com` | `Admin@123` |
| Colaborador | `ana.silva@empresa.com` | `Emp@123` |

## Build e validação

Para validar a aplicação antes da entrega:

```bash
npm run lint
npm run build
```

O build gera os arquivos estáticos em `frontend/dist/`. A API não é empacotada pelo Vite e deve ser publicada/executada separadamente.

## Estrutura

```text
frontend/
├── src/
│   ├── components/       # componentes de layout, UI, funcionários e ponto
│   ├── context/          # contexto de autenticação
│   ├── lib/              # autenticação e formatadores
│   ├── services/         # clientes dos endpoints da API
│   ├── App.jsx           # rotas da aplicação
│   └── main.jsx          # entrada do React
├── index.html
├── jsconfig.json         # alias de imports @/*
├── vite.config.js
└── package.json
```
