/**
 * screens/home.js — placeholder
 * Substituído na etapa 3 pela tela principal real.
 */

App.register('home', () => {
  const identity = Storage.get('identity', {});
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.innerHTML = `
    <div class="screen-body no-nav" style="display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100dvh; gap:12px; text-align:center;">
      <p style="font-size:1.5rem;">👋</p>
      <h2>Olá, ${identity.name || 'você'}!</h2>
      <p class="text-secondary text-sm">Tela principal — em breve na etapa 3.</p>
    </div>
  `;
  return screen;
});
