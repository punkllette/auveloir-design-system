const PLANILHA_ID = '17WH_LTEGV0sMk0O80scP70twvAN6HcgwybPr6MXLMMo';
const ABA = 'Contatos';

function doGet() {
  return pagina_('O formulário está pronto para receber seu contato.', 'ativo');
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

  return pagina_('Recebi seus dados. Entrarei em contato por e-mail ou telefone para conversar sobre seu projeto.', 'sucesso');
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

function pagina_(mensagem, estado) {
  const sucesso = estado === 'sucesso';
  const ativo = estado === 'ativo';
  const titulo = sucesso ? 'O próximo passo começa aqui.' : ativo ? 'Vamos construir algo extraordinário?' : 'Vamos tentar mais uma vez.';
  const status = sucesso ? 'CONTATO RECEBIDO' : ativo ? 'CANAL DE CONTATO ATIVO' : 'ENVIO NÃO CONCLUÍDO';
  const icone = sucesso ? '<path d="m6 12 4 4 8-8"/>' : ativo ? '<path d="M7 17 17 7M7 7h10v10"/>' : '<path d="M12 7v6M12 17h.01"/>';
  const texto = String(mensagem).replace(/[&<>"']/g, function (caractere) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[caractere];
  });
  return HtmlService.createHtmlOutput(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <base target="_top">
        <title>Contato — AUVELOIR</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
          * { box-sizing: border-box; }
          html { color-scheme: dark; background: #090b10; }
          body { margin: 0; min-height: 100vh; min-height: 100svh; padding: 32px 24px; display: flex; flex-direction: column; align-items: center; color: #f0f1f3; font-family: 'Space Grotesk', Arial, sans-serif; background: radial-gradient(ellipse at 50% 40%, #c4163218, transparent 65%), #090b10; }
          header, footer { width: 100%; max-width: 1120px; display: flex; justify-content: space-between; gap: 20px; align-items: center; }
          .brand { color: #f0f1f3; font-size: 18px; font-weight: 700; letter-spacing: .2em; text-decoration: none; }
          .brand span { color: #ff3352; }
          .detail, footer { color: #a7adba; font-size: 10px; letter-spacing: .15em; line-height: 1.6; }
          main { flex: 1; width: 100%; display: grid; place-items: center; padding: 64px 0; }
          .card { position: relative; width: 100%; max-width: 680px; padding: 56px 48px; text-align: center; border: 1px solid #ffffff14; border-radius: 24px; background: linear-gradient(145deg, #1c202acc, #101218); box-shadow: 0 24px 90px #00000040; }
          .card::before { content: ''; position: absolute; top: -1px; left: 25%; right: 25%; height: 1px; background: linear-gradient(90deg, transparent, #ff3352, transparent); }
          .icon { width: 64px; height: 64px; margin: 0 auto 28px; display: grid; place-items: center; border: 1px solid #ff335240; border-radius: 50%; background: #c4163214; color: #ff3352; }
          .status { color: #ff637b; font-size: 10px; font-weight: 600; letter-spacing: .2em; }
          h1 { margin: 20px 0; font-size: clamp(32px, 5vw, 52px); line-height: 1.08; font-weight: 500; letter-spacing: -.045em; text-wrap: balance; }
          .message { max-width: 440px; margin: 0 auto; color: #a7adba; font-size: 16px; line-height: 1.75; }
          .button { display: inline-flex; justify-content: center; align-items: center; gap: 20px; min-height: 54px; margin-top: 36px; padding: 16px 24px; border: 1px solid #ff335260; border-radius: 10px; background: #c41632; color: #fff; font-size: 14px; font-weight: 600; text-decoration: none; transition: background .2s, transform .2s; }
          .button:hover { background: #e01b3c; transform: translateY(-2px); }
          a:focus-visible { outline: 2px solid #ff637b; outline-offset: 5px; }
          .signature { margin: 28px 0 0; color: #a7adba; font-size: 12px; }
          footer { padding-top: 20px; border-top: 1px solid #ffffff12; }
          footer a { color: #a7adba; text-decoration: none; letter-spacing: 0; }
          @media (max-width: 540px) { body { padding: 24px 16px; } .detail { display: none; } main { padding: 40px 0; } .card { padding: 40px 24px; } .button { width: 100%; } footer { flex-direction: column; align-items: flex-start; gap: 8px; } }
          @media (prefers-reduced-motion: reduce) { .button { transition: none; } .button:hover { transform: none; } }
        </style>
      </head>
      <body>
        <header><a class="brand" href="https://www.auveloir.com/">AUVELOIR<span>.</span></a><span class="detail">DIREÇÃO CRIATIVA &amp; TECNOLOGIA</span></header>
        <main><section class="card" aria-labelledby="title">
          <div class="icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icone}</svg></div>
          <div class="status">${status}</div>
          <h1 id="title">${titulo}</h1>
          <p class="message">${texto}</p>
          <a class="button" href="https://www.auveloir.com/">Voltar ao portfólio <span aria-hidden="true">↗</span></a>
          <p class="signature">${sucesso ? 'Obrigado pela confiança. Até breve.' : 'Sua próxima ideia merece uma boa conversa.'}</p>
        </section></main>
        <footer><span>AUVELOIR · IDEIAS QUE GANHAM FORMA.</span><a href="mailto:mello@auveloir.com">mello@auveloir.com</a></footer>
      </body>
    </html>
  `).setTitle('Contato — AUVELOIR').addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
