/**
 * screens/settings.js
 * Configurações do app: tema, texto, confirmações, ID público, apagamento de dados.
 */

App.register('settings', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  function getPrefs() {
    return Storage.get('prefs', { theme: 'dark', textSize: 'sm', confirmations: true });
  }

  function render() {
    const prefs    = getPrefs();
    const identity = Storage.get('identity', {});

    screen.innerHTML = `
      <div class="screen-header">
        <button class="btn-icon" id="btn-back" aria-label="Voltar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2>Configurações</h2>
      </div>

      <div class="screen-body no-nav stack stack-lg">

        <!-- Aparência -->
        <section class="stack stack-sm">
          <h3 class="settings-section-title">Aparência</h3>

          <div class="card card-sm stack stack-sm">
            <div class="field">
              <label>Tema</label>
              <div class="option-group" id="theme-opts">
                <button class="option-btn ${prefs.theme === 'dark'  ? 'active' : ''}" data-value="dark">Escuro</button>
                <button class="option-btn ${prefs.theme === 'light' ? 'active' : ''}" data-value="light">Claro</button>
                <button class="option-btn ${prefs.theme === 'auto'  ? 'active' : ''}" data-value="auto">Automático</button>
              </div>
              <span class="input-hint">Automático: escuro das 19h às 6h.</span>
            </div>

            <div class="divider" style="margin:4px 0;"></div>

            <div class="field">
              <label>Tamanho do texto</label>
              <div class="option-group" id="size-opts">
                <button class="option-btn ${prefs.textSize === 'sm' ? 'active' : ''}" data-value="sm">Normal</button>
                <button class="option-btn ${prefs.textSize === 'md' ? 'active' : ''}" data-value="md">Médio</button>
                <button class="option-btn ${prefs.textSize === 'lg' ? 'active' : ''}" data-value="lg">Grande</button>
              </div>
              <p class="settings-text-preview" id="text-preview">Assim vai aparecer o texto no app.</p>
            </div>
          </div>
        </section>

        <!-- Comportamento -->
        <section class="stack stack-sm">
          <h3 class="settings-section-title">Comportamento</h3>

          <div class="card card-sm">
            <div class="row-between">
              <div class="stack stack-xs" style="flex:1; padding-right:16px;">
                <span style="font-weight:500; font-size:0.9375rem;">Confirmações ao apagar</span>
                <span class="text-xs text-muted">Pede confirmação antes de remover obrigações, cartões e entradas.</span>
              </div>
              <button
                class="toggle-btn ${prefs.confirmations !== false ? 'on' : ''}"
                id="toggle-confirmations"
                role="switch"
                aria-checked="${prefs.confirmations !== false}"
                aria-label="Confirmações ao apagar">
                <span class="toggle-thumb"></span>
              </button>
            </div>
          </div>
        </section>

        <!-- Conta -->
        <section class="stack stack-sm">
          <h3 class="settings-section-title">Conta</h3>

          <div class="card card-sm stack stack-sm">
            <div class="stack stack-xs">
              <span class="text-xs text-muted">Seu nome</span>
              <span style="font-weight:500;">${identity.name || '—'}</span>
            </div>
            <div class="divider" style="margin:4px 0;"></div>
            <div class="stack stack-xs">
              <span class="text-xs text-muted">ID público</span>
              <span class="mono" style="letter-spacing:0.06em; color:var(--accent-text);">${identity.id || '—'}</span>
              <span class="text-xs text-muted">Use este código para recuperação, junto com sua senha.</span>
            </div>
          </div>
        </section>

        <!-- Zona de perigo -->
        <section class="stack stack-sm">
          <h3 class="settings-section-title" style="color:var(--danger-text);">Dados</h3>

          <div class="card card-sm stack stack-sm" style="border-color:var(--danger);">
            <div class="stack stack-xs">
              <span style="font-weight:500; font-size:0.9375rem;">Apagar todos os dados</span>
              <span class="text-xs text-muted">Remove obrigações, cartões e histórico. Seu ID continua existindo, mas sem nada vinculado a ele.</span>
            </div>
            <button class="btn btn-danger btn-sm" id="btn-wipe">Apagar tudo</button>
          </div>
        </section>

      </div>
    `;

    // Voltar
    screen.querySelector('#btn-back').addEventListener('click', () => App.navigate('home'));

    // Tema
    const themeOpts = screen.querySelector('#theme-opts');
    themeOpts.addEventListener('click', e => {
      const btn = e.target.closest('.option-btn');
      if (!btn) return;
      themeOpts.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      prefs.theme = btn.dataset.value;
      Theme.set(prefs.theme);
      Storage.set('prefs', prefs);
    });

    // Tamanho de texto
    const sizeOpts = screen.querySelector('#size-opts');
    const preview  = screen.querySelector('#text-preview');
    const sizes    = { sm: '16px', md: '18px', lg: '20px' };
    preview.style.fontSize = sizes[prefs.textSize] || '16px';

    sizeOpts.addEventListener('click', e => {
      const btn = e.target.closest('.option-btn');
      if (!btn) return;
      sizeOpts.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      prefs.textSize = btn.dataset.value;
      preview.style.fontSize = sizes[prefs.textSize] || '16px';
      document.documentElement.setAttribute('data-text-size', prefs.textSize === 'sm' ? '' : prefs.textSize);
      Storage.set('prefs', prefs);
    });

    // Toggle confirmações
    const toggleConf = screen.querySelector('#toggle-confirmations');
    toggleConf.addEventListener('click', () => {
      prefs.confirmations = prefs.confirmations === false ? true : false;
      toggleConf.classList.toggle('on', prefs.confirmations !== false);
      toggleConf.setAttribute('aria-checked', String(prefs.confirmations !== false));
      Storage.set('prefs', prefs);
    });

    // Apagar tudo
    screen.querySelector('#btn-wipe').addEventListener('click', () => confirmWipe());
  }

  function confirmWipe() {
    const overlay = document.createElement('div');
    overlay.className = 'form-overlay';
    overlay.innerHTML = `
      <div class="form-sheet screen-enter stack stack-sm">
        <h2>Apagar todos os dados?</h2>
        <p class="text-secondary text-sm">Obrigações, cartões e histórico serão removidos permanentemente.</p>
        <p class="text-secondary text-sm">Seu ID público continua existindo — se restaurar depois, vai retornar vazio. Isso é esperado.</p>
        <div class="feedback feedback-danger" style="margin-top:4px;">
          Essa ação não pode ser desfeita.
        </div>
        <button class="btn btn-danger" id="btn-confirm-wipe">Entendi, apagar tudo</button>
        <button class="btn btn-ghost" id="btn-cancel-wipe">Cancelar</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#btn-cancel-wipe').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#btn-confirm-wipe').addEventListener('click', () => {
      Storage.wipeData();
      overlay.remove();
      // Volta para home que vai mostrar estado vazio
      App.navigate('home');
    });
  }

  render();
  return screen;
});
