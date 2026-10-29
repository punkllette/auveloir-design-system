(function () {
  "use strict";

  const demo = window.NEXO_DEMO;
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
  const longDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
  const goalDate = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  const viewNames = { overview: "Visão geral", transactions: "Transações", goals: "Metas", assistant: "Assistente" };
  const state = {
    transactions: demo.transactions.map((transaction) => ({ ...transaction })),
    goals: demo.goals.map((goal) => ({ ...goal })),
    period: demo.currentPeriod,
    mode: "demo",
    name: "Luiza Martins",
    editingTransactionId: null,
    editingGoalId: null,
    confirmedAction: null,
    pendingDraft: null,
    filters: { search: "", type: "", category: "", start: "", end: "" },
    toastTimer: null
  };
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const money = (cents) => currency.format(cents / 100);
  const dateUTC = (iso) => new Date(iso + "T12:00:00Z");
  const dateLabel = (iso) => shortDate.format(dateUTC(iso));
  const fullDateLabel = (iso) => longDate.format(dateUTC(iso));
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const category = (id) => demo.categories.find((item) => item.id === id);
  const categoryName = (id) => category(id)?.label || "Outros";
  const storageKey = "nexo.finance.v1";
  const todayISO = () => new Date().toLocaleDateString("en-CA");
  const validDate = (iso) => /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(dateUTC(iso).getTime()) && dateUTC(iso).toISOString().slice(0, 10) === iso;
  const periodLabel = (period) => new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(dateUTC(period + "-01")).replace(/^./, (letter) => letter.toLocaleUpperCase("pt-BR"));
  const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("pt-BR")).join("");

  function loadSavedData() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.version !== 1 || !Array.isArray(saved.transactions) || !Array.isArray(saved.goals)) return;
      state.mode = saved.mode === "personal" ? "personal" : "demo";
      state.name = typeof saved.name === "string" && saved.name.trim() ? saved.name.trim().slice(0, 40) : "Luiza Martins";
      state.transactions = saved.transactions.filter((item) => item && typeof item.id === "string" && validDate(item.date) && ["receita", "despesa"].includes(item.type) && category(item.category)?.type === item.type && typeof item.description === "string" && Number.isSafeInteger(item.cents) && item.cents > 0 && item.cents <= 99999999999).map((item) => ({ id: item.id, date: item.date, type: item.type, category: item.category, description: item.description.slice(0, 70), cents: item.cents }));
      state.goals = saved.goals.filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && Number.isSafeInteger(item.targetCents) && item.targetCents > 0 && Number.isSafeInteger(item.currentCents) && item.currentCents >= 0 && validDate(item.due)).map((item) => ({ id: item.id, name: item.name.slice(0, 55), description: String(item.description || "").slice(0, 100), symbol: String(item.symbol || "✦").slice(0, 3), targetCents: item.targetCents, currentCents: item.currentCents, due: item.due }));
      if (/^\d{4}-(0[1-9]|1[0-2])$/.test(saved.period)) state.period = saved.period;
    } catch { /* Storage may be blocked or contain malformed data. The demo remains usable. */ }
  }

  function backupData() {
    return { version: 1, mode: state.mode, name: state.name, period: state.period, transactions: state.transactions, goals: state.goals };
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(backupData()));
      return true;
    } catch {
      showToast("Não foi possível salvar neste navegador. Verifique o armazenamento disponível.");
      return false;
    }
  }

  function renderIdentity() {
    if (!$("#workspace-mode-label")) return;
    const personal = state.mode === "personal";
    const firstName = state.name.split(/\s+/)[0];
    $("#overview-title").innerHTML = (firstName === "Você" ? "Seu espaço" : "Bom dia, " + escapeHTML(firstName)) + '<span class="title-period">.</span>';
    $("#profile-name").textContent = state.name;
    $("#profile-subtitle").textContent = personal ? "Dados neste navegador" : "Dados demonstrativos";
    $("#profile-avatar").textContent = initials(state.name);
    $("#workspace-mode-label").textContent = personal ? "PROTÓTIPO · MEUS DADOS" : "PROTÓTIPO · DEMO";
    $("#footer-data-note").textContent = personal ? "Seus dados ficam apenas neste navegador" : "Dados fictícios · salvos apenas neste navegador";
    $("#goals-note-text").textContent = personal ? "Metas são independentes das transações neste protótipo." : "Metas ilustrativas; seus valores são independentes das transações.";
    $("#data-mode-title").textContent = personal ? "Meus dados" : "Demonstração";
    $("#data-mode-description").textContent = personal ? "Seus lançamentos e metas ficam neste navegador. Você pode voltar à demonstração quando quiser." : "Explore com dados ilustrativos ou comece um espaço vazio para usar seus próprios dados.";
    $("#switch-data-mode").textContent = personal ? "Restaurar demonstração" : "Começar com meus dados";
  }

  function parseCents(input) {
    const raw = String(input).trim().replace(/[^\d,.-]/g, "");
    if (!raw || raw.startsWith("-")) return null;
    const comma = raw.lastIndexOf(",");
    const dot = raw.lastIndexOf(".");
    let normalized;
    if (comma > -1 && dot > -1) normalized = comma > dot ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
    else if (comma > -1) normalized = raw.replace(/\./g, "").replace(",", ".");
    else if (dot > -1 && /^\d{1,3}(\.\d{3})+$/.test(raw)) normalized = raw.replace(/\./g, "");
    else normalized = raw;
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
    const cents = Math.round(Number(normalized) * 100);
    return Number.isSafeInteger(cents) && cents > 0 && cents <= 99999999999 ? cents : null;
  }

  function totals(transactions) {
    return transactions.reduce((acc, transaction) => {
      acc[transaction.type === "receita" ? "income" : "expense"] += transaction.cents;
      return acc;
    }, { income: 0, expense: 0 });
  }

  function sorted(transactions) {
    return transactions.map((transaction, index) => ({ transaction, index }))
      .sort((a, b) => b.transaction.date.localeCompare(a.transaction.date) || b.index - a.index)
      .map(({ transaction }) => transaction);
  }

  function periodTransactions() {
    return state.transactions.filter((transaction) => transaction.date.startsWith(state.period));
  }

  function renderPeriod() {
    const periods = [...new Set([state.period, ...(state.mode === "demo" ? demo.periods.map((item) => item.value) : [todayISO().slice(0, 7)]), ...state.transactions.map((item) => item.date.slice(0, 7))])].sort().reverse();
    $("#period-select").innerHTML = periods.map((period) => `<option value="${period}">${escapeHTML(periodLabel(period))}</option>`).join("");
    $("#period-select").value = state.period;
    const label = periodLabel(state.period);
    $("#balance-period").textContent = label;
    $("#chart-period-label").textContent = label;
  }

  function renderSummary() {
    const transactions = periodTransactions();
    const { income, expense } = totals(transactions);
    const balance = income - expense;
    $("#balance-value").textContent = money(balance);
    $("#balance-value").style.color = balance < 0 ? "var(--copper)" : "";
    $("#balance-caption").textContent = balance < 0 ? "Despesas acima das receitas no período" : "Receitas menos despesas do mês";
    $("#income-value").textContent = money(income);
    $("#expense-value").textContent = money(expense);
    $("#income-count").textContent = `${transactions.filter((transaction) => transaction.type === "receita").length} entradas registradas`;
    $("#expense-count").textContent = `${transactions.filter((transaction) => transaction.type === "despesa").length} saídas registradas`;
  }

  function renderChart() {
    const [year, month] = state.period.split("-").map(Number);
    const days = new Date(year, month, 0).getDate();
    const daily = Array(days).fill(0);
    for (const transaction of periodTransactions()) {
      const day = Number(transaction.date.slice(-2));
      daily[day - 1] += transaction.type === "receita" ? transaction.cents : -transaction.cents;
    }
    let running = 0;
    const values = daily.map((amount) => (running += amount));
    const min = Math.min(0, ...values);
    const max = Math.max(0, ...values);
    const spread = Math.max(max - min, 10000);
    const top = max + spread * .14;
    const bottom = min - spread * .12;
    const plot = { left: 75, right: 744, top: 20, bottom: 208 };
    const x = (index) => plot.left + index / (days - 1) * (plot.right - plot.left);
    const y = (value) => plot.bottom - (value - bottom) / (top - bottom) * (plot.bottom - plot.top);
    const points = values.map((value, index) => [x(index), y(value)]);
    const line = points.map(([px, py], index) => `${index ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
    const area = `${line} L${plot.right} ${plot.bottom} L${plot.left} ${plot.bottom} Z`;
    const ticks = [0, 1, 2, 3].map((index) => {
      const value = bottom + (top - bottom) * (3 - index) / 3;
      const py = y(value);
      const label = Math.abs(value) >= 100000 ? `${(value / 100000).toFixed(0)} mil` : `R$ ${Math.round(value / 100)}`;
      return `<line class="grid-line" x1="${plot.left}" x2="${plot.right}" y1="${py}" y2="${py}"/><text x="0" y="${py + 4}">${escapeHTML(label)}</text>`;
    }).join("");
    const dayLabels = [1, 8, 15, 22, days].map((day) => `<text x="${x(day - 1)}" y="244" text-anchor="${day === 1 ? "start" : day === days ? "end" : "middle"}">${String(day).padStart(2, "0")} ${month === 10 ? "out" : month === 9 ? "set" : "ago"}</text>`).join("");
    const last = points.at(-1);
    $("#finance-chart").innerHTML = `<svg viewBox="0 0 760 255" aria-hidden="true"><defs><linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d6ab62" stop-opacity=".25"/><stop offset="100%" stop-color="#d6ab62" stop-opacity="0"/></linearGradient></defs>${ticks}<path class="area" d="${area}"/><path class="balance-line" d="${line}"/><circle class="last-dot" cx="${last[0]}" cy="${last[1]}" r="5"/>${dayLabels}</svg>`;
    $("#finance-chart").setAttribute("aria-label", `Evolução diária do saldo em ${periodLabel(state.period)}. Saldo final ${money(values.at(-1) || 0)}.`);
    const chart = $("#finance-chart");
    const svg = chart.querySelector("svg");
    const svgNS = "http://www.w3.org/2000/svg";
    const crosshair = document.createElementNS(svgNS, "line");
    crosshair.setAttribute("class", "chart-crosshair");
    crosshair.setAttribute("y1", String(plot.top));
    crosshair.setAttribute("y2", String(plot.bottom));
    crosshair.style.display = "none";
    const hoverDot = document.createElementNS(svgNS, "circle");
    hoverDot.setAttribute("class", "chart-hover-dot");
    hoverDot.setAttribute("r", "6");
    hoverDot.style.display = "none";
    svg.append(crosshair, hoverDot);

    const tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    tooltip.hidden = true;
    tooltip.innerHTML = "<strong></strong><span></span><small></small>";
    chart.append(tooltip);
    let selectedDay = days - 1;

    function showDay(index) {
      selectedDay = Math.max(0, Math.min(days - 1, index));
      const [px, py] = points[selectedDay];
      crosshair.setAttribute("x1", String(px));
      crosshair.setAttribute("x2", String(px));
      crosshair.style.display = "";
      hoverDot.setAttribute("cx", String(px));
      hoverDot.setAttribute("cy", String(py));
      hoverDot.style.display = "";
      tooltip.hidden = false;
      tooltip.style.left = `${Math.max(15, Math.min(85, px / 760 * 100))}%`;
      const date = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay + 1).padStart(2, "0")}`;
      const dayCount = periodTransactions().filter((transaction) => transaction.date === date).length;
      const variation = daily[selectedDay];
      tooltip.querySelector("strong").textContent = shortDate.format(dateUTC(date));
      tooltip.querySelector("span").textContent = money(values[selectedDay]);
      tooltip.querySelector("small").textContent = `${variation >= 0 ? "+" : "−"}${money(Math.abs(variation))} no dia · ${dayCount} ${dayCount === 1 ? "lançamento" : "lançamentos"}`;
    }

    function hideDay() {
      tooltip.hidden = true;
      crosshair.style.display = "none";
      hoverDot.style.display = "none";
    }

    svg.addEventListener("pointermove", (event) => {
      const bounds = svg.getBoundingClientRect();
      const svgX = (event.clientX - bounds.left) / bounds.width * 760;
      showDay(Math.round((svgX - plot.left) / (plot.right - plot.left) * (days - 1)));
    });
    svg.addEventListener("pointerleave", () => {
      if (document.activeElement !== chart) hideDay();
    });
    chart.onfocus = () => showDay(selectedDay);
    chart.onblur = hideDay;
    chart.onkeydown = (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") showDay(0);
      else if (event.key === "End") showDay(days - 1);
      else showDay(selectedDay + (event.key === "ArrowRight" ? 1 : -1));
    };
  }

  function transactionMarkup(transaction, editable = false) {
    const typeLabel = transaction.type === "receita" ? "Entrada" : "Saída";
    const sign = transaction.type === "receita" ? "+" : "−";
    return `<div class="transaction-row"><span class="tx-icon" aria-hidden="true">${escapeHTML(category(transaction.category)?.icon || "◌")}</span><div class="tx-main"><strong>${escapeHTML(transaction.description)}</strong><small>${escapeHTML(categoryName(transaction.category))} · ${escapeHTML(dateLabel(transaction.date))} · ${typeLabel}</small></div><strong class="tx-amount ${transaction.type}">${sign} ${money(transaction.cents)}</strong>${editable && $("#confirm-dialog") ? `<div class="row-actions"><button type="button" data-edit-transaction="${escapeHTML(transaction.id)}" aria-label="Editar ${escapeHTML(transaction.description)}">Editar</button><button type="button" data-delete-transaction="${escapeHTML(transaction.id)}" aria-label="Excluir ${escapeHTML(transaction.description)}">Excluir</button></div>` : ""}</div>`;
  }

  function renderRecent() {
    const recent = sorted(periodTransactions()).slice(0, 4);
    $("#recent-transactions").innerHTML = recent.length ? recent.map(transactionMarkup).join("") : '<p class="empty-state">Nenhuma transação neste período.</p>';
  }

  function goalMarkup(goal, compact) {
    const percent = Math.min(100, Math.round(goal.currentCents / goal.targetCents * 100));
    const body = `<div class="goal-preview"><div class="goal-preview-head">${compact ? `<strong>${escapeHTML(goal.name)}</strong>` : "<span>PROGRESSO</span>"}<span>${percent}%</span></div><div class="progress-track" role="progressbar" aria-label="Progresso da meta ${escapeHTML(goal.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span class="progress-fill" style="width:${percent}%"></span></div><div class="goal-preview-meta"><span>${money(goal.currentCents)} acumulados</span><span>de ${money(goal.targetCents)}</span></div></div>`;
    if (compact) return body;
    return `<article class="goal-card"><span class="goal-symbol" aria-hidden="true">${escapeHTML(goal.symbol)}</span><h2>${escapeHTML(goal.name)}</h2>${goal.description ? `<p>${escapeHTML(goal.description)}</p>` : ""}${body}<div class="goal-due"><svg class="icon" aria-hidden="true"><use href="#i-calendar"></use></svg> Previsão: ${escapeHTML(goalDate.format(dateUTC(goal.due)))}</div>${$("#confirm-dialog") ? `<div class="row-actions goal-actions"><button type="button" data-edit-goal="${escapeHTML(goal.id)}" aria-label="Editar meta ${escapeHTML(goal.name)}">Editar</button><button type="button" data-delete-goal="${escapeHTML(goal.id)}" aria-label="Excluir meta ${escapeHTML(goal.name)}">Excluir</button></div>` : ""}</article>`;
  }

  function renderGoals() {
    $("#overview-goals").innerHTML = state.goals.length ? state.goals.slice(0, 3).map((goal) => goalMarkup(goal, true)).join("") : '<p class="empty-state">Crie sua primeira meta para acompanhar o progresso.</p>';
    $("#all-goals").innerHTML = state.goals.length ? state.goals.map((goal) => goalMarkup(goal, false)).join("") : '<p class="empty-state">Ainda não há metas. Comece com um objetivo que importa para você.</p>';
    $("#goals-total").textContent = `${state.goals.length} ${state.goals.length === 1 ? "meta em andamento" : "metas em andamento"}`;
  }

  function filteredTransactions() {
    const f = state.filters;
    const term = f.search.toLocaleLowerCase("pt-BR").trim();
    return sorted(state.transactions.filter((transaction) => {
      if (f.type && transaction.type !== f.type) return false;
      if (f.category && transaction.category !== f.category) return false;
      if (f.start && transaction.date < f.start) return false;
      if (f.end && transaction.date > f.end) return false;
      if (term && !(`${transaction.description} ${categoryName(transaction.category)}`).toLocaleLowerCase("pt-BR").includes(term)) return false;
      return true;
    }));
  }

  function renderTransactions() {
    const list = filteredTransactions();
    const { income, expense } = totals(list);
    $("#all-transactions").innerHTML = list.map((transaction) => transactionMarkup(transaction, true)).join("");
    $("#transactions-empty").hidden = list.length > 0;
    $("#transactions-empty").textContent = state.transactions.length ? "Nenhuma transação encontrada. Ajuste a busca ou os filtros." : "Ainda não há lançamentos. Adicione o primeiro para começar.";
    $("#transaction-count").textContent = `${list.length} ${list.length === 1 ? "lançamento" : "lançamentos"}`;
    $("#filtered-income").textContent = money(income);
    $("#filtered-expense").textContent = money(expense);
    $("#filtered-balance").textContent = money(income - expense);
    $("#nav-tx-count").textContent = String(state.transactions.length);
  }

  function fillCategories(select, type, all) {
    const previous = select.value;
    select.innerHTML = (all ? '<option value="">Todas as categorias</option>' : "") + demo.categories.filter((item) => all || item.type === type).map((item) => `<option value="${item.id}">${escapeHTML(item.label)}</option>`).join("");
    if ([...select.options].some((option) => option.value === previous)) select.value = previous;
  }

  function renderAll() {
    renderIdentity();
    renderPeriod();
    renderSummary();
    renderChart();
    renderRecent();
    renderGoals();
    renderTransactions();
  }

  function navigate(view, updateHash = true) {
    if (!viewNames[view]) view = "overview";
    $$(".view").forEach((section) => { section.hidden = section.id !== `view-${view}`; });
    $$(".nav-link").forEach((button) => {
      const active = button.dataset.view === view;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
    });
    $("#breadcrumb-current").textContent = viewNames[view];
    if (updateHash && location.hash !== `#${view}`) location.hash = view;
    window.scrollTo(0, 0);
    $("#main-content").focus({ preventScroll: true });
  }

  function showToast(text) {
    const toast = $("#toast");
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => { toast.hidden = true; }, 4200);
  }

  function showTransactionDialog(transaction = null) {
    state.editingTransactionId = transaction?.id || null;
    $("#transaction-form").reset();
    $("#transaction-type").value = "despesa";
    fillCategories($("#transaction-category"), "despesa", false);
    $("#transaction-date").value = todayISO().startsWith(state.period) ? todayISO() : state.period + "-01";
    if (transaction) {
      $("#transaction-type").value = transaction.type;
      fillCategories($("#transaction-category"), transaction.type, false);
      $("#transaction-category").value = transaction.category;
      $("#transaction-amount").value = (transaction.cents / 100).toFixed(2).replace(".", ",");
      $("#transaction-description").value = transaction.description;
      $("#transaction-date").value = transaction.date;
    }
    $("#dialog-title").textContent = transaction ? "Editar lançamento" : "Novo lançamento";
    if ($("#transaction-submit")) $("#transaction-submit").textContent = transaction ? "Salvar alterações" : "Adicionar transação";
    $("#transaction-error").hidden = true;
    $("#transaction-dialog").showModal();
    $("#transaction-amount").focus();
  }

  function readTransactionForm() {
    const type = $("#transaction-type").value;
    const cents = parseCents($("#transaction-amount").value);
    const description = $("#transaction-description").value.trim();
    const categoryId = $("#transaction-category").value;
    const date = $("#transaction-date").value;
    if (!cents) return { error: "Informe um valor válido maior que zero, com até duas casas decimais." };
    if (!description) return { error: "Informe uma descrição para o lançamento." };
    if (!category(categoryId) || category(categoryId).type !== type) return { error: "Selecione uma categoria compatível com o tipo." };
    if (!validDate(date)) return { error: "Selecione uma data válida." };
    return { transaction: { id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, date, type, category: categoryId, description, cents } };
  }

  function saveTransaction(transaction) {
    const index = state.transactions.findIndex((item) => item.id === transaction.id);
    if (index < 0) state.transactions.push(transaction); else state.transactions[index] = transaction;
    state.period = transaction.date.slice(0, 7);
    persist();
    renderAll();
    showToast(`${transaction.type === "receita" ? "Receita" : "Despesa"} ${index < 0 ? "registrada" : "atualizada"}: ${money(transaction.cents)}.`);
  }

  function addChatMessage(role, text) {
    const message = document.createElement("div");
    message.className = `message ${role}`;
    const avatar = document.createElement("span");
    avatar.className = "small-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = role === "user" ? initials(state.name) : "✦";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    const content = document.createElement("span");
    content.className = "message-text";
    content.textContent = text;
    bubble.append(content);
    message.append(avatar, bubble);
    $("#chat-messages").append(message);
    $("#chat-messages").scrollTop = $("#chat-messages").scrollHeight;
  }

  function draftFromMessage(message) {
    const amountText = message.match(/R\$\s*([\d.,]+)/i)?.[1] || message.match(/\b(\d[\d.,]*)\b/)?.[1];
    const cents = amountText ? parseCents(amountText) : null;
    if (!cents) return null;
    const lower = message.toLocaleLowerCase("pt-BR");
    const type = /\b(recebi|ganhei|entrou|vendi|sal[aá]rio|freela|freelance)\b/i.test(lower) ? "receita" : /\b(gastei|paguei|comprei|custou|despesa)\b/i.test(lower) ? "despesa" : null;
    if (!type) return null;
    const rules = type === "receita" ? [
      { test: /sal[aá]rio/, category: "salario", description: "Salário" },
      { test: /freela|freelance|projeto|cliente/, category: "freelance", description: "Trabalho extra" }
    ] : [
      { test: /almo[cç]o|jantar|caf[eé]|mercado|comida/, category: "alimentacao", description: "Alimentação" },
      { test: /aluguel|luz|energia|internet|[aá]gua/, category: "moradia", description: "Moradia" },
      { test: /uber|[oô]nibus|transporte|gasolina/, category: "transporte", description: "Transporte" },
      { test: /farm[aá]cia|m[eé]dico|consulta|sa[uú]de/, category: "saude", description: "Saúde" },
      { test: /curso|livro|aula/, category: "educacao", description: "Educação" }
    ];
    const match = rules.find((rule) => rule.test.test(lower));
    const categoryId = match?.category || (type === "receita" ? "outros-ganhos" : "outros-gastos");
    const description = match?.description || (type === "receita" ? "Outra entrada" : "Outro gasto");
    const day = new Date();
    if (/ontem/.test(lower)) day.setDate(day.getDate() - 1);
    const date = day.toLocaleDateString("en-CA");
    return { type, cents, category: categoryId, description, date };
  }

  function draftCardMarkup(draft) {
    return `<h3>SUGESTÃO DE LANÇAMENTO · NÃO SALVO</h3><dl class="draft-grid"><dt>Tipo</dt><dd>${draft.type === "receita" ? "Receita" : "Despesa"}</dd><dt>Valor</dt><dd class="draft-amount">${money(draft.cents)}</dd><dt>Descrição</dt><dd>${escapeHTML(draft.description)}</dd><dt>Categoria</dt><dd>${escapeHTML(categoryName(draft.category))}</dd><dt>Data</dt><dd>${escapeHTML(fullDateLabel(draft.date))}</dd></dl><div class="draft-actions"><button type="button" class="button-primary" data-draft-action="confirm"><svg class="icon"><use href="#i-check"></use></svg> Confirmar registro</button><button type="button" class="button-secondary" data-draft-action="edit">Editar dados</button><button type="button" class="button-secondary" data-draft-action="cancel">Cancelar</button></div>`;
  }

  function renderDraft(editing = false) {
    let card = $("#pending-draft");
    if (!state.pendingDraft) { card?.remove(); return; }
    if (!card) {
      card = document.createElement("div");
      card.id = "pending-draft";
      card.className = "draft-card";
      $("#chat-messages").append(card);
    }
    if (!editing) card.innerHTML = draftCardMarkup(state.pendingDraft);
    else {
      const draft = state.pendingDraft;
      card.innerHTML = `<h3>REVISE A SUGESTÃO · AINDA NÃO SALVA</h3><form id="draft-edit-form" class="draft-edit"><label>Tipo<select id="draft-type"><option value="despesa">Despesa</option><option value="receita">Receita</option></select></label><label>Valor (R$)<input id="draft-amount" inputmode="decimal" value="${escapeHTML((draft.cents / 100).toFixed(2).replace(".", ","))}" required></label><label class="wide">Descrição<input id="draft-description" value="${escapeHTML(draft.description)}" maxlength="70" required></label><label>Categoria<select id="draft-category"></select></label><label>Data<input id="draft-date" type="date" value="${escapeHTML(draft.date)}" required></label><p id="draft-error" class="draft-error" role="alert" hidden></p><div class="draft-actions wide"><button class="button-primary" type="submit">Revisar sugestão</button><button class="button-secondary" type="button" data-draft-action="cancel">Cancelar</button></div></form>`;
      $("#draft-type").value = draft.type;
      fillCategories($("#draft-category"), draft.type, false);
      $("#draft-category").value = draft.category;
      $("#draft-description").focus();
    }
    $("#chat-messages").scrollTop = $("#chat-messages").scrollHeight;
  }

  function processChatMessage(text) {
    const message = text.trim();
    if (!message) return;
    if (state.pendingDraft) { showToast("Confirme ou cancele a sugestão pendente antes de continuar."); return; }
    addChatMessage("user", message);
    const draft = draftFromMessage(message);
    if (!draft) {
      addChatMessage("assistant", "Esta é uma simulação local. Experimente uma frase como “Gastei R$ 42 no almoço hoje” ou “Recebi R$ 3.000 de salário”. Nenhum lançamento foi criado.");
      return;
    }
    state.pendingDraft = draft;
    addChatMessage("assistant", "Entendi. Preparei uma sugestão para você revisar. O registro só será adicionado se você confirmar.");
    renderDraft();
  }

  function askConfirmation(title, message, action) {
    $("#confirm-title").textContent = title;
    $("#confirm-message").textContent = message;
    state.confirmedAction = action;
    $("#confirm-dialog").showModal();
  }

  function showGoalDialog(goal = null) {
    state.editingGoalId = goal?.id || null;
    $("#goal-form").reset();
    $("#goal-dialog-title").textContent = goal ? "Editar meta" : "Nova meta";
    $("#goal-submit").textContent = goal ? "Salvar alterações" : "Salvar meta";
    $("#goal-due").value = goal?.due.slice(0, 7) || todayISO().slice(0, 7);
    if (goal) {
      $("#goal-name").value = goal.name;
      $("#goal-target").value = (goal.targetCents / 100).toFixed(2).replace(".", ",");
      $("#goal-current").value = (goal.currentCents / 100).toFixed(2).replace(".", ",");
      $("#goal-description").value = goal.description;
    }
    $("#goal-error").hidden = true;
    $("#goal-dialog").showModal();
    $("#goal-name").focus();
  }

  function saveGoalFromForm() {
    const name = $("#goal-name").value.trim();
    const targetCents = parseCents($("#goal-target").value);
    const currentRaw = $("#goal-current").value.trim();
    const currentCents = currentRaw === "0" || currentRaw === "0,00" || currentRaw === "" ? 0 : parseCents(currentRaw);
    const dueMonth = $("#goal-due").value;
    let error = "";
    if (!name) error = "Dê um nome à meta.";
    else if (!targetCents) error = "Informe um objetivo maior que zero.";
    else if (currentCents === null) error = "Informe um valor acumulado válido.";
    else if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(dueMonth)) error = "Selecione uma previsão válida.";
    if (error) { $("#goal-error").textContent = error; $("#goal-error").hidden = false; return; }
    const existing = state.goals.find((item) => item.id === state.editingGoalId);
    const goal = { id: existing?.id || "goal-" + Date.now(), name, description: $("#goal-description").value.trim(), symbol: existing?.symbol || "✦", targetCents, currentCents, due: dueMonth + "-01" };
    if (existing) state.goals[state.goals.indexOf(existing)] = goal; else state.goals.push(goal);
    persist();
    renderAll();
    $("#goal-dialog").close();
    showToast(existing ? "Meta atualizada." : "Meta criada.");
  }

  function exportData() {
    const data = { ...backupData(), exportedAt: new Date().toISOString() };
    const file = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexo-backup-" + todayISO() + ".json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Backup baixado. Guarde o arquivo em um lugar seguro.");
  }

  function validateBackup(data) {
    if (!data || data.version !== 1 || !["demo", "personal"].includes(data.mode) ||
        typeof data.name !== "string" || !data.name.trim() || data.name.length > 40 ||
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(data.period) ||
        !Array.isArray(data.transactions) || data.transactions.length > 10000 ||
        !Array.isArray(data.goals) || data.goals.length > 1000) return null;
    const transactionIds = new Set();
    const transactions = [];
    for (const item of data.transactions) {
      if (!item || typeof item.id !== "string" || !item.id || item.id.length > 100 ||
          transactionIds.has(item.id) || !validDate(item.date) ||
          !["receita", "despesa"].includes(item.type) || category(item.category)?.type !== item.type ||
          typeof item.description !== "string" || !item.description.trim() || item.description.length > 70 ||
          !Number.isSafeInteger(item.cents) || item.cents <= 0 || item.cents > 99999999999) return null;
      transactionIds.add(item.id);
      transactions.push({ id: item.id, date: item.date, type: item.type, category: item.category, description: item.description.trim(), cents: item.cents });
    }
    const goalIds = new Set();
    const goals = [];
    for (const item of data.goals) {
      if (!item || typeof item.id !== "string" || !item.id || item.id.length > 100 ||
          goalIds.has(item.id) || typeof item.name !== "string" || !item.name.trim() || item.name.length > 55 ||
          typeof item.description !== "string" || item.description.length > 100 ||
          typeof item.symbol !== "string" || item.symbol.length > 3 ||
          !Number.isSafeInteger(item.targetCents) || item.targetCents <= 0 || item.targetCents > 99999999999 ||
          !Number.isSafeInteger(item.currentCents) || item.currentCents < 0 || item.currentCents > 99999999999 ||
          !validDate(item.due)) return null;
      goalIds.add(item.id);
      goals.push({ id: item.id, name: item.name.trim(), description: item.description, symbol: item.symbol || "✦", targetCents: item.targetCents, currentCents: item.currentCents, due: item.due });
    }
    return { version: 1, mode: data.mode, name: data.name.trim(), period: data.period, transactions, goals };
  }

  async function importData(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Arquivo muito grande. O limite é 2 MB."); return; }
    let backup;
    try { backup = validateBackup(JSON.parse(await file.text())); }
    catch { /* Invalid JSON or unreadable file. */ }
    if (!backup) { showToast("Backup inválido ou incompatível com esta versão do Nexo."); return; }
    askConfirmation("Importar backup?", "Isso substituirá os dados atuais neste navegador por " + backup.transactions.length + (backup.transactions.length === 1 ? " lançamento e " : " lançamentos e ") + backup.goals.length + (backup.goals.length === 1 ? " meta do arquivo. " : " metas do arquivo. ") + "A ação não pode ser desfeita.", () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(backup));
        location.reload();
      } catch {
        showToast("Não foi possível salvar o backup neste navegador.");
      }
    });
  }

  function openSettings() {
    $("#user-name").value = state.name;
    $("#settings-dialog").showModal();
    $("#user-name").focus();
  }

  function switchMode() {
    const personal = state.mode === "personal";
    askConfirmation(personal ? "Restaurar demonstração?" : "Começar com seus dados?", personal ? "Seus dados pessoais salvos neste navegador serão substituídos pelos dados ilustrativos. Esta ação não pode ser desfeita." : "Os dados ilustrativos serão substituídos por um espaço vazio para seus lançamentos e metas.", () => {
      state.mode = personal ? "demo" : "personal";
      state.transactions = personal ? demo.transactions.map((item) => ({ ...item })) : [];
      state.goals = personal ? demo.goals.map((item) => ({ ...item })) : [];
      state.period = personal ? demo.currentPeriod : todayISO().slice(0, 7);
      state.name = personal ? "Luiza Martins" : state.name === "Luiza Martins" ? "Você" : state.name;
      persist();
      renderAll();
      $("#settings-dialog").close();
      showToast(personal ? "Demonstração restaurada." : "Seu espaço está pronto.");
    });
  }

  function initEvents() {
    document.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-open-settings]");
      if (opener) openSettings();
      const closer = event.target.closest("[data-close-dialog]");
      if (closer) document.getElementById(closer.dataset.closeDialog).close();
      const txEdit = event.target.closest("[data-edit-transaction]");
      if (txEdit) { const item = state.transactions.find((entry) => entry.id === txEdit.dataset.editTransaction); if (item) showTransactionDialog(item); }
      const txDelete = event.target.closest("[data-delete-transaction]");
      if (txDelete) { const item = state.transactions.find((entry) => entry.id === txDelete.dataset.deleteTransaction); if (item) askConfirmation("Excluir lançamento?", item.description + " será removido do histórico.", () => { state.transactions = state.transactions.filter((entry) => entry.id !== item.id); persist(); renderAll(); showToast("Lançamento excluído."); }); }
      const goalEdit = event.target.closest("[data-edit-goal]");
      if (goalEdit) { const item = state.goals.find((entry) => entry.id === goalEdit.dataset.editGoal); if (item) showGoalDialog(item); }
      const goalDelete = event.target.closest("[data-delete-goal]");
      if (goalDelete) { const item = state.goals.find((entry) => entry.id === goalDelete.dataset.deleteGoal); if (item) askConfirmation("Excluir meta?", item.name + " será removida.", () => { state.goals = state.goals.filter((entry) => entry.id !== item.id); persist(); renderAll(); showToast("Meta excluída."); }); }
      const navigation = event.target.closest("[data-view]");
      if (navigation) navigate(navigation.dataset.view);
      const suggestion = event.target.closest("[data-suggestion]");
      if (suggestion) processChatMessage(suggestion.dataset.suggestion);
      const draftButton = event.target.closest("[data-draft-action]");
      if (draftButton) {
        const action = draftButton.dataset.draftAction;
        if (action === "edit") renderDraft(true);
        if (action === "cancel") { state.pendingDraft = null; renderDraft(); addChatMessage("assistant", "Sugestão cancelada. Nada foi registrado."); }
        if (action === "confirm" && state.pendingDraft) {
          const draft = state.pendingDraft;
          saveTransaction({ ...draft, id: `chat-${Date.now()}` });
          state.pendingDraft = null;
          renderDraft();
          addChatMessage("assistant", `Confirmado. ${draft.type === "receita" ? "Receita" : "Despesa"} de ${money(draft.cents)} salva neste navegador. Confira os totais no painel ou o histórico em Transações.`);
        }
      }
    });
    window.addEventListener("hashchange", () => navigate(location.hash.slice(1), false));
    $("#period-select").addEventListener("change", (event) => { state.period = event.target.value; persist(); renderAll(); });
    $("#open-transaction").addEventListener("click", () => showTransactionDialog());
    $("#open-goal")?.addEventListener("click", () => showGoalDialog());
    $("#goal-form")?.addEventListener("submit", (event) => { event.preventDefault(); saveGoalFromForm(); });
    $("#profile-form")?.addEventListener("submit", (event) => { event.preventDefault(); const name = $("#user-name").value.trim(); if (!name) return; state.name = name.slice(0, 40); persist(); renderIdentity(); $("#settings-dialog").close(); showToast("Nome atualizado."); });
    $("#switch-data-mode")?.addEventListener("click", switchMode);
    $("#export-data")?.addEventListener("click", exportData);
    $("#import-data")?.addEventListener("click", () => $("#import-file").click());
    $("#import-file")?.addEventListener("change", (event) => { const file = event.target.files?.[0]; event.target.value = ""; importData(file); });
    $("#confirm-action")?.addEventListener("click", () => { const action = state.confirmedAction; state.confirmedAction = null; $("#confirm-dialog").close(); action?.(); });
    $("#confirm-dialog")?.addEventListener("close", () => { state.confirmedAction = null; });
    $("#close-transaction").addEventListener("click", () => $("#transaction-dialog").close());
    $("#cancel-transaction").addEventListener("click", () => $("#transaction-dialog").close());
    $("#transaction-type").addEventListener("change", (event) => fillCategories($("#transaction-category"), event.target.value, false));
    $("#transaction-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const result = readTransactionForm();
      if (result.error) { $("#transaction-error").textContent = result.error; $("#transaction-error").hidden = false; return; }
      $("#transaction-dialog").close();
      saveTransaction({ ...result.transaction, id: state.editingTransactionId || result.transaction.id });
    });
    const filterIds = { "filter-search": "search", "filter-type": "type", "filter-category": "category", "filter-start": "start", "filter-end": "end" };
    Object.entries(filterIds).forEach(([id, field]) => {
      const element = document.getElementById(id);
      element.addEventListener(id === "filter-search" ? "input" : "change", () => { state.filters[field] = element.value; renderTransactions(); });
    });
    $("#clear-filters").addEventListener("click", () => {
      Object.entries(filterIds).forEach(([id, field]) => { document.getElementById(id).value = ""; state.filters[field] = ""; });
      renderTransactions();
      showToast("Filtros removidos.");
    });
    $("#chat-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const input = $("#chat-input");
      if (state.pendingDraft) {
        showToast("Confirme ou cancele a sugestão pendente antes de continuar.");
        return;
      }
      processChatMessage(input.value);
      input.value = "";
    });
    $("#chat-messages").addEventListener("change", (event) => {
      if (event.target.id === "draft-type") fillCategories($("#draft-category"), event.target.value, false);
    });
    $("#chat-messages").addEventListener("submit", (event) => {
      if (event.target.id !== "draft-edit-form") return;
      event.preventDefault();
      const type = $("#draft-type").value;
      const cents = parseCents($("#draft-amount").value);
      const description = $("#draft-description").value.trim();
      const categoryId = $("#draft-category").value;
      const date = $("#draft-date").value;
      let error = "";
      if (!cents) error = "Informe um valor válido maior que zero.";
      else if (!description) error = "Informe uma descrição.";
      else if (!category(categoryId) || category(categoryId).type !== type) error = "Selecione uma categoria compatível.";
      else if (!validDate(date)) error = "Selecione uma data válida.";
      if (error) { $("#draft-error").textContent = error; $("#draft-error").hidden = false; return; }
      state.pendingDraft = { type, cents, description, category: categoryId, date };
      renderDraft();
      showToast("Sugestão atualizada. Confirme para registrar.");
    });
  }

  function init() {
    loadSavedData();
    fillCategories($("#filter-category"), "", true);
    fillCategories($("#transaction-category"), "despesa", false);
    renderAll();
    initEvents();
    addChatMessage("assistant", `Olá, ${state.name.split(/\s+/)[0]}! Escreva um gasto ou receita com valor. Vou sugerir um lançamento para você revisar antes de salvar.`);
    navigate(location.hash.slice(1), false);
  }

  init();
})();
