# ♻️ TrashFlow

> Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC).  
> O **TrashFlow** é uma plataforma voltada para a gestão sustentável de resíduos e conexão entre usuários e técnicos responsáveis por serviços de coleta, descarte e reciclagem.

---

## 🚀 Tecnologias Utilizadas

- **Node.js** + **Express** — Backend e API REST
- **MySQL** — Banco de dados relacional
- **Nodemailer** — Envio de e-mails via Gmail (formulário de contato)
- **Multer** — Upload de arquivos (imagens e documentos)
- **Express-session** — Gerenciamento de sessões de usuário
- **Frontend** — HTML, CSS e JavaScript puro *(ou React, caso tenha integração futura)*

---

## ⚙️ Pré-requisitos

Antes de iniciar, verifique se você tem instalado:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- [Git](https://git-scm.com/)
- Um editor de código (recomendado: [VS Code](https://code.visualstudio.com/))

---

## 📦 Instalação e Configuração

### 1️⃣ Clone o repositório
```bash
git clone https://github.com/seuusuario/trashflow.git
cd trashflow

instale as dependências
npm install

e crie um banco de dados mysql CREATE DATABASE trashflow;
e cole as tabelas do arquivo mysql

Para rodar o ambiente de desenvolvimento execute npm run dev
