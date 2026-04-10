<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Mestre do Desafio - Gamificação Educativa

Este repositório contém tudo o que você precisa para rodar e hospedar seu próprio sistema de desafios educativos.

## 🌐 Hospedagem Gratuita (Deploy)

### 1. Configurar Banco de Dados (Supabase)
1. Crie uma conta gratuita em [supabase.com](https://supabase.com/).
2. Crie um novo projeto.
3. No painel do projeto, vá em **SQL Editor** e cole o conteúdo do arquivo [supabase-schema.sql](./supabase-schema.sql).
4. Clique em **Run** para criar a tabela de desafios e as políticas de segurança.
5. Em **Project Settings > API**, anote a `URL` e a `anon key`.

### 2. Publicar site (Netlify)
1. Crie uma conta gratuita em [netlify.com](https://netlify.com/).
2. Conecte seu repositório do GitHub ou arraste a pasta `dist` após rodar `npm run build`.
3. Em **Site Configuration > Environment variables**, adicione:
   - `VITE_SUPABASE_URL`: (Sua URL do Supabase)
   - `VITE_SUPABASE_ANON_KEY`: (Sua chave anon do Supabase)
   - `VITE_GEMINI_API_KEY`: (Sua chave da API Gemini)
4. O arquivo `netlify.toml` já está configurado para gerenciar o build e as rotas automaticamente.

## 🛠️ Desenvolvimento Local

**Pré-requisitos:** Node.js

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env` na raiz (veja o `.env.example`) e adicione suas chaves.
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---
Desenvolvido para **Mestre do Desafio**.
