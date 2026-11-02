const PLANILHA_ID = '17WH_LTEGV0sMk0O80scP70twvAN6HcgwybPr6MXLMMo';
const ABA = 'Contatos';

function doGet() {
  return pagina_('Formulário ativo — versão com quatro colunas.');
}

function doPost(e) {
  const dados = e && e.parameter ? e.parameter : {};

  if (dados._honey) {
    return pagina_('Não foi possível enviar.');
  }

  const nome = limpar_(dados.name, 120);
  const email = limpar_(dados.email, 254);
  const telefone = limpar_(dados.telefone, 40);

  if (
    !nome ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^[+\d\s().-]+$/.test(telefone) ||
    telefone.replace(/\D/g, '').length < 8
  ) {
    return pagina_('Confira nome, e-mail e telefone e tente novamente.');
  }

  const trava = LockService.getScriptLock();

  try {
    trava.waitLock(10000);

    const planilha = SpreadsheetApp.openById(PLANILHA_ID);
    let aba = planilha.getSheetByName(ABA);

    if (!aba) {
      aba = planilha.insertSheet(ABA);
    }

    aba.getRange(1, 1, 1, 4).setValues([
      ['Data', 'Nome', 'E-mail', 'Telefone']
    ]);

    const linha = aba.getLastRow() + 1;

    aba.getRange(linha, 2, 1, 3).setNumberFormat('@');
    aba.getRange(linha, 1, 1, 4).setValues([[
      new Date(),
      proteger_(nome),
      proteger_(email),
      proteger_(telefone)
    ]]);

    aba.getRange(linha, 1).setNumberFormat('dd/MM/yyyy HH:mm');
    SpreadsheetApp.flush();

  } catch (erro) {
    console.error(erro);
    return pagina_(
      'Não foi possível confirmar o envio. Entre em contato pelo e-mail mello@auveloir.com.'
    );
  } finally {
    if (trava.hasLock()) {
      trava.releaseLock();
    }
  }

  return pagina_('Contato salvo. Obrigado! Entrarei em contato.');
}

function limpar_(valor, limite) {
  return String(valor || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, limite);
}

function proteger_(valor) {
  return /^[=+\-@]/.test(valor) ? "'" + valor : valor;
}

function pagina_(mensagem) {
  return HtmlService.createHtmlOutput(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Contato — AUVELOIR</title>
      </head>
      <body style="font-family:Arial,sans-serif;padding:40px;text-align:center">
        <h1>${mensagem}</h1>
        <a href="https://www.auveloir.com/">Voltar ao portfólio</a>
      </body>
    </html>
  `);
}
