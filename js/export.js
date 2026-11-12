/**
 * export.js
 * Exporta todos os dados do app para um arquivo .xlsx.
 * Usa SheetJS (carregado via CDN no index.html).
 * Gera 3 abas: Obrigações, Cartões, Histórico de entradas.
 */

const Export = (() => {

  function run() {
    const obligations = Storage.get('obligations', []);
    const cards       = Storage.get('credit_cards', []);
    const incomes     = Storage.get('incomes', []);
    const identity    = Storage.get('identity', {});

    const wb = XLSX.utils.book_new();

    // ── Aba 1: Obrigações ───────────────────────────────────
    const obRows = obligations.map(ob => ({
      'Nome':          ob.name,
      'Valor (R$)':    parseFloat(ob.amount) || 0,
      'Período':       periodLabel(ob.period, ob.customDays),
      'Custo diário (R$)': +Finance.dailyCost(ob).toFixed(2),
      'Vencimento':    ob.dueDate || '—',
      'Criado em':     formatDate(ob.createdAt)
    }));

    if (obRows.length === 0) {
      obRows.push({ 'Nome': 'Nenhuma obrigação cadastrada' });
    }

    // Linha de total
    const totalDaily = +Finance.totalDailyGoal(obligations).toFixed(2);
    obRows.push({});
    obRows.push({ 'Nome': 'TOTAL DIÁRIO', 'Custo diário (R$)': totalDaily });

    const wsOb = XLSX.utils.json_to_sheet(obRows);
    setColWidths(wsOb, [30, 14, 16, 18, 14, 16]);
    XLSX.utils.book_append_sheet(wb, wsOb, 'Obrigações');

    // ── Aba 2: Cartões ──────────────────────────────────────
    const cardRows = cards.map(c => ({
      'Nome':              c.name,
      'Bandeira':          c.brand,
      'Fecha dia':         c.closingDay,
      'Corte real (dia)':  (c.closingDay % 28) + 1,
      'Vence dia':         c.dueDay,
      'Fatura atual (R$)': parseFloat(c.currentInvoice) || 0,
      'Limite (R$)':       c.limit ? parseFloat(c.limit) : '—'
    }));

    if (cardRows.length === 0) {
      cardRows.push({ 'Nome': 'Nenhum cartão cadastrado' });
    }

    const wsCards = XLSX.utils.json_to_sheet(cardRows);
    setColWidths(wsCards, [20, 16, 12, 16, 12, 18, 14]);
    XLSX.utils.book_append_sheet(wb, wsCards, 'Cartões');

    // ── Aba 3: Histórico de entradas ────────────────────────
    const incomeRows = incomes.map(i => ({
      'Data':        formatDate(i.date),
      'Valor (R$)':  parseFloat(i.amount) || 0,
      'Observação':  i.note || ''
    }));

    if (incomeRows.length === 0) {
      incomeRows.push({ 'Data': 'Nenhuma entrada registrada' });
    }

    // Soma total
    const totalIncome = incomes.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
    incomeRows.push({});
    incomeRows.push({ 'Data': 'TOTAL', 'Valor (R$)': +totalIncome.toFixed(2) });

    const wsIncome = XLSX.utils.json_to_sheet(incomeRows);
    setColWidths(wsIncome, [16, 14, 30]);
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Entradas');

    // ── Nome do arquivo ─────────────────────────────────────
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const name    = (identity.name || 'jornada').toLowerCase().replace(/\s+/g, '-');
    const filename = `${name}-financeiro-${dateStr}.xlsx`;

    // ── Baixa o arquivo ─────────────────────────────────────
    XLSX.writeFile(wb, filename);

    return filename;
  }

  // Larguras de coluna (em caracteres)
  function setColWidths(ws, widths) {
    ws['!cols'] = widths.map(w => ({ wch: w }));
  }

  function periodLabel(period, customDays) {
    const map = {
      daily:   'Diário',
      weekly:  'Semanal',
      monthly: 'Mensal',
      custom:  `A cada ${customDays || '?'} dias`
    };
    return map[period] || period;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('pt-BR');
    } catch {
      return iso;
    }
  }

  return { run };

})();
