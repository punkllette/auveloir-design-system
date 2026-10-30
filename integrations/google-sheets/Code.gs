/** Cole no Apps Script aberto pela planilha em Extensões > Apps Script. */
const SHEET_NAME = 'Contatos';
const HEADERS = ['Recebido em', 'Nome', 'E-mail', 'Telefone', 'Consentimento'];
const NOTIFY_EMAIL = 'mello@auveloir.com';

// Abra a URL /exec sem enviar dados para confirmar que esta versão foi publicada.
function doGet() {
  return HtmlService.createHtmlOutput('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>AUVELOIR — formulário ativo</title><body><h1>Formulário AUVELOIR ativo</h1><p>O envio de contatos usa POST.</p></body></html>');
}

function doPost(request) {
  try {
    const data = request && request.parameter ? request.parameter : {};
    if (data._honey) return responsePage_('Contato recebido.', true);

    const name = clean_(data.name, 120);
    const email = clean_(data.email, 254);
    const phone = clean_(data.telefone, 40);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[+\d\s().-]{8,40}$/.test(phone) || data.consentimento !== 'Sim') {
      return responsePage_('Confira nome, e-mail, telefone e autorização antes de enviar.', false);
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) throw new Error('Abra este script pela planilha em Extensões > Apps Script.');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      let sheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
      const row = sheet.getLastRow() + 1;
      sheet.getRange(row, 4).setNumberFormat('@');
      sheet.getRange(row, 1, 1, 5).setValues([[new Date(), safeCell_(name), safeCell_(email), safeCell_(phone), 'Sim']]);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    // A planilha é a fonte de verdade; falha na notificação não pede reenvio.
    try {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: 'Novo contato pelo portfólio AUVELOIR',
        body: `Nome: ${name}\nE-mail: ${email}\nTelefone: ${phone}\n\nO contato também está na aba ${SHEET_NAME}.`,
        replyTo: email,
      });
    } catch (notificationError) {
      console.error('Contato salvo, mas a notificação falhou:', notificationError);
    }
    return responsePage_('Contato recebido. Obrigado!', true);
  } catch (error) {
    console.error('Não foi possível salvar o contato:', error);
    return responsePage_('Não foi possível enviar agora. Tente novamente ou escreva para mello@auveloir.com.', false);
  }
}

function clean_(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength);
}

function safeCell_(value) {
  // Impede que dados enviados sejam interpretados como fórmulas na planilha.
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function responsePage_(message, success) {
  const title = success ? 'Obrigado pelo contato' : 'Não foi possível enviar';
  return HtmlService.createHtmlOutput(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — AUVELOIR</title><style>body{font:16px/1.6 system-ui,sans-serif;background:#090b10;color:#f0f1f3;min-height:100vh;display:grid;place-items:center;margin:0;padding:1rem}main{max-width:34rem;text-align:center}h1{font-size:clamp(2rem,5vw,3rem)}p{color:#a7adba}a{color:#ff3352}</style></head><body><main><h1>${title}</h1><p>${message}</p><a href="https://www.auveloir.com/">Voltar ao portfólio</a></main></body></html>`).setTitle(title + ' — AUVELOIR');
}
