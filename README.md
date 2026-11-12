# Jornada Financeira

> Sabe quanto você precisa gerar hoje para fechar o mês?

Um organizador financeiro pessoal — sem cadastro, sem servidor, sem nuvem.  
Tudo fica no seu dispositivo. Você decide o que fazer com seus dados.

---

## 📸 Screenshots

<!-- SCREENSHOT 1 — Tela inicial (home) com meta diária preenchida -->
<!-- Sugestão de recorte: capturar a tela Home com obrigações já cadastradas,
     mostrando o card de meta diária, barra de entrada de hoje e o módulo grid. -->
> `[Imagem: dashboard principal — meta diária + status do dia]`

---

<!-- SCREENSHOT 2 — Tela de Registrar Entrada -->
<!-- Sugestão de recorte: abrir a tela de registrar entrada com valor digitado,
     mostrando a barra de progresso e o preview "Falta R$ X" em vermelho. -->
> `[Imagem: registrar entrada — barra de progresso e preview em tempo real]`

---

<!-- SCREENSHOT 3 — Tela de Obrigações -->
<!-- Sugestão de recorte: lista com 2-3 obrigações cadastradas, badges de urgência
     ("Hoje", "Em 3 dias") e o botão de adicionar no fundo. -->
> `[Imagem: obrigações ordenadas por urgência com badges]`

---

<!-- SCREENSHOT 4 — Tela de Cartões -->
<!-- Sugestão de recorte: um ou dois cartões cadastrados mostrando os dias
     até o corte e o vencimento. -->
> `[Imagem: cartões de crédito com datas de corte e vencimento]`

---

<!-- SCREENSHOT 5 — Fluxo de Onboarding (primeira tela) -->
<!-- Sugestão de recorte: primeira tela do onboarding onde o usuário digita o nome,
     mostrando os pontos de progresso e o design limpo. -->
> `[Imagem: onboarding — primeiro acesso, entrada de nome]`

---

## Como funciona

A lógica é simples: qualquer custo tem um **valor** e um **período**.  
O app converte tudo para **custo por dia** e soma tudo.

```
Gasolina   R$ 80 / semana   =  R$ 11,43 / dia
Aluguel    R$ 900 / mês     =  R$ 30,00 / dia
Cartão     R$ 300 / fatura  =  R$ 10,00 / dia
                              ──────────────────
Meta diária                    R$ 51,43 / dia
```

Quando você registra uma entrada, o app cruza com a meta e mostra:  
🔴 **Falta R$ X** → ainda não atingiu  
🟢 **Sobra R$ X** → passou da meta

---

## Módulos

| Módulo | O que faz |
|---|---|
| **Obrigações** | Cadastra gastos recorrentes com valor + período. Ordena por urgência. |
| **Cartões** | Gerencia múltiplos cartões com data de corte e vencimento. |
| **Entradas** | Registra receita do dia com origem (BEE, iFood, Particular, Outro). |
| **Histórico** | Lista todas as entradas agrupadas por dia. |
| **Exportar** | Gera um `.xlsx` com tudo — backup completo nos seus termos. |
| **Configurações** | Tema, tamanho de texto, ID público, apagar dados. |

---

## Privacidade por design

- **Sem login.** Sem e-mail. Sem servidor.
- Todos os dados ficam no `localStorage` do seu dispositivo.
- A senha é convertida em hash (PBKDF2 · SHA-256 · 100k iterações) — nunca armazenada em texto puro.
- O app gera um **ID público** (ex: `A3F2-9KX1-BZ74-M2QP`) para recuperação. Nenhuma outra informação sai do dispositivo.
- A exportação `.xlsx` nunca inclui senha ou chave privada.

---

## Acessibilidade

- Texto ajustável em 3 tamanhos diretamente no app.
- Layout se adapta ao tamanho do texto — sem cortes.
- Ações destrutivas pedem confirmação (pode desativar nas configurações).
- Projetado para funcionar bem de 20+ anos até pessoas com mais dificuldade de leitura.

---

## Tecnologia

- HTML · CSS · JavaScript — sem frameworks, sem dependências em runtime.
- Hospedado no GitHub Pages — gratuito, estático, sem rastreamento.
- Único script externo: [SheetJS](https://sheetjs.com/) para gerar o `.xlsx`.

---

## Estrutura do projeto

```
jornada-financeira/
├── index.html
├── css/
│   ├── base.css          # Reset, tipografia, escala de texto
│   ├── theme.css         # Tokens de cor (dark/light)
│   ├── layout.css        # Shell, bottom-nav, utilitários
│   ├── components.css    # Botões, inputs, cards, badges
│   ├── onboarding.css    # Fluxo de primeiro acesso
│   ├── home.css          # Dashboard principal
│   ├── obligations.css   # Tela de obrigações
│   ├── cards.css         # Tela de cartões
│   ├── income.css        # Tela de registrar entrada
│   └── settings.css      # Configurações
└── js/
    ├── app.js            # Roteador de telas
    ├── storage.js        # Abstração do localStorage
    ├── crypto.js         # Hash de senha, geração de ID
    ├── finance.js        # Lógica financeira central
    ├── theme.js          # Controle de tema
    ├── export.js         # Geração do .xlsx
    └── screens/
        ├── onboarding.js
        ├── home.js
        ├── obligations.js
        ├── cards.js
        ├── add-income.js
        ├── history.js
        ├── settings.js
        └── export.js
```

---

## Usando o app

Acesse diretamente: **[tiyuyyh.github.io/jornada-financeira](https://tiyuyyh.github.io/jornada-financeira)**

Ou clone e abra localmente:

```bash
git clone https://github.com/Tiyuyyh/jornada-financeira.git
cd jornada-financeira
# Abra o index.html no navegador — sem build, sem npm, sem nada.
```

---

## Licença

MIT — faça o que quiser.  
Se usar como base para outro projeto, um crédito é bem-vindo (mas não obrigatório).

```
MIT License

Copyright (c) 2026 Tiyuyyh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
