# Painel de Localização - Admin

Painel de gerenciamento de localizações e técnicos usando Firebase Authentication e Realtime Database.

## 🔧 Funcionalidades
- Login com autenticação via Firebase
- Cadastro de técnicos com função "técnico"
- Cadastro de localizações com:
  - Cliente
  - Número da OS (único)
  - Link de localização
- Filtro de busca por Cliente ou OS
- Edição e exclusão de localizações
- Listagem por ordem de cadastro (mais recente primeiro)

## 🚀 Tecnologias
- HTML5
- CSS3
- JavaScript (ES Modules)
- Firebase Authentication
- Firebase Realtime Database

## ✅ Requisitos
- Conta no Firebase
- Configuração do projeto no Firebase (copiar o objeto `firebaseConfig`)

## 📦 Como usar
1. Clone este repositório
2. Edite os arquivos `index.html`, `admin.html` e `js/*.js` com seu `firebaseConfig`
3. Suba os arquivos em um servidor ou abra localmente

## 🔐 Segurança
- Cada técnico tem acesso apenas à sua área
- Somente o admin pode cadastrar técnicos e gerenciar localizações

## 📁 Estrutura de Pastas

localizacao-admin/
├── css/
│ └── style.css 
├── js/
│ ├── admin.js
│ └── login.js
├── index.html
├── admin.html
├── .gitignore
└── README.md
