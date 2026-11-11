/**
 * screens/home.js
 * Tela principal: saudação, mini relatório financeiro, acesso aos módulos.
 */

App.register('home', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const identity = Storage.get('identity', {});
  const prefs    = Storage.get('prefs', { theme: 'dark', textSize: 'sm' });

  // Aplica preferências salvas
  Theme.set(prefs.theme);
  if (prefs.textSize && prefs.textSize !== 'sm') {
    document.documentElement.setAttribute('data-text-size', prefs.textSize);
  }

  // Saudação por horário
  function greeting() {
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return 'Bom dia';
    if (h >= 12 && h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  // Dados financeiros (vindos do módulo de obrigações — etapa 4)
  const obligations = Storage.get('obligations', []);
  const incomes     = Storage.get('incomes', []);

  // Calcula meta diária total
  function calcDailyGoal() {
    return obligations.reduce((sum, ob) => sum + (ob.dailyCost || 0), 0);
  }

  // Saldo de hoje (entradas registradas hoje)
  function todayBalance() {
    const today = new Date().toDateString();
    return incomes
      .filter(i => new Date(i.date).toDateString() === today)
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }

  // Obrigação mais urgente
  function mostUrgent() {
    if (!obligations.length) return null;
    return obligations
      .filter(ob => ob.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0] || null;
  }

  // Dias até vencimento
  function daysUntil(dateStr) {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function fmt(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const dailyGoal = calcDailyGoal();
  const balance   = todayBalance();
  const urgent    = mostUrgent();
  const hasData   = obligations.length > 0;

  const balanceColor = balance >= dailyGoal
    ? 'var(--positive-text)'
    : 'var(--danger-text)';

  // ── HTML da tela ──────────────────────────────────────────

  screen.innerHTML = `
    <div class="screen-header" style="border-bottom:none; padding-bottom:8px;">
      <div style="flex:1;">
        <p class="text-xs text-muted">${greeting()},</p>
        <h2>${identity.name || 'você'}</h2>
      </div>
      <button class="btn-icon" id="btn-settings" aria-label="Configurações">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
    </div>

    <div class="screen-body">

      ${hasData ? `
      <!-- Card principal: meta diária -->
      <div class="card home-main-card">
        <p class="text-xs text-muted">Meta diária</p>
        <p class="home-daily-goal">${fmt(dailyGoal)}</p>
        <div class="divider" style="margin:14px 0;"></div>
        <div class="row-between">
          <div>
            <p class="text-xs text-muted">Entrada hoje</p>
            <p class="home-balance" style="color:${balanceColor};">${fmt(balance)}</p>
          </div>
          <div style="text-align:right;">
            <p class="text-xs text-muted">${balance >= dailyGoal ? 'Sobra' : 'Falta'}</p>
            <p class="home-balance" style="color:${balanceColor};">${fmt(Math.abs(balance - dailyGoal))}</p>
          </div>
        </div>
      </div>

      <!-- Botão de registrar entrada -->
      <button class="btn btn-primary mt-sm" id="btn-add-income">
        Registrar entrada
      </button>

      ${urgent ? `
      <!-- Obrigação urgente -->
      <div class="card card-sm mt-sm ${daysUntil(urgent.dueDate) <= 3 ? 'card-urgent' : 'card-soon'}">
        <div class="row-between">
          <div class="stack stack-xs">
            <p class="text-sm" style="font-weight:500;">${urgent.name}</p>
            <p class="text-xs text-muted">Vence ${daysUntil(urgent.dueDate) === 0 ? 'hoje' : daysUntil(urgent.dueDate) === 1 ? 'amanhã' : `em ${daysUntil(urgent.dueDate)} dias`}</p>
          </div>
          <p class="text-sm" style="font-weight:600;">${fmt(urgent.amount || 0)}</p>
        </div>
      </div>
      ` : ''}

      ` : `
      <!-- Estado vazio: sem dados ainda -->
      <div class="home-empty">
        <div class="home-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="32" height="32" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
            <path d="M12 7v4M10 9h4"/>
          </svg>
        </div>
        <h3>Tudo começa aqui</h3>
        <p class="text-secondary text-sm">Adicione suas obrigações para ver quanto precisa gerar por dia.</p>
        <button class="btn btn-primary mt-sm" id="btn-first-obligation">Adicionar obrigação</button>
      </div>
      `}

      <!-- Módulos de acesso rápido -->
      <div class="home-modules mt-md">
        <button class="module-card" data-nav="obligations">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h4"/>
          </svg>
          <span>Obrigações</span>
        </button>
        <button class="module-card" data-nav="cards">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
            <rect x="1" y="4" width="22" height="16" rx="2"/>
            <path d="M1 10h22"/>
          </svg>
          <span>Cartões</span>
        </button>
        <button class="module-card" data-nav="history">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>Histórico</span>
        </button>
        <button class="module-card" data-nav="export">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>Exportar</span>
        </button>
      </div>

    </div>

    <!-- Nav inferior -->
    <nav class="bottom-nav">
      <button class="nav-item active" data-nav="home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Início</span>
      </button>
      <button class="nav-item" data-nav="obligations">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
        <span>Obrigações</span>
      </button>
      <button class="nav-item" data-nav="cards">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <path d="M1 10h22"/>
        </svg>
        <span>Cartões</span>
      </button>
      <button class="nav-item" data-nav="settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>Config.</span>
      </button>
    </nav>
  `;

  // ── Eventos ───────────────────────────────────────────────

  // Navegação pelo menu inferior e módulos
  screen.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      if (target === 'home') return; // já está aqui
      App.navigate(target);
    });
  });

  const btnSettings = screen.querySelector('#btn-settings');
  if (btnSettings) btnSettings.addEventListener('click', () => App.navigate('settings'));

  const btnAddIncome = screen.querySelector('#btn-add-income');
  if (btnAddIncome) btnAddIncome.addEventListener('click', () => App.navigate('add-income'));

  const btnFirstOb = screen.querySelector('#btn-first-obligation');
  if (btnFirstOb) btnFirstOb.addEventListener('click', () => App.navigate('obligations'));

  return screen;
});
