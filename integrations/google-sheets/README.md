# Formulário do portfólio → Google Sheets

1. Crie uma planilha privada na conta Google que receberá os contatos.
2. Na planilha, abra **Extensões → Apps Script**. Substitua o conteúdo de `Code.gs` pelo arquivo desta pasta e salve.
3. Em **Implantar → Nova implantação → Aplicativo da Web**, selecione **Executar como: eu** e **Quem tem acesso: qualquer pessoa**. Autorize o acesso à planilha e ao envio de e-mail. Copie a URL terminada em `/exec`. [Documentação do Google](https://developers.google.com/apps-script/guides/web)
4. Atualize a implantação existente em **Implantar → Gerenciar implantações → Editar → Nova versão → Implantar**. O Apps Script precisa responder com JSON `{ok:true,saved:true,submissionId:"..."}` após gravar a linha. A versão antiga responde HTML e não pode comprovar o salvamento para a nova interface.
5. A mesma URL `/exec` está em `src/components/ContactCard.astro` (retorno sem JavaScript) e `api/contact.js` (envio normal pelo site). Se criar outra implantação, atualize as duas URLs. Não use `/dev`.
6. O novo fluxo fica **desativado por padrão**. Para testá-lo em uma implantação de prévia, configure `PUBLIC_CONTACT_INLINE_CONFIRMATION=true` apenas no ambiente Preview da Vercel e gere uma nova prévia. Não configure essa variável em Production ainda. Na prévia, envie um contato de teste e confirme a mensagem na própria página, uma única linha na aba **Contatos** e a notificação em `mello@auveloir.com`.
7. Depois de validar a prévia, configure a mesma variável em Production e publique uma nova versão. Sem essa variável, o formulário continua usando o POST direto existente.

Se aparecer **“Função de script não encontrada: doPost”**, a implantação está usando uma versão sem este `Code.gs`. Cole o arquivo completo no projeto **ligado à planilha**, salve e use **Implantar → Gerenciar implantações → Editar → Versão: Nova versão → Implantar**. Confirme que está editando a implantação cuja URL `/exec` está no formulário. Abrir essa URL no navegador deve mostrar **“Formulário AUVELOIR ativo”** depois da atualização; antes disso, a versão correta ainda não foi publicada. Não execute `doPost` pelo botão **Executar** do editor, pois ele exige o evento HTTP fornecido pelo formulário.

Com JavaScript, o botão envia os dados para `/api/contact` no próprio domínio. A função consulta o Apps Script e só confirma o sucesso quando recebe o ID do envio após a gravação na planilha. Se houver falha de rede, o mesmo ID é reutilizado na tentativa seguinte para evitar linhas duplicadas. Sem JavaScript, o formulário mantém o envio direto ao Apps Script como alternativa. O Analytics não recebe nome, e-mail ou telefone.

Use uma planilha privada. Quem tiver a URL pública do aplicativo poderá enviar dados; o formulário tem um campo antispam simples e validação, mas pode precisar de proteção adicional se receber abuso.
