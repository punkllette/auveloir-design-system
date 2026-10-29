/* Dados inteiramente fictícios. Valores em centavos para manter os totais exatos. */
window.NEXO_DEMO = {
  currentPeriod: "2026-10",
  periods: [
    { value: "2026-10", label: "Outubro de 2026" },
    { value: "2026-09", label: "Setembro de 2026" },
    { value: "2026-08", label: "Agosto de 2026" }
  ],
  categories: [
    { id: "salario", label: "Salário", type: "receita", icon: "↗" },
    { id: "freelance", label: "Trabalho extra", type: "receita", icon: "✦" },
    { id: "outros-ganhos", label: "Outras entradas", type: "receita", icon: "+" },
    { id: "moradia", label: "Moradia", type: "despesa", icon: "⌂" },
    { id: "alimentacao", label: "Alimentação", type: "despesa", icon: "◒" },
    { id: "transporte", label: "Transporte", type: "despesa", icon: "↗" },
    { id: "saude", label: "Saúde", type: "despesa", icon: "+" },
    { id: "assinaturas", label: "Assinaturas", type: "despesa", icon: "◌" },
    { id: "educacao", label: "Educação", type: "despesa", icon: "▤" },
    { id: "outros-gastos", label: "Outros gastos", type: "despesa", icon: "···" }
  ],
  transactions: [
    { id: "t01", date: "2026-10-01", type: "receita", category: "salario", description: "Salário mensal", cents: 650000 },
    { id: "t02", date: "2026-10-02", type: "despesa", category: "moradia", description: "Aluguel", cents: 185000 },
    { id: "t03", date: "2026-10-03", type: "despesa", category: "alimentacao", description: "Mercado da semana", cents: 42080 },
    { id: "t04", date: "2026-10-05", type: "receita", category: "freelance", description: "Projeto de identidade visual", cents: 125000 },
    { id: "t05", date: "2026-10-07", type: "despesa", category: "moradia", description: "Conta de energia", cents: 16540 },
    { id: "t06", date: "2026-10-09", type: "despesa", category: "transporte", description: "Transporte por aplicativo", cents: 9250 },
    { id: "t07", date: "2026-10-12", type: "receita", category: "outros-ganhos", description: "Cashback do cartão", cents: 6800 },
    { id: "t08", date: "2026-10-13", type: "despesa", category: "alimentacao", description: "Café e almoço", cents: 8750 },
    { id: "t09", date: "2026-10-15", type: "despesa", category: "saude", description: "Farmácia", cents: 6490 },
    { id: "t10", date: "2026-10-17", type: "despesa", category: "assinaturas", description: "Streaming", cents: 3990 },
    { id: "t11", date: "2026-10-19", type: "despesa", category: "educacao", description: "Curso de fotografia", cents: 12900 },
    { id: "t12", date: "2026-10-20", type: "receita", category: "freelance", description: "Consultoria criativa", cents: 85000 },
    { id: "t13", date: "2026-10-22", type: "despesa", category: "alimentacao", description: "Mercado", cents: 31420 },
    { id: "t14", date: "2026-10-24", type: "despesa", category: "moradia", description: "Internet", cents: 11990 },
    { id: "t15", date: "2026-10-27", type: "despesa", category: "saude", description: "Academia", cents: 8990 },
    { id: "t16", date: "2026-10-28", type: "despesa", category: "outros-gastos", description: "Itens para casa", cents: 12000 },
    { id: "t17", date: "2026-09-01", type: "receita", category: "salario", description: "Salário mensal", cents: 650000 },
    { id: "t18", date: "2026-09-03", type: "despesa", category: "moradia", description: "Aluguel", cents: 185000 },
    { id: "t19", date: "2026-09-06", type: "despesa", category: "alimentacao", description: "Compras do mês", cents: 68540 },
    { id: "t20", date: "2026-09-10", type: "despesa", category: "moradia", description: "Conta de energia", cents: 15280 },
    { id: "t21", date: "2026-09-14", type: "receita", category: "freelance", description: "Projeto editorial", cents: 98000 },
    { id: "t22", date: "2026-09-19", type: "despesa", category: "educacao", description: "Curso online", cents: 9900 },
    { id: "t23", date: "2026-09-24", type: "despesa", category: "transporte", description: "Passe mensal", cents: 22000 },
    { id: "t24", date: "2026-09-29", type: "despesa", category: "assinaturas", description: "Streaming", cents: 3990 },
    { id: "t25", date: "2026-08-01", type: "receita", category: "salario", description: "Salário mensal", cents: 650000 },
    { id: "t26", date: "2026-08-02", type: "despesa", category: "moradia", description: "Aluguel", cents: 185000 },
    { id: "t27", date: "2026-08-08", type: "despesa", category: "alimentacao", description: "Mercado", cents: 51230 },
    { id: "t28", date: "2026-08-13", type: "despesa", category: "saude", description: "Consulta médica", cents: 22000 },
    { id: "t29", date: "2026-08-22", type: "receita", category: "freelance", description: "Projeto de design", cents: 73000 },
    { id: "t30", date: "2026-08-26", type: "despesa", category: "transporte", description: "Transporte", cents: 15900 }
  ],
  goals: [
    { id: "g01", name: "Reserva de emergência", description: "Tranquilidade para qualquer cenário.", currentCents: 1240000, targetCents: 2000000, due: "2027-06-30", symbol: "✦" },
    { id: "g02", name: "Viagem para o Japão", description: "Uma experiência para lembrar.", currentCents: 860000, targetCents: 1800000, due: "2027-11-30", symbol: "✈" },
    { id: "g03", name: "Novo estúdio", description: "Espaço para o próximo capítulo.", currentCents: 470000, targetCents: 1000000, due: "2027-09-30", symbol: "⌂" }
  ]
};
