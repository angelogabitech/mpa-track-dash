# Migrations Portáteis — MPaFlow

Esta pasta contém scripts SQL prontos para rodar em **qualquer projeto Supabase próprio** (ou PostgreSQL com extensão de Auth).

## Quando usar

Quando você quiser sair do Lovable Cloud e levar o app para sua própria infraestrutura.

## Como migrar

1. **Crie um novo projeto Supabase** em https://supabase.com
2. Vá em **SQL Editor** → **New query**
3. Execute os scripts desta pasta **em ordem**:
   - `001_init_auth.sql` — cria tabela `profiles`, RLS, trigger de auto-criação
   - `002_init_mpaflow_tables.sql` — cria `pavimentos`, `trucks` e `test_specimens`
   - `003_tighten_domain_rls.sql` — reforça RLS dos relacionamentos
4. Atualize o arquivo `.env` do projeto com as **novas credenciais**:
   ```
   VITE_SUPABASE_PROJECT_ID="<seu-novo-id>"
   VITE_SUPABASE_URL="https://<seu-novo-id>.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="<sua-nova-anon-key>"
   ```
5. Em **Authentication → Providers → Email**, desative **"Confirm email"** se quiser login imediato.
6. Crie um usuário inicial em **Authentication → Users → Add user**.

## Estrutura

- `001_init_auth.sql` — Profiles + RLS + triggers (auth básico)
- `002_init_mpaflow_tables.sql` — Tabelas de pavimentos, caminhões e corpos de prova
- `003_tighten_domain_rls.sql` — Policies mais restritivas para caminhões e corpos de prova
