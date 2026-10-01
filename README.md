# DeskSmartTI - Sistema de Chamados e Suporte de TI

**DeskSmartTI** é uma plataforma moderna, profissional e responsiva para gerenciamento de chamados e suporte técnico de TI corporativo. Projetada para substituir solicitações informais (como WhatsApp ou e-mails avulsos), centralizando todos os atendimentos com métricas, notificações e controle de acesso por perfil.

---

## 🌟 Funcionalidades Principais

### 1. 🔐 Autenticação & Cadastro
- **Login com E-mail e Senha** com tokens seguros JWT.
- **Auto-cadastro de Usuários**: Coleta de nome completo, e-mail, telefone/WhatsApp, setor/departamento e loja/unidade.
- **Perfis de Acesso (RBAC)**:
  - **Usuário Solicitante**: Visualiza e gerencia apenas seus próprios chamados.
  - **Administrador TI**: Acesso total ao dashboard, estatísticas, usuários e todos os chamados da empresa.

### 2. 📝 Abertura de Chamados Inteligente
- **Preenchimento Automático**: Puxa automaticamente os dados cadastrais do perfil do usuário.
- **Geração de Código Único**: Formato rastreável como `#TCK-20261001-001`.
- **Anexo de Arquivos e Imagens**: Suporte para fotos de erros, capturas de tela e documentos.
- Categorização por Categoria (Hardware, Software, Rede, Acessos) e Níveis de Prioridade (Baixa, Média, Alta, Urgente).

### 3. 🔄 Fluxo de Atendimento e Status
- Status rastreáveis: `Aberto` ➔ `Em Atendimento` ➔ `Aguardando Usuário` ➔ `Resolvido` ➔ `Fechado`.
- Histórico completo de interações, respostas e mudanças de status.

### 4. 📊 Dashboard do Administrador
- Métricas em tempo real com estatísticas de chamados totais, abertos, resolvidos e em atendimento.
- Gráficos por **Prioridade**, **Categoria** e **Loja / Unidade**.
- Filtros por intervalo de datas, status, categoria e loja.

### 5. 🔔 Sistema de Notificações
- Notificações dentro do sistema para atualizações de status, respostas de TI e aberturas de novos chamados.

### 6. 🎨 Interface Moderna Corporativa
- Design limpo em fundo claro (clean light theme), responsivo para desktop, tablet e dispositivos móveis.
- Construído com React, Tailwind CSS e ícones intuitivos (Lucide Icons).

---

## 🚀 Como Executar com Docker (Recomendado)

O projeto está totalmente containerizado com **Docker** e **Docker Compose**, utilizando banco de dados SQLite persistente através de volumes Docker.

### Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### Passos para Instalação

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/jAlvarosf/desksmartti.git
   cd desksmartti
   ```

2. **Subir os Containers**:
   ```bash
   docker-compose up -d --build
   ```

3. **Acessar a Aplicação**:
   Abra o navegador em: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Contas Pré-cadastradas para Teste

Ao iniciar o sistema pela primeira vez, o banco de dados é populado automaticamente com:

| Perfil | E-mail | Senha | Nível |
| :--- | :--- | :--- | :--- |
| **Administrador TI** | `admin@desksmartti.com` | `admin123` | Administrador |
| **Usuário Solicitante** | `joao@empresa.com` | `user123` | Usuário Comum |

---

## 💻 Execução Local sem Docker (Desenvolvimento)

### Backend (Node.js Express + Prisma SQLite)

```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```

O servidor da API iniciará em `http://localhost:5000`.

### Frontend (React + Vite + Tailwind CSS)

```bash
cd frontend
npm install
npm run dev
```

A aplicação React estará acessível em `http://localhost:3000`.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, React Router DOM, Axios.
- **Backend**: Node.js, Express, Prisma ORM, JWT, Multer, BcryptJS.
- **Banco de Dados**: SQLite.
- **Infraestrutura**: Docker & Docker Compose.
