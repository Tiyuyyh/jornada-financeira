/**
 * screens/export.js
 * Tela de exportação: resumo do que vai no arquivo + botão de download.
 */

App.register('export', () => {
  const screen = document.createElement('div');
  screen.className = 'screen';

  const obligations = Storage.get('obligations', []);
  const cards       = Storage.get('credit_cards', []);
  const incomes     = Storage.get('incomes', []);

  screen.innerHTML = `
    <div class="screen-header">
      <button class="btn-icon" id="btn-back" aria-label="Voltar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="22" height="22" stroke-width="1.75">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <h2>Exportar dados</h2>
    </div>

    <div class="screen-body no-nav stack stack-md">

      <p class="text-secondary text-sm">
        Gera um arquivo Excel com todos os seus dados. Nada é enviado para a internet — o download acontece direto no seu dispositivo.
      </p>

      <!-- O que vai no arquivo -->
      <div class="stack stack-sm">
        <h3 style="font-size:0.875rem; color:var(--text-muted);">O que vai no arquivo</h3>

        <div class="card card-sm stack stack-sm">
          <div class="export-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" stroke-width="1.75">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <span class="text-sm">Obrigações</span>
            <span class="text-sm text-muted" style="margin-left:auto;">${obligations.length} item${obligations.length !== 1 ? 's' : ''}</span>
          </div>

          <div class="divider" style="margin:4px 0;"></div>

          <div class="export-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" stroke-width="1.75">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <path d="M1 10h22"/>
            </svg>
            <span class="text-sm">Cartões</span>
            <span class="text-sm text-muted" style="margin-left:auto;">${cards.length} item${cards.length !== 1 ? 's' : ''}</span>
          </div>

          <div class="divider" style="margin:4px 0;"></div>

          <div class="export-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" stroke-width="1.75">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span class="text-sm">Histórico de entradas</span>
            <span class="text-sm text-muted" style="margin-left:auto;">${incomes.length} item${incomes.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <button class="btn btn-primary" id="btn-export">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="18" height="18" stroke-width="1.75">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Baixar Excel
      </button>

      <p class="text-xs text-muted" style="text-align:center;">
        O arquivo não contém sua senha nem sua chave privada.
      </p>

      <div id="export-feedback" style="display:none;"></div>

    </div>
  `;

  screen.querySelector('#btn-back').addEventListener('click', () => App.navigate('home'));

  screen.querySelector('#btn-export').addEventListener('click', () => {
    const btn      = screen.querySelector('#btn-export');
    const feedback = screen.querySelector('#export-feedback');

    try {
      btn.disabled = true;
      btn.textContent = 'Gerando…';

      const filename = Export.run();

      feedback.className = 'feedback feedback-warning';
      feedback.style.display = 'flex';
      feedback.innerHTML = `
        <span>Arquivo <strong>${filename}</strong> baixado. Verifique sua pasta de downloads.</span>
      `;
      btn.textContent = 'Baixar de novo';
      btn.disabled = false;

    } catch (err) {
      feedback.className = 'feedback feedback-danger';
      feedback.style.display = 'flex';
      feedback.textContent = 'Erro ao gerar o arquivo. Tente novamente.';
      btn.textContent = 'Baixar Excel';
      btn.disabled = false;
    }
  });

  return screen;
});
