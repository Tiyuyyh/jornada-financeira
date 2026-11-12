/**
 * app.js
 * Ponto de entrada. Inicializa o app e decide qual tela mostrar.
 */

const App = (() => {

  const container = document.getElementById('screen-container');

  // Registra de screens disponíveis
  // Cada etapa vai adicionar a sua aqui
  const screens = {};

  function register(name, renderFn) {
    screens[name] = renderFn;
  }

  function navigate(name, params = {}) {
    if (!screens[name]) {
      console.warn(`Tela "${name}" não encontrada.`);
      return;
    }

    // Limpa tela atual
    container.innerHTML = '';

    // Monta nova tela
    const el = screens[name](params);
    el.classList.add('screen-enter');
    container.appendChild(el);
  }

  function init() {
    // Verifica localStorage
    if (!Storage.isAvailable()) {
      showStorageError();
      return;
    }

    // Aplica tema
    Theme.init();

    // Verifica estado do usuário
    const identity = Storage.get('identity');

    if (!identity) {
      // Primeiro acesso — vai para onboarding
      navigate('onboarding');
    } else {
      // Já configurado — vai para home (etapa 3)
      navigate('home');
    }
  }

  function showStorageError() {
    container.innerHTML = `
      <div class="screen" style="padding:40px 24px; gap:16px; display:flex; flex-direction:column; justify-content:center; min-height:100dvh;">
        <p style="color:var(--text-secondary); font-size:0.9375rem; line-height:1.6;">
          Seu navegador está bloqueando o armazenamento local. Para usar o app, permita cookies e dados do site, ou saia do modo privado.
        </p>
      </div>
    `;
  }

  // init() é chamado manualmente pelo último script do index.html
  return { register, navigate, init };

})();
