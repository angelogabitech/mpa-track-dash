# Obras compartilhadas no MPaFlow

## Regra de negócio implementada

O acesso deixou de ser limitado ao usuário que criou cada registro. Agora a unidade de isolamento é a **obra**.

- uma obra pode ter dois ou mais usuários;
- todos os membros possuem acesso completo aos dados da obra;
- os membros podem criar, visualizar, editar e excluir pavimentos, caminhões e corpos de prova;
- usuários que não pertencem à obra continuam sem acesso, mesmo que tentem consultar a API diretamente;
- o campo `user_id` dos registros permanece como identificação de quem os criou, mas não limita mais a colaboração.

## Estrutura do banco

A migração `supabase/migrations/20260907152000_collaborative_obras.sql` adiciona:

- `obras`: cadastro e identificação da obra;
- `obra_members`: relação muitos-para-muitos entre obras e usuários;
- `pavimentos.obra_id`: vínculo de cada concretagem com sua obra;
- políticas RLS baseadas na participação do usuário na obra;
- funções protegidas para validar acesso através de pavimentos e caminhões;
- RPC `add_obra_member_by_email`, usada pela interface para compartilhar a obra sem expor credenciais administrativas.

Os dados existentes são preservados. Para cada usuário atual é criada uma obra principal, os pavimentos existentes são associados a ela e o próprio usuário é registrado como membro.

As migrações de criação das tabelas do domínio também passaram a fazer parte da sequência oficial:

1. `20260422020521_63c0a281-8cfa-4949-8c6c-574c8f41472a.sql`
2. `20260907150000_init_mpaflow_tables.sql`
3. `20260907151000_tighten_domain_rls.sql`
4. `20260907152000_collaborative_obras.sql`

## Fluxo para os dois usuários

1. Os dois usuários criam suas contas e confirmam o e-mail, conforme a configuração do Supabase.
2. O primeiro usuário entra no MPaFlow e seleciona sua obra no topo da tela.
3. Clica no botão de usuário com sinal de adição ao lado da obra.
4. Informa o e-mail exato do segundo usuário.
5. O segundo usuário entra novamente no sistema e seleciona a obra compartilhada.

A partir desse momento os dois trabalham sobre os mesmos dados e têm as mesmas permissões operacionais.

## Alterações na interface

- seletor de obra ativa no cabeçalho;
- ação **Compartilhar obra** por e-mail;
- memorização da última obra escolhida para cada usuário;
- carregamento de pavimentos, caminhões e corpos de prova limitado à obra ativa;
- mensagens claras quando o e-mail ainda não possui cadastro.

## Segurança

O frontend não decide quem pode acessar os dados. Essa decisão é feita pelas políticas RLS do PostgreSQL.

- a chave pública do navegador não consegue ignorar RLS;
- o convite só pode ser executado por um membro atual da obra;
- a função de convite procura o usuário no Auth sem devolver a lista de contas;
- funções `SECURITY DEFINER` usam `search_path` fixo e têm execução restrita a usuários autenticados;
- o papel `anon` não recebe acesso às tabelas da aplicação.

## Aplicação da migração

Com o projeto Supabase correto vinculado e a sessão da CLI autenticada:

```bash
npx supabase db push --dry-run
npx supabase db push
```

Para instalação manual, execute os arquivos da pasta `supabase/migrations_portable` em ordem no SQL Editor. O arquivo `004_collaborative_obras.sql` contém esta implementação.

Faça backup do banco antes da aplicação em produção. A migração altera as políticas de acesso e torna `pavimentos.obra_id` obrigatório após preencher os registros antigos.

## Validação recomendada

1. Entrar como usuário A e cadastrar um pavimento, caminhão e corpo de prova.
2. Compartilhar a obra com o usuário B.
3. Entrar como B e confirmar a leitura dos três registros.
4. Como B, criar e editar registros; confirmar a atualização ao entrar como A.
5. Como B, excluir um registro de teste; confirmar a exclusão para A.
6. Entrar como um usuário C não convidado e confirmar que a obra e seus dados não aparecem.
7. Confirmar que trocar a obra no seletor troca todo o conjunto de dados exibido no dashboard.

## Arquivos de aplicação alterados

- `src/context/DataContext.tsx`
- `src/components/AppLayout.tsx`
- `src/components/ObraSwitcher.tsx`
- `src/integrations/supabase/types.ts`
- `supabase/migrations/20260907150000_init_mpaflow_tables.sql`
- `supabase/migrations/20260907151000_tighten_domain_rls.sql`
- `supabase/migrations/20260907152000_collaborative_obras.sql`
- `supabase/migrations_portable/004_collaborative_obras.sql`
