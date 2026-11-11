/**
 * screens/obligations.js
 * Lista de obrigações ordenada por urgência + cadastro.
 */

App.register('obligations', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  function getObs() {
    return Storage.get('obligations', []);
  }

  function render() {
    const obligations = Finance.sortByUrgency(getObs());
    const totalDaily  = Finance.totalDailyGoal(obligations);

    screen.innerHTML = `
      <div class="screen-header">
        <button class="btn-icon" id="btn-back" aria-label="Voltar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2>Obrigações</h2>
        <button class="btn-icon" id="btn-add" aria-label="Adicionar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div class="screen-body">

        ${obligations.length > 0 ? `
        <!-- Resumo -->
        <div class="ob-summary card card-sm row-between">
          <span class="text-sm text-muted">Meta diária total</span>
          <span class="mono" style="font-size:1rem; font-weight:600;">${Finance.fmt(totalDaily)}</span>
        </div>

        <!-- Lista -->
        <div class="ob-list stack stack-sm mt-sm" id="ob-list">
          ${obligations.map(ob => renderObCard(ob)).join('')}
        </div>
        ` : `
        <div class="home-empty">
          <div class="home-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28" stroke-width="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
          </div>
          <h3>Nenhuma obrigação</h3>
          <p class="text-secondary text-sm">Adicione gastos fixos, parcelamentos ou qualquer custo recorrente.</p>
          <button class="btn btn-primary mt-sm" id="btn-add-empty">Adicionar</button>
        </div>
        `}

      </div>

      <nav class="bottom-nav">
        <button class="nav-item" data-nav="home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Início</span>
        </button>
        <button class="nav-item active" data-nav="obligations">
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

    // Eventos
    screen.querySelector('#btn-back').addEventListener('click', () => App.navigate('home'));
    screen.querySelector('#btn-add').addEventListener('click', () => showForm());
    screen.querySelector('#btn-add-empty')?.addEventListener('click', () => showForm());

    screen.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => App.navigate(btn.dataset.nav));
    });

    // Ações nos cards
    screen.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => confirmDelete(btn.dataset.delete));
    });
    screen.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ob = getObs().find(o => o.id === btn.dataset.edit);
        if (ob) showForm(ob);
      });
    });
  }

  function renderObCard(ob) {
    const days = Finance.daysUntilDue(ob);
    const daily = Finance.dailyCost(ob);
    const isUrgent = days !== null && days <= 3;
    const isSoon   = days !== null && days > 3 && days <= 7;

    let dueBadge = '';
    if (days !== null) {
      if (days < 0)      dueBadge = `<span class="badge badge-danger">Vencido</span>`;
      else if (days === 0) dueBadge = `<span class="badge badge-danger">Hoje</span>`;
      else if (days === 1) dueBadge = `<span class="badge badge-danger">Amanhã</span>`;
      else if (days <= 7)  dueBadge = `<span class="badge badge-warning">Em ${days} dias</span>`;
    }

    return `
      <div class="ob-card card card-sm ${isUrgent ? 'card-urgent' : isSoon ? 'card-soon' : ''}">
        <div class="row-between">
          <div class="stack stack-xs" style="flex:1; min-width:0;">
            <div class="row" style="gap:8px; flex-wrap:wrap;">
              <span style="font-weight:500; font-size:0.9375rem;">${ob.name}</span>
              ${dueBadge}
            </div>
            <span class="text-xs text-muted">${Finance.fmt(ob.amount)} ${Finance.periodLabel(ob.period, ob.customDays)}</span>
          </div>
          <div style="text-align:right; flex-shrink:0; margin-left:12px;">
            <span class="mono text-sm" style="font-weight:600;">${Finance.fmt(daily)}<span class="text-muted" style="font-size:0.7rem;">/dia</span></span>
          </div>
        </div>
        <div class="ob-card-actions">
          <button class="btn btn-ghost btn-sm" data-edit="${ob.id}">Editar</button>
          <button class="btn btn-ghost btn-sm text-danger" data-delete="${ob.id}">Apagar</button>
        </div>
      </div>
    `;
  }

  /* ── Formulário de cadastro/edição ───────────────────────── */
  function showForm(existing = null) {
    const isEdit = !!existing;
    const overlay = document.createElement('div');
    overlay.className = 'form-overlay';

    overlay.innerHTML = `
      <div class="form-sheet screen-enter">
        <div class="row-between" style="margin-bottom:20px;">
          <h2>${isEdit ? 'Editar' : 'Nova obrigação'}</h2>
          <button class="btn-icon" id="btn-close-form" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20" stroke-width="1.75">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="stack stack-sm">
          <div class="field">
            <label for="f-name">Nome</label>
            <input id="f-name" class="input" type="text" placeholder="Ex: Aluguel da moto" maxlength="50"
              value="${existing?.name || ''}">
          </div>

          <div class="field">
            <label for="f-amount">Valor (R$)</label>
            <input id="f-amount" class="input" type="number" inputmode="decimal" placeholder="0,00" min="0" step="0.01"
              value="${existing?.amount || ''}">
          </div>

          <div class="field">
            <label>Período</label>
            <div class="option-group" id="period-opts">
              <button class="option-btn ${(!existing || existing.period === 'weekly') ? 'active' : ''}" data-value="weekly">Semanal</button>
              <button class="option-btn ${existing?.period === 'monthly' ? 'active' : ''}" data-value="monthly">Mensal</button>
              <button class="option-btn ${existing?.period === 'daily' ? 'active' : ''}" data-value="daily">Diário</button>
              <button class="option-btn ${existing?.period === 'custom' ? 'active' : ''}" data-value="custom">Outro</button>
            </div>
          </div>

          <div class="field" id="custom-days-field" style="display:${existing?.period === 'custom' ? 'flex' : 'none'};">
            <label for="f-custom-days">A cada quantos dias?</label>
            <input id="f-custom-days" class="input" type="number" inputmode="numeric" placeholder="Ex: 15" min="1"
              value="${existing?.customDays || ''}">
          </div>

          <div class="field">
            <label for="f-due">Dia de vencimento <span class="text-muted">(opcional)</span></label>
            <input id="f-due" class="input" type="date" value="${existing?.dueDate || ''}">
            <span class="input-hint">Preencha para o app alertar na hora certa.</span>
          </div>

          <div id="daily-preview" class="ob-daily-preview" style="display:none;">
            <span class="text-xs text-muted">Custo diário</span>
            <span class="mono" id="preview-value" style="font-weight:600;"></span>
          </div>

          <button class="btn btn-primary mt-sm" id="btn-save-ob" disabled>
            ${isEdit ? 'Salvar alterações' : 'Adicionar'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const fName    = overlay.querySelector('#f-name');
    const fAmount  = overlay.querySelector('#f-amount');
    const fDue     = overlay.querySelector('#f-due');
    const fCustom  = overlay.querySelector('#f-custom-days');
    const periodOpts = overlay.querySelector('#period-opts');
    const customField = overlay.querySelector('#custom-days-field');
    const preview  = overlay.querySelector('#daily-preview');
    const previewVal = overlay.querySelector('#preview-value');
    const btnSave  = overlay.querySelector('#btn-save-ob');

    let selectedPeriod = existing?.period || 'weekly';

    function updatePreview() {
      const amount = parseFloat(fAmount.value) || 0;
      const customDays = parseInt(fCustom.value) || 30;
      const ob = { amount, period: selectedPeriod, customDays };
      const daily = Finance.dailyCost(ob);
      if (amount > 0) {
        preview.style.display = 'flex';
        previewVal.textContent = Finance.fmt(daily) + '/dia';
      } else {
        preview.style.display = 'none';
      }
      btnSave.disabled = !(fName.value.trim().length > 0 && amount > 0);
    }

    periodOpts.addEventListener('click', e => {
      const btn = e.target.closest('.option-btn');
      if (!btn) return;
      periodOpts.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPeriod = btn.dataset.value;
      customField.style.display = selectedPeriod === 'custom' ? 'flex' : 'none';
      updatePreview();
    });

    fName.addEventListener('input', updatePreview);
    fAmount.addEventListener('input', updatePreview);
    fCustom.addEventListener('input', updatePreview);
    updatePreview();

    overlay.querySelector('#btn-close-form').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    btnSave.addEventListener('click', () => {
      const obligations = getObs();
      const ob = {
        id:         existing?.id || Date.now().toString(),
        name:       fName.value.trim(),
        amount:     parseFloat(fAmount.value),
        period:     selectedPeriod,
        customDays: parseInt(fCustom.value) || null,
        dueDate:    fDue.value || null,
        createdAt:  existing?.createdAt || new Date().toISOString(),
        active:     true
      };

      if (isEdit) {
        const idx = obligations.findIndex(o => o.id === existing.id);
        if (idx >= 0) obligations[idx] = ob;
      } else {
        obligations.push(ob);
      }

      Storage.set('obligations', obligations);
      overlay.remove();
      render();
    });

    requestAnimationFrame(() => fName.focus());
  }

  /* ── Confirmação de exclusão ─────────────────────────────── */
  function confirmDelete(id) {
    const ob = getObs().find(o => o.id === id);
    if (!ob) return;

    const overlay = document.createElement('div');
    overlay.className = 'form-overlay';
    overlay.innerHTML = `
      <div class="form-sheet screen-enter stack stack-sm">
        <h2>Apagar obrigação?</h2>
        <p class="text-secondary text-sm">"${ob.name}" vai ser removida. Essa ação não pode ser desfeita.</p>
        <p class="text-xs text-muted">Você pode desabilitar essa confirmação nas configurações.</p>
        <button class="btn btn-danger" id="btn-confirm-del">Apagar</button>
        <button class="btn btn-ghost" id="btn-cancel-del">Cancelar</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#btn-cancel-del').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#btn-confirm-del').addEventListener('click', () => {
      const list = getObs().filter(o => o.id !== id);
      Storage.set('obligations', list);
      overlay.remove();
      render();
    });
  }

  render();
  return screen;
});
