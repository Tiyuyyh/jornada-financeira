/**
 * screens/onboarding.js
 * Fluxo de primeiro acesso em 3 passos:
 *   1. Nome
 *   2. Senha (gera ID público)
 *   3. Acessibilidade
 */

App.register('onboarding', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  let step = 1;
  let userName = '';
  let publicId = '';

  function render() {
    screen.innerHTML = '';

    const body = document.createElement('div');
    body.className = 'screen-body no-nav stack stack-lg';

    // Indicador de progresso
    const progress = document.createElement('div');
    progress.className = 'onboarding-progress';
    progress.innerHTML = [1,2,3].map(i =>
      `<div class="progress-dot ${i === step ? 'active' : i < step ? 'done' : ''}"></div>`
    ).join('');
    body.appendChild(progress);

    if (step === 1) renderStep1(body);
    else if (step === 2) renderStep2(body);
    else if (step === 3) renderStep3(body);

    screen.appendChild(body);
  }

  /* ── Passo 1: Nome ───────────────────────────────────────── */
  function renderStep1(body) {
    const content = document.createElement('div');
    content.className = 'stack stack-md';
    content.innerHTML = `
      <div class="stack stack-xs">
        <h1>Como posso te chamar?</h1>
        <p class="text-secondary">Só o nome. Nada mais é coletado.</p>
      </div>

      <div class="field">
        <label for="input-name">Seu nome</label>
        <input
          id="input-name"
          class="input"
          type="text"
          placeholder="Ex: Rubens"
          maxlength="40"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          value="${userName}"
        >
      </div>

      <button class="btn btn-primary" id="btn-step1" disabled>Continuar</button>
    `;
    body.appendChild(content);

    const input = content.querySelector('#input-name');
    const btn   = content.querySelector('#btn-step1');

    input.addEventListener('input', () => {
      const val = input.value.trim();
      btn.disabled = val.length < 2;
    });

    // Reabilita se já tinha nome
    if (userName.length >= 2) btn.disabled = false;

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !btn.disabled) btn.click();
    });

    btn.addEventListener('click', () => {
      userName = input.value.trim();
      step = 2;
      render();
    });

    // Foca o input automaticamente
    requestAnimationFrame(() => input.focus());
  }

  /* ── Passo 2: Senha + ID público ─────────────────────────── */
  function renderStep2(body) {
    publicId = Crypto.generatePublicId();

    const content = document.createElement('div');
    content.className = 'stack stack-md';
    content.innerHTML = `
      <div class="stack stack-xs">
        <h1>Crie uma senha</h1>
        <p class="text-secondary">Ela protege o acesso aqui no dispositivo. Não é enviada a lugar nenhum.</p>
      </div>

      <div class="card card-sm stack stack-xs" style="background:var(--bg-inset);">
        <span class="text-xs text-muted">Seu ID público</span>
        <span class="mono" style="font-size:1.1rem; letter-spacing:0.08em; color:var(--accent-text);">${publicId}</span>
        <span class="text-xs text-muted">Guarde este código. Ele identifica sua conta para recuperação.</span>
      </div>

      <div class="field">
        <label for="input-pass">Senha</label>
        <div style="position:relative;">
          <input
            id="input-pass"
            class="input"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
          >
          <button class="btn-toggle-pass" id="toggle-pass" aria-label="Mostrar senha" tabindex="-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <div id="strength-bar" class="strength-bar" aria-hidden="true">
          <div class="strength-fill"></div>
        </div>
        <span id="strength-label" class="input-hint"></span>
      </div>

      <div class="field">
        <label for="input-pass2">Confirmar senha</label>
        <input
          id="input-pass2"
          class="input"
          type="password"
          placeholder="Repita a senha"
          autocomplete="new-password"
        >
        <span id="pass-match" class="input-hint"></span>
      </div>

      <div id="pass-warning" class="feedback feedback-warning" style="display:none;">
        Senha com menos de 14 caracteres tem segurança menor. Para uso pessoal é ok, mas considere uma senha mais longa.
      </div>

      <button class="btn btn-primary" id="btn-step2" disabled>Continuar</button>
      <button class="btn btn-ghost" id="btn-back2">Voltar</button>
    `;
    body.appendChild(content);

    const inputPass  = content.querySelector('#input-pass');
    const inputPass2 = content.querySelector('#input-pass2');
    const toggleBtn  = content.querySelector('#toggle-pass');
    const strengthFill  = content.querySelector('.strength-fill');
    const strengthLabel = content.querySelector('#strength-label');
    const passMatch     = content.querySelector('#pass-match');
    const passWarning   = content.querySelector('#pass-warning');
    const btn    = content.querySelector('#btn-step2');
    const btnBack = content.querySelector('#btn-back2');

    function update() {
      const pass = inputPass.value;
      const pass2 = inputPass2.value;
      const strength = Crypto.passwordStrength(pass);

      // Barra de força
      const levels = { fraca: 1, media: 2, forte: 3 };
      strengthFill.dataset.level = strength;
      strengthFill.style.width = `${(levels[strength] / 3) * 100}%`;
      const labels = { fraca: 'Senha fraca', media: 'Senha razoável', forte: 'Senha forte' };
      strengthLabel.textContent = pass.length > 0 ? labels[strength] : '';

      // Aviso de senha curta
      passWarning.style.display = (pass.length >= 8 && pass.length < 14) ? 'flex' : 'none';

      // Confirmação
      if (pass2.length > 0) {
        if (pass === pass2) {
          passMatch.textContent = 'Senhas conferem';
          passMatch.style.color = 'var(--positive-text)';
        } else {
          passMatch.textContent = 'Senhas diferentes';
          passMatch.style.color = 'var(--danger-text)';
        }
      } else {
        passMatch.textContent = '';
      }

      btn.disabled = !(pass.length >= 8 && pass === pass2);
    }

    inputPass.addEventListener('input', update);
    inputPass2.addEventListener('input', update);

    toggleBtn.addEventListener('click', () => {
      const show = inputPass.type === 'password';
      inputPass.type  = show ? 'text' : 'password';
      inputPass2.type = show ? 'text' : 'password';
      toggleBtn.setAttribute('aria-label', show ? 'Esconder senha' : 'Mostrar senha');
    });

    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Salvando…';

      try {
        const hashed = await Crypto.hashPassword(inputPass.value);
        Storage.set('identity', {
          id: publicId,
          name: userName,
          passwordHash: hashed,
          createdAt: new Date().toISOString()
        });
        step = 3;
        render();
      } catch {
        btn.disabled = false;
        btn.textContent = 'Continuar';
      }
    });

    btnBack.addEventListener('click', () => { step = 1; render(); });
    requestAnimationFrame(() => inputPass.focus());
  }

  /* ── Passo 3: Acessibilidade ─────────────────────────────── */
  function renderStep3(body) {
    // Lê preferências salvas ou usa defaults
    const prefs = Storage.get('prefs', { theme: 'dark', textSize: 'sm', confirmations: true });

    const content = document.createElement('div');
    content.className = 'stack stack-md';
    content.innerHTML = `
      <div class="stack stack-xs">
        <h1>Deixa do seu jeito</h1>
        <p class="text-secondary">Você pode mudar isso a qualquer momento nas configurações.</p>
      </div>

      <div class="stack stack-sm">
        <h3>Tema</h3>
        <div class="option-group" id="theme-options">
          <button class="option-btn ${prefs.theme === 'dark' ? 'active' : ''}" data-value="dark">Escuro</button>
          <button class="option-btn ${prefs.theme === 'light' ? 'active' : ''}" data-value="light">Claro</button>
          <button class="option-btn ${prefs.theme === 'auto' ? 'active' : ''}" data-value="auto">Automático</button>
        </div>
        <span class="input-hint">Automático usa escuro a partir das 19h e claro durante o dia.</span>
      </div>

      <div class="stack stack-sm">
        <h3>Tamanho do texto</h3>
        <div class="option-group" id="size-options">
          <button class="option-btn ${prefs.textSize === 'sm' ? 'active' : ''}" data-value="sm">Normal</button>
          <button class="option-btn ${prefs.textSize === 'md' ? 'active' : ''}" data-value="md">Médio</button>
          <button class="option-btn ${prefs.textSize === 'lg' ? 'active' : ''}" data-value="lg">Grande</button>
        </div>
        <p class="preview-text" id="text-preview" style="color:var(--text-secondary); padding:12px 0;">
          Assim vai aparecer o texto no app.
        </p>
      </div>

      <button class="btn btn-primary" id="btn-finish">Começar</button>
    `;
    body.appendChild(content);

    const themeGroup = content.querySelector('#theme-options');
    const sizeGroup  = content.querySelector('#size-options');
    const preview    = content.querySelector('#text-preview');
    const btnFinish  = content.querySelector('#btn-finish');

    // Aplica preview imediato
    function applyTextSize(size) {
      const sizes = { sm: '16px', md: '18px', lg: '20px' };
      preview.style.fontSize = sizes[size] || '16px';
    }
    applyTextSize(prefs.textSize);

    themeGroup.addEventListener('click', e => {
      const btn = e.target.closest('.option-btn');
      if (!btn) return;
      themeGroup.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      prefs.theme = btn.dataset.value;
      Theme.set(prefs.theme);
    });

    sizeGroup.addEventListener('click', e => {
      const btn = e.target.closest('.option-btn');
      if (!btn) return;
      sizeGroup.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      prefs.textSize = btn.dataset.value;
      applyTextSize(prefs.textSize);
      document.documentElement.setAttribute('data-text-size', prefs.textSize === 'sm' ? '' : prefs.textSize);
    });

    btnFinish.addEventListener('click', () => {
      Storage.set('prefs', prefs);
      App.navigate('home');
    });
  }

  render();
  return screen;
});
