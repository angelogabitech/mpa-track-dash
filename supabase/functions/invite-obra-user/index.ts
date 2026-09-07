import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Metodo nao permitido.' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const publicKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serverKey = Deno.env.get('SUPABASE_SECRET_KEY')
      ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const appUrl = Deno.env.get('APP_URL')?.replace(/\/$/, '');
    const authorization = request.headers.get('Authorization');

    if (!supabaseUrl || !publicKey || !serverKey || !appUrl) {
      console.error('Missing required Edge Function environment configuration.');
      return json({ error: 'Servico de convites nao configurado.' }, 503);
    }

    if (!authorization?.startsWith('Bearer ')) {
      return json({ error: 'Autenticacao obrigatoria.' }, 401);
    }

    const body = await request.json() as {
      obraId?: unknown;
      email?: unknown;
      displayName?: unknown;
    };
    const obraId = body.obraId;
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';

    if (!isUuid(obraId) || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return json({ error: 'Dados do convite invalidos.' }, 400);
    }

    if (displayName.length > 120) {
      return json({ error: 'Nome de exibicao muito longo.' }, 400);
    }

    const callerClient = createClient(supabaseUrl, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const adminClient = createClient(supabaseUrl, serverKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const accessToken = authorization.slice('Bearer '.length).trim();
    if (!accessToken) return json({ error: 'Autenticacao obrigatoria.' }, 401);

    const { data: authData, error: authError } = await callerClient.auth.getUser(accessToken);
    const caller = authData.user;
    if (authError || !caller) {
      return json({ error: 'Sessao invalida ou expirada.' }, 401);
    }

    const [{ data: adminRow, error: adminError }, { data: memberRow, error: memberError }] = await Promise.all([
      adminClient.from('platform_admins').select('user_id').eq('user_id', caller.id).maybeSingle(),
      adminClient.from('obra_members').select('obra_id').eq('obra_id', obraId).eq('user_id', caller.id).maybeSingle(),
    ]);

    if (adminError || memberError) {
      console.error('Authorization lookup failed.', { adminError, memberError });
      return json({ error: 'Nao foi possivel validar a permissao.' }, 500);
    }

    if (!adminRow || !memberRow) {
      return json({ error: 'Somente o administrador da plataforma pode adicionar usuarios.' }, 403);
    }

    const { data: existingUserId, error: lookupError } = await adminClient.rpc(
      'get_user_id_by_email_for_admin',
      { p_email: email },
    );
    if (lookupError) {
      console.error('User lookup failed.', lookupError);
      return json({ error: 'Nao foi possivel verificar o usuario.' }, 500);
    }

    if (existingUserId) {
      const { error: membershipError } = await adminClient
        .from('obra_members')
        .upsert({ obra_id: obraId, user_id: existingUserId, added_by: caller.id });

      if (membershipError) {
        console.error('Existing user membership failed.', membershipError);
        return json({ error: 'Nao foi possivel vincular o usuario a obra.' }, 500);
      }

      return json({ status: 'linked', invitationSent: false });
    }

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { display_name: displayName || email.split('@')[0] },
      redirectTo: `${appUrl}/definir-senha`,
    });

    if (inviteError || !inviteData.user) {
      console.error('Auth invite failed.', inviteError);
      return json({ error: 'Nao foi possivel enviar o convite. Verifique o e-mail e tente novamente.' }, 400);
    }

    const { error: membershipError } = await adminClient.from('obra_members').insert({
      obra_id: obraId,
      user_id: inviteData.user.id,
      added_by: caller.id,
    });

    if (membershipError) {
      console.error('Invited user membership failed.', membershipError);
      const { error: rollbackError } = await adminClient.auth.admin.deleteUser(inviteData.user.id);
      if (rollbackError) console.error('Auth invite rollback failed.', rollbackError);
      return json({ error: 'O convite foi cancelado porque a obra nao pode ser vinculada.' }, 500);
    }

    return json({ status: 'invited', invitationSent: true }, 201);
  } catch (error) {
    console.error('Unexpected invite error.', error);
    return json({ error: 'Erro inesperado ao processar o convite.' }, 500);
  }
});
