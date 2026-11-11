/**
 * screens/cards.js
 * Módulo de cartões de crédito.
 * Cada cartão tem: nome, bandeira, dia de fechamento, dia de vencimento, limite (opcional).
 * Lógica: corte = fechamento + 1 dia (margem de segurança).
 */

App.register('cards', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  function getCards() { return Storage.get('credit_cards', []); }

  // Bandeiras disponíveis
  const BRANDS = ['Visa', 'Mastercard', 'Elo', 'Hipercard', 'American Express', 'Outro'];

  // Dado um cartão, calcula dias até o próximo fechamento (corte real = closingDay + 1)
  function daysUntilCutoff(card) {
    const today = new Date();
    const cutDay = (card.closingDay % 28) + 1; // corte = fechamento + 1 (margem de segurança)
    let cutDate = new Date(today.getFullYear(), today.getMonth(), cutDay);
    if (cutDate <= today) cutDate.setMonth(cutDate.getMonth() + 1);
    return Math.ceil((cutDate - today) / (1000 * 60 * 60 * 24));
  }

  // Dias até o próximo vencimento
  function daysUntilDue(card) {
    const today = new Date();
    let dueDate = new Date(today.getFullYear(), today.getMonth(), card.dueDay);
    if (dueDate <= today) dueDate.setMonth(dueDate.getMonth() + 1);
    return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  }

  // Custo diário da fatura atual (valor da fatura ÷ dias do ciclo)
  function dailyCostCard(card) {
    const invoice = parseFloat(card.currentInvoice) || 0;
    if (!invoice) return 0;
    return invoice / 30; // aproximação — ciclo mensal
  }

  function render() {
    const cards = getCards();

    screen.innerHTML = `
      <div class="screen-header">
        <button class="btn-icon" id="btn-back" aria-label="Voltar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2>Cartões</h2>
        <button class="btn-icon" id="btn-add" aria-label="Adicionar cartão">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div class="screen-body">
        ${cards.length > 0 ? `
          <div class="stack stack-sm" id="cards-list">
            ${cards.map(c => renderCard(c)).join('')}
          </div>
        ` : `
          <div class="home-empty">
            <div class="home-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="28" height="28" stroke-width="1.5">
                <rect x="1" y="4" width="22" height="16" rx="2"/>
                <path d="M1 10h22"/>
              </svg>
            </div>
            <h3>Nenhum cartão</h3>
            <p class="text-secondary text-sm">Adicione seus cartões para controlar faturas e vencimentos.</p>
            <button class="btn btn-primary mt-sm" id="btn-add-empty">Adicionar cartão</button>
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
        <button class="nav-item" data-nav="obligations">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <path d="M9 12h6M9 16h4"/>
          </svg>
          <span>Obrigações</span>
        </button>
        <button class="nav-item active" data-nav="cards">
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

    screen.querySelector('#btn-back').addEventListener('click', () => App.navigate('home'));
    screen.querySelector('#btn-add').addEventListener('click', () => showForm());
    screen.querySelector('#btn-add-empty')?.addEventListener('click', () => showForm());

    screen.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => App.navigate(b.dataset.nav)));
    screen.querySelectorAll('[data-edit]').forEach(b => {
      b.addEventListener('click', () => {
        const c = getCards().find(c => c.id === b.dataset.edit);
        if (c) showForm(c);
      });
    });
    screen.querySelectorAll('[data-delete]').forEach(b => {
      b.addEventListener('click', () => confirmDelete(b.dataset.delete));
    });
    screen.querySelectorAll('[data-invoice]').forEach(b => {
      b.addEventListener('click', () => {
        const c = getCards().find(c => c.id === b.dataset.invoice);
        if (c) showInvoiceForm(c);
      });
    });
  }

  function renderCard(card) {
    const cutDays = daysUntilCutoff(card);
    const dueDays = daysUntilDue(card);
    const invoice = parseFloat(card.currentInvoice) || 0;
    const isUrgent = dueDays <= 3;

    return `
      <div class="card card-sm cc-card ${isUrgent ? 'card-urgent' : ''}">
        <div class="row-between" style="margin-bottom:12px;">
          <div class="stack stack-xs">
            <span style="font-weight:600; font-size:0.9375rem;">${card.name}</span>
            <span class="text-xs text-muted">${card.brand}</span>
          </div>
          ${invoice > 0 ? `<span class="mono" style="font-weight:700; font-size:1rem;">${Finance.fmt(invoice)}</span>` : `<span class="text-xs text-muted">Sem fatura</span>`}
        </div>

        <div class="cc-dates">
          <div class="cc-date-item">
            <span class="text-xs text-muted">Fecha dia</span>
            <span class="text-sm" style="font-weight:500;">${card.closingDay}</span>
            <span class="text-xs text-muted">corte no dia ${(card.closingDay % 28) + 1}</span>
          </div>
          <div class="cc-date-sep"></div>
          <div class="cc-date-item">
            <span class="text-xs text-muted">Vence dia</span>
            <span class="text-sm" style="font-weight:500;">${card.dueDay}</span>
            <span class="text-xs ${dueDays <= 3 ? 'text-danger' : dueDays <= 7 ? '' : 'text-muted'}" style="${dueDays <= 7 ? 'color:var(--warning-text)' : ''}">
              ${dueDays === 0 ? 'Hoje' : dueDays === 1 ? 'Amanhã' : `em ${dueDays} dias`}
            </span>
          </div>
          <div class="cc-date-sep"></div>
          <div class="cc-date-item">
            <span class="text-xs text-muted">Fecha em</span>
            <span class="text-sm" style="font-weight:500;">${cutDays}d</span>
            <span class="text-xs text-muted">próx. corte</span>
          </div>
        </div>

        <div class="ob-card-actions">
          <button class="btn btn-ghost btn-sm" data-invoice="${card.id}">Atualizar fatura</button>
          <button class="btn btn-ghost btn-sm" data-edit="${card.id}">Editar</button>
          <button class="btn btn-ghost btn-sm text-danger" data-delete="${card.id}">Apagar</button>
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
          <h2>${isEdit ? 'Editar cartão' : 'Novo cartão'}</h2>
          <button class="btn-icon" id="btn-close" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20" stroke-width="1.75">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="stack stack-sm">
          <div class="field">
            <label for="cc-name">Nome do cartão</label>
            <input id="cc-name" class="input" type="text" placeholder="Ex: Nubank, Inter, C6" maxlength="30"
              value="${existing?.name || ''}">
          </div>

          <div class="field">
            <label>Bandeira</label>
            <div class="option-group" id="brand-opts" style="flex-wrap:wrap;">
              ${BRANDS.map(b => `
                <button class="option-btn ${(existing?.brand || 'Visa') === b ? 'active' : ''}" data-value="${b}"
                  style="min-width:calc(33% - 6px); flex:none;">${b}</button>
              `).join('')}
            </div>
          </div>

          <div class="row" style="gap:12px;">
            <div class="field" style="flex:1;">
              <label for="cc-closing">Dia de fechamento</label>
              <input id="cc-closing" class="input" type="number" inputmode="numeric"
                placeholder="Ex: 15" min="1" max="28" value="${existing?.closingDay || ''}">
              <span class="input-hint" id="cutoff-hint"></span>
            </div>
            <div class="field" style="flex:1;">
              <label for="cc-due">Dia de vencimento</label>
              <input id="cc-due" class="input" type="number" inputmode="numeric"
                placeholder="Ex: 25" min="1" max="31" value="${existing?.dueDay || ''}">
            </div>
          </div>

          <div class="field">
            <label for="cc-limit">Limite (R$) <span class="text-muted">(opcional)</span></label>
            <input id="cc-limit" class="input" type="number" inputmode="decimal" placeholder="0,00" min="0"
              value="${existing?.limit || ''}">
          </div>

          <button class="btn btn-primary mt-sm" id="btn-save-cc" disabled>
            ${isEdit ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const fName    = overlay.querySelector('#cc-name');
    const fClosing = overlay.querySelector('#cc-closing');
    const fDue     = overlay.querySelector('#cc-due');
    const fLimit   = overlay.querySelector('#cc-limit');
    const brandOpts = overlay.querySelector('#brand-opts');
    const cutoffHint = overlay.querySelector('#cutoff-hint');
    const btnSave  = overlay.querySelector('#btn-save-cc');
    let selectedBrand = existing?.brand || 'Visa';

    function updateHint() {
      const closing = parseInt(fClosing.value);
      if (closing >= 1 && closing <= 28) {
        const cutDay = (closing % 28) + 1;
        cutoffHint.textContent = `Corte real: dia ${cutDay} (margem de segurança)`;
      } else {
        cutoffHint.textContent = '';
      }
      validate();
    }

    function validate() {
      const closing = parseInt(fClosing.value);
      const due = parseInt(fDue.value);
      btnSave.disabled = !(
        fName.value.trim().length > 0 &&
        closing >= 1 && closing <= 28 &&
        due >= 1 && due <= 31
      );
    }

    brandOpts.addEventListener('click', e => {
      const btn = e.target.closest('.option-btn');
      if (!btn) return;
      brandOpts.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedBrand = btn.dataset.value;
    });

    fName.addEventListener('input', validate);
    fClosing.addEventListener('input', updateHint);
    fDue.addEventListener('input', validate);
    updateHint();

    overlay.querySelector('#btn-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    btnSave.addEventListener('click', () => {
      const cards = getCards();
      const card = {
        id:           existing?.id || Date.now().toString(),
        name:         fName.value.trim(),
        brand:        selectedBrand,
        closingDay:   parseInt(fClosing.value),
        dueDay:       parseInt(fDue.value),
        limit:        parseFloat(fLimit.value) || null,
        currentInvoice: existing?.currentInvoice || 0,
        createdAt:    existing?.createdAt || new Date().toISOString()
      };

      if (isEdit) {
        const idx = cards.findIndex(c => c.id === existing.id);
        if (idx >= 0) cards[idx] = card;
      } else {
        cards.push(card);
      }

      Storage.set('credit_cards', cards);
      overlay.remove();
      render();
    });

    requestAnimationFrame(() => fName.focus());
  }

  /* ── Atualizar valor da fatura ───────────────────────────── */
  function showInvoiceForm(card) {
    const overlay = document.createElement('div');
    overlay.className = 'form-overlay';
    overlay.innerHTML = `
      <div class="form-sheet screen-enter stack stack-sm">
        <div class="row-between" style="margin-bottom:4px;">
          <h2>Fatura — ${card.name}</h2>
          <button class="btn-icon" id="btn-close-inv" aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20" stroke-width="1.75">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <p class="text-secondary text-sm">Informe o valor total da fatura atual.</p>
        <div class="field">
          <label for="inv-amount">Valor da fatura (R$)</label>
          <input id="inv-amount" class="input" type="number" inputmode="decimal"
            placeholder="0,00" min="0" step="0.01"
            value="${card.currentInvoice || ''}">
        </div>
        <div class="ob-daily-preview" style="display:flex;">
          <span class="text-xs text-muted">Custo diário aprox.</span>
          <span class="mono" id="inv-daily" style="font-weight:600;">—</span>
        </div>
        <button class="btn btn-primary" id="btn-save-inv">Salvar</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const fAmount  = overlay.querySelector('#inv-amount');
    const invDaily = overlay.querySelector('#inv-daily');

    function updateDaily() {
      const val = parseFloat(fAmount.value) || 0;
      invDaily.textContent = val > 0 ? Finance.fmt(val / 30) + '/dia' : '—';
    }
    fAmount.addEventListener('input', updateDaily);
    updateDaily();

    overlay.querySelector('#btn-close-inv').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#btn-save-inv').addEventListener('click', () => {
      const cards = getCards();
      const idx = cards.findIndex(c => c.id === card.id);
      if (idx >= 0) {
        cards[idx].currentInvoice = parseFloat(fAmount.value) || 0;
        Storage.set('credit_cards', cards);
      }
      overlay.remove();
      render();
    });

    requestAnimationFrame(() => fAmount.focus());
  }

  /* ── Confirmação de exclusão ─────────────────────────────── */
  function confirmDelete(id) {
    const card = getCards().find(c => c.id === id);
    if (!card) return;
    const overlay = document.createElement('div');
    overlay.className = 'form-overlay';
    overlay.innerHTML = `
      <div class="form-sheet screen-enter stack stack-sm">
        <h2>Apagar cartão?</h2>
        <p class="text-secondary text-sm">"${card.name}" será removido permanentemente.</p>
        <p class="text-xs text-muted">Você pode desabilitar essa confirmação nas configurações.</p>
        <button class="btn btn-danger" id="btn-confirm">Apagar</button>
        <button class="btn btn-ghost" id="btn-cancel">Cancelar</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#btn-cancel').addEventListener('click', () => overlay.remove());
    overlay.querySelector('#btn-confirm').addEventListener('click', () => {
      Storage.set('credit_cards', getCards().filter(c => c.id !== id));
      overlay.remove();
      render();
    });
  }

  render();
  return screen;
});
