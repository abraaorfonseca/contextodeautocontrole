// ==================== CONFIGURAÇÃO SUPABASE ====================
const SUPABASE_URL = 'https://eiilxxlvnwjrhtaegzhs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Abhkgwibnc3cqAbKHH9q_w_mTUtD81O';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== PARTÍCULAS + 3D (mantém igual) ====================
// ... (todo o código das partículas, inalterado) ...

// ==================== AUTENTICAÇÃO ====================
const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginMsg = document.getElementById('loginMsg');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const logoutLink = document.getElementById('logoutLink');
const logoutBtn = document.getElementById('logoutBtn');
const loggedUserDisplay = document.getElementById('loggedUserDisplay');
const planoBadge = document.getElementById('planoBadge');
const headerTitle = document.getElementById('headerTitle');

function showMessage(text, type) {
    loginMsg.textContent = text;
    loginMsg.className = 'msg-terminal';
    if (type === 'error') loginMsg.classList.add('msg-error');
    if (type === 'success') loginMsg.classList.add('msg-success');
    setTimeout(() => {
        if (loginMsg.textContent === text) {
            loginMsg.textContent = '';
            loginMsg.className = 'msg-terminal';
        }
    }, 5000);
}

async function attemptLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!email || !password) {
        showMessage('Preencha todos os campos.', 'error');
        return;
    }

    loginBtn.textContent = '[ AUTENTICANDO... ]';
    loginBtn.disabled = true;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        loginBtn.textContent = '[ ENTRAR ]';
        loginBtn.disabled = false;
        showMessage('Credenciais inválidas. ' + error.message, 'error');
        passwordInput.value = '';
        passwordInput.focus();
        return;
    }

    showMessage('Acesso concedido. Carregando perfil...', 'success');
    await carregarDashboard(data.user);
}

async function carregarDashboard(user) {
    try {
        const { data: perfil, error: perfilError } = await supabaseClient
            .from('subscribers')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (perfilError) {
            console.warn('Perfil não encontrado (tabela subscribers pode não existir). Seguindo sem perfil.');
            loggedUserDisplay.textContent = user.email;
            planoBadge.textContent = '--';
        } else {
            loggedUserDisplay.textContent = perfil?.nome || user.email;
            planoBadge.textContent = perfil?.plano || 'gratuito';
        }

        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        headerTitle.textContent = 'SUPER_FORJA.dash';
        loginMsg.textContent = '';
        loginMsg.className = 'msg-terminal';
        updateDateInfo();
        loginBtn.textContent = '[ ENTRAR ]';
        loginBtn.disabled = false;
    } catch (err) {
        console.error('Erro inesperado:', err);
        showMessage('Erro ao carregar perfil, mas a sessão foi iniciada.', 'error');
        // Força o acesso mesmo com erro
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        headerTitle.textContent = 'SUPER_FORJA.dash';
        loginMsg.textContent = '';
        loginMsg.className = 'msg-terminal';
        updateDateInfo();
        loginBtn.textContent = '[ ENTRAR ]';
        loginBtn.disabled = false;
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    dashboardView.classList.add('hidden');
    loginView.classList.remove('hidden');
    headerTitle.textContent = 'SUPER_FORJA.sys';
    emailInput.value = '';
    passwordInput.value = '';
    loginMsg.textContent = '';
    loginMsg.className = 'msg-terminal';
    emailInput.focus();
}

async function verificarSessao() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session?.user) {
        await carregarDashboard(session.user);
    }
}
verificarSessao();

// Eventos
loginBtn.addEventListener('click', attemptLogin);
passwordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });
emailInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') passwordInput.focus(); });
logoutLink.addEventListener('click', logout);
logoutBtn.addEventListener('click', logout);

// ==================== DATA E TOGGLES (inalterado) ====================
// ...