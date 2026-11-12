/**
 * screens/add-income.js
 * Registra uma entrada de dinheiro no dia.
 * Campos: valor, origem (BEE, Ifood, particular, outro), observação.
 */

App.register('add-income', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const obligations = Storage.get('obligations', []);
  const cards       = Storage.get('credit_cards', []);
  const incomes     = Storage.get('incomes', []);
  const dailyGoal   = Finance.totalDailyGoalAll(obligations, cards);

  // Soma do que já foi registrado hoje
  const today = new Date().toISOString().split('T')[0];
  const todayTotal = incomes
    .filter(i => (i.date || '').startsWith(today))
    .reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  // Origens predefinidas — usuário pode digitar outra
  const ORIGINS = ['BEE', 'iFood', 'Particular', 'Outro'];

  // Verifica se é primeira vez (para mostrar dica)
  const firstTime = !Storage.get('seen_add_income_tip');

  screen.innerHTML = `
    <div class="screen-header">
      <button class="btn-icon" id="btn-back" aria-label="Voltar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <h2>Registrar entrada</h2>
    </div>

    <div class="screen-body no-nav stack stack-md">

      <!-- Mini dashboard: o que falta hoje -->
      ${dailyGoal > 0 ? `
      <div class="income-dashboard card">
        <div class="row-between">
          <div class="stack stack-xs">
            <span class="text-xs text-muted">Meta do dia</span>
            <span class="mono" style="font-size:1.3rem; font-weight:600;">${Finance.fmt(dailyGoal)}</span>
          </div>
          <div class="stack stack-xs" style="text-align:right;">
            <span class="text-xs text-muted">Já registrado hoje</span>
            <span class="mono" style="font-size:1.1rem; font-weight:600; color:var(--positive-text);">${Finance.fmt(todayTotal)}</span>
          </div>
        </div>
        <div class="income-progress-bar">
          <div class="income-progress-fill" id="progress-fill"
            style="width:${Math.min((todayTotal / dailyGoal) * 100, 100)}%"></div>
        </div>
        <div class="row-between" style="margin-top:4px;">
          <span class="text-xs" id="progress-label" style="color:${todayTotal >= dailyGoal ? 'var(--positive-text)' : 'var(--danger-text)'};">
            ${todayTotal >= dailyGoal
              ? `✓ Meta atingida — sobra ${Finance.fmt(todayTotal - dailyGoal)}`
              : `Falta ${Finance.fmt(dailyGoal - todayTotal)} para bater a meta`}
          </span>
        </div>
      </div>
      ` : ''}

      <!-- Valor -->
      <div class="field">
        <label for="income-amount">Valor recebido (R$)</label>
        <input id="income-amount" class="input" type="number" inputmode="decimal"
          placeholder="0,00" min="0" step="0.01">
        ${firstTime ? `<span class="input-hint">Digite o valor que você recebeu agora. O app vai comparar com sua meta do dia.</span>` : ''}
      </div>

      <!-- Origem -->
      <div class="field">
        <label>Origem</label>
        <div class="option-group" id="origin-opts">
          ${ORIGINS.map((o, i) => `
            <button class="option-btn ${i === 0 ? 'active' : ''}" data-value="${o}">${o}</button>
          `).join('')}
        </div>
        <div id="custom-origin-field" style="display:none; margin-top:8px;">
          <input id="custom-origin" class="input" type="text" placeholder="Digite a origem" maxlength="40">
        </div>
        ${firstTime ? `<span class="input-hint">De onde veio esse dinheiro? Aparece no histórico para você lembrar depois.</span>` : ''}
      </div>

      <!-- Observação -->
      <div class="field">
        <label for="income-note">Observação <span class="text-muted">(opcional)</span></label>
        <input id="income-note" class="input" type="text"
          placeholder="Ex: corrida longa, gorjeta inclusa" maxlength="80">
        ${firstTime ? `<span class="input-hint">Detalhe extra que você queira lembrar sobre essa entrada.</span>` : ''}
      </div>

      <!-- Preview após digitar valor -->
      <div id="income-preview" style="display:none;" class="card card-sm stack stack-xs">
        <div class="row-between">
          <span class="text-sm text-muted">Com essa entrada</span>
          <span class="mono text-sm" id="preview-new-total">—</span>
        </div>
        <div class="row-between">
          <span class="text-sm" style="font-weight:500;" id="preview-label2">—</span>
          <span class="mono text-sm" style="font-weight:600;" id="preview-diff">—</span>
        </div>
      </div>

      <button class="btn btn-primary" id="btn-save" disabled>Salvar entrada</button>
      <button class="btn btn-ghost" id="btn-cancel">Cancelar</button>

    </div>
  `;

  const fAmount  = screen.querySelector('#income-amount');
  const fNote    = screen.querySelector('#income-note');
  const originOpts = screen.querySelector('#origin-opts');
  const customField = screen.querySelector('#custom-origin-field');
  const customInput = screen.querySelector('#custom-origin');
  const preview  = screen.querySelector('#income-preview');
  const btnSave  = screen.querySelector('#btn-save');

  let selectedOrigin = ORIGINS[0];

  // Seleção de origem
  originOpts.addEventListener('click', e => {
    const btn = e.target.closest('.option-btn');
    if (!btn) return;
    originOpts.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedOrigin = btn.dataset.value;
    customField.style.display = selectedOrigin === 'Outro' ? 'block' : 'none';
    if (selectedOrigin === 'Outro') requestAnimationFrame(() => customInput.focus());
  });

  // Atualiza preview ao digitar valor
  fAmount.addEventListener('input', () => {
    const val = parseFloat(fAmount.value) || 0;
    btnSave.disabled = val <= 0;

    if (val > 0 && dailyGoal > 0) {
      preview.style.display = 'block';
      const newTotal = todayTotal + val;
      const diff = newTotal - dailyGoal;
      screen.querySelector('#preview-new-total').textContent = Finance.fmt(newTotal) + ' no total';
      screen.querySelector('#preview-label2').textContent    = diff >= 0 ? 'Sobra' : 'Falta';
      screen.querySelector('#preview-diff').textContent      = Finance.fmt(Math.abs(diff));
      screen.querySelector('#preview-diff').style.color      = diff >= 0 ? 'var(--positive-text)' : 'var(--danger-text)';
    } else {
      preview.style.display = 'none';
    }
  });

  fAmount.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !btnSave.disabled) btnSave.click();
  });

  screen.querySelector('#btn-back').addEventListener('click', () => App.navigate('home'));
  screen.querySelector('#btn-cancel').addEventListener('click', () => App.navigate('home'));

  btnSave.addEventListener('click', () => {
    const origin = selectedOrigin === 'Outro'
      ? (customInput.value.trim() || 'Outro')
      : selectedOrigin;

    const list = Storage.get('incomes', []);
    list.push({
      id:     Date.now().toString(),
      amount: parseFloat(fAmount.value),
      origin,
      note:   fNote.value.trim(),
      date:   new Date().toISOString()
    });
    Storage.set('incomes', list);

    // Marca que já viu as dicas
    Storage.set('seen_add_income_tip', true);

    App.navigate('home');
  });

  // Foca o campo de valor
  requestAnimationFrame(() => fAmount.focus());

  return screen;
});
