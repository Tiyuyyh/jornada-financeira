/**
 * screens/history.js
 * Histórico de entradas registradas, agrupadas por dia.
 */

App.register('history', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  function render() {
    const incomes = Storage.get('incomes', [])
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // mais recente primeiro

    // Agrupa por data
    const byDay = {};
    incomes.forEach(i => {
      const day = new Date(i.date).toLocaleDateString('pt-BR', {
        weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
      });
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(i);
    });

    const totalGeral = incomes.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

    screen.innerHTML = `
      <div class="screen-header">
        <button class="btn-icon" id="btn-back" aria-label="Voltar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2>Histórico</h2>
      </div>

      <div class="screen-body no-nav">

        ${incomes.length === 0 ? `
          <div class="home-empty">
            <div class="home-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28" stroke-width="1.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <h3>Nenhuma entrada</h3>
            <p class="text-secondary text-sm">Registre entradas na tela inicial para ver o histórico aqui.</p>
          </div>
        ` : `
          <div class="card card-sm row-between" style="margin-bottom:16px; background:var(--bg-inset);">
            <span class="text-sm text-muted">Total registrado</span>
            <span class="mono" style="font-weight:600; color:var(--positive-text);">${Finance.fmt(totalGeral)}</span>
          </div>

          <div class="stack stack-md">
            ${Object.entries(byDay).map(([day, items]) => {
              const dayTotal = items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
              return `
                <div class="stack stack-xs">
                  <div class="row-between" style="padding: 0 2px;">
                    <span class="text-xs text-muted" style="text-transform:capitalize;">${day}</span>
                    <span class="mono text-xs text-muted">${Finance.fmt(dayTotal)}</span>
                  </div>
                  <div class="stack stack-xs">
                    ${items.map(i => `
                      <div class="card card-sm row-between">
                        <div class="stack stack-xs" style="flex:1; min-width:0;">
                          <span class="mono text-sm" style="font-weight:600; color:var(--positive-text);">${Finance.fmt(i.amount)}</span>
                          ${i.note ? `<span class="text-xs text-muted">${i.note}</span>` : ''}
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; flex-shrink:0; margin-left:12px;">
                          <span class="text-xs text-muted">${new Date(i.date).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}</span>
                          <button class="btn-icon" data-delete="${i.id}" aria-label="Apagar entrada" style="color:var(--text-muted);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="16" height="16" stroke-width="1.75">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14H6L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}

      </div>
    `;

    screen.querySelector('#btn-back').addEventListener('click', () => App.navigate('home'));

    screen.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prefs = Storage.get('prefs', { confirmations: true });
        if (prefs.confirmations === false) {
          deleteIncome(btn.dataset.delete);
        } else {
          confirmDelete(btn.dataset.delete);
        }
      });
    });
  }

  function deleteIncome(id) {
    const incomes = Storage.get('incomes', []).filter(i => i.id !== id);
    Storage.set('incomes', incomes);
    render();
  }

  function confirmDelete(id) {
    const overlay = document.createElement('div');
    overlay.className = 'form-overlay';
    overlay.innerHTML = `
      <div class="form-sheet screen-enter stack stack-sm">
        <h2>Apagar entrada?</h2>
        <p class="text-secondary text-sm">Essa entrada será removida do histórico.</p>
        <button class="btn btn-danger" id="btn-confirm">Apagar</button>
        <button class="btn btn-ghost" id="btn-cancel">Cancelar</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#btn-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#btn-confirm').addEventListener('click', () => {
      overlay.remove();
      deleteIncome(id);
    });
  }

  render();
  return screen;
});
