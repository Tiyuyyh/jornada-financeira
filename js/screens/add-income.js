/**
 * screens/add-income.js
 * Registra uma entrada de dinheiro no dia.
 */

App.register('add-income', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const obligations = Storage.get('obligations', []);
  const cards       = Storage.get('credit_cards', []);
  const dailyGoal   = Finance.totalDailyGoalAll(obligations, cards);

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

      ${dailyGoal > 0 ? `
      <div class="card card-sm row-between" style="background:var(--bg-inset);">
        <span class="text-sm text-muted">Meta do dia</span>
        <span class="mono" style="font-weight:600;">${Finance.fmt(dailyGoal)}</span>
      </div>
      ` : ''}

      <div class="field">
        <label for="income-amount">Valor recebido (R$)</label>
        <input id="income-amount" class="input" type="number" inputmode="decimal"
          placeholder="0,00" min="0" step="0.01" autofocus>
      </div>

      <div class="field">
        <label for="income-note">Observação <span class="text-muted">(opcional)</span></label>
        <input id="income-note" class="input" type="text"
          placeholder="Ex: pagamento da quarta" maxlength="80">
      </div>

      <div id="income-preview" style="display:none;" class="card card-sm stack stack-xs">
        <div class="row-between">
          <span class="text-sm text-muted">Meta do dia</span>
          <span class="mono text-sm">${Finance.fmt(dailyGoal)}</span>
        </div>
        <div class="row-between">
          <span class="text-sm text-muted">Entrada</span>
          <span class="mono text-sm" id="preview-amount">—</span>
        </div>
        <div class="divider" style="margin:6px 0;"></div>
        <div class="row-between">
          <span class="text-sm" style="font-weight:500;" id="preview-label">—</span>
          <span class="mono text-sm" style="font-weight:600;" id="preview-diff">—</span>
        </div>
      </div>

      <button class="btn btn-primary" id="btn-save" disabled>Salvar</button>
      <button class="btn btn-ghost" id="btn-cancel">Cancelar</button>

    </div>
  `;

  const fAmount  = screen.querySelector('#income-amount');
  const fNote    = screen.querySelector('#income-note');
  const preview  = screen.querySelector('#income-preview');
  const btnSave  = screen.querySelector('#btn-save');

  fAmount.addEventListener('input', () => {
    const val = parseFloat(fAmount.value) || 0;
    btnSave.disabled = val <= 0;

    if (val > 0 && dailyGoal > 0) {
      preview.style.display = 'block';
      const diff = val - dailyGoal;
      screen.querySelector('#preview-amount').textContent = Finance.fmt(val);
      screen.querySelector('#preview-label').textContent  = diff >= 0 ? 'Sobra' : 'Falta';
      screen.querySelector('#preview-diff').textContent   = Finance.fmt(Math.abs(diff));
      screen.querySelector('#preview-diff').style.color   = diff >= 0 ? 'var(--positive-text)' : 'var(--danger-text)';
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
    const incomes = Storage.get('incomes', []);
    incomes.push({
      id:     Date.now().toString(),
      amount: parseFloat(fAmount.value),
      note:   fNote.value.trim(),
      date:   new Date().toISOString()
    });
    Storage.set('incomes', incomes);
    App.navigate('home');
  });

  return screen;
});
