/**
 * finance.js
 * Lógica financeira central do app.
 * Calcula custo diário de cada obrigação e agrega tudo.
 */

const Finance = (() => {

  /**
   * Calcula o custo diário de uma obrigação.
   * @param {object} ob — obrigação com { amount, period, startDate }
   * period: 'daily' | 'weekly' | 'monthly' | 'custom' (custom usa customDays)
   */
  function dailyCost(ob) {
    const amount = parseFloat(ob.amount) || 0;
    if (amount <= 0) return 0;

    switch (ob.period) {
      case 'daily':   return amount;
      case 'weekly':  return amount / 7;
      case 'monthly': return amount / 30;
      case 'custom':  return amount / (parseInt(ob.customDays) || 30);
      default:        return 0;
    }
  }

  /**
   * Calcula meta diária total (soma de todas as obrigações ativas).
   */
  function totalDailyGoal(obligations) {
    return obligations
      .filter(ob => ob.active !== false)
      .reduce((sum, ob) => sum + dailyCost(ob), 0);
  }

  /**
   * Meta diária total incluindo faturas de cartão.
   * Fatura do cartão ÷ 30 = custo diário do cartão.
   */
  function totalDailyGoalAll(obligations, cards) {
    const obTotal = totalDailyGoal(obligations);
    const cardTotal = (cards || []).reduce((sum, c) => {
      const invoice = parseFloat(c.currentInvoice) || 0;
      return sum + (invoice > 0 ? invoice / 30 : 0);
    }, 0);
    return obTotal + cardTotal;
  }

  /**
   * Dias até o vencimento de uma obrigação.
   * Retorna null se não tiver dueDate.
   */
  function daysUntilDue(ob) {
    if (!ob.dueDate) return null;
    const diff = new Date(ob.dueDate) - startOfDay(new Date());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Ordena obrigações por urgência:
   * 1. Com vencimento próximo (≤ 7 dias) — mais próximo primeiro
   * 2. Sem vencimento — por custo diário decrescente
   */
  function sortByUrgency(obligations) {
    return [...obligations].sort((a, b) => {
      const dA = daysUntilDue(a);
      const dB = daysUntilDue(b);

      // Ambos têm vencimento
      if (dA !== null && dB !== null) return dA - dB;
      // Só A tem vencimento
      if (dA !== null) return -1;
      // Só B tem vencimento
      if (dB !== null) return 1;
      // Nenhum tem vencimento — ordena por custo diário
      return dailyCost(b) - dailyCost(a);
    });
  }

  /** Início do dia (meia-noite) */
  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /** Soma das entradas registradas hoje */
  function todayIncome(incomes) {
    const today = startOfDay(new Date()).toISOString().split('T')[0];
    return incomes
      .filter(i => (i.date || '').startsWith(today))
      .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  }

  /** Formata valor em BRL */
  function fmt(val) {
    return (parseFloat(val) || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  /** Label do período */
  function periodLabel(period, customDays) {
    const labels = {
      daily:   'por dia',
      weekly:  'por semana',
      monthly: 'por mês',
      custom:  `a cada ${customDays || '?'} dias`
    };
    return labels[period] || '';
  }

  return { dailyCost, totalDailyGoal, totalDailyGoalAll, daysUntilDue, sortByUrgency, todayIncome, fmt, periodLabel };

})();
