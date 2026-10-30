# Formulário do portfólio → Google Sheets

1. Crie uma planilha privada na conta Google que receberá os contatos.
2. Na planilha, abra **Extensões → Apps Script**. Substitua o conteúdo de `Code.gs` pelo arquivo desta pasta e salve.
3. Em **Implantar → Nova implantação → Aplicativo da Web**, selecione **Executar como: eu** e **Quem tem acesso: qualquer pessoa**. Autorize o acesso à planilha e ao envio de e-mail. Copie a URL terminada em `/exec`. [Documentação do Google](https://developers.google.com/apps-script/guides/web)
4. A URL `/exec` fornecida para esta implantação está definida diretamente em `src/components/ContactCard.astro`. Gere o build e publique. Se criar uma nova implantação, atualize essa URL no componente. **Não** use a URL `/dev`.
5. Envie um contato de teste pelo site publicado e confirme que ele aparece na aba **Contatos** e que a notificação chega a `mello@auveloir.com`.

Se aparecer **“Função de script não encontrada: doPost”**, a implantação está usando uma versão sem este `Code.gs`. Cole o arquivo completo no projeto **ligado à planilha**, salve e use **Implantar → Gerenciar implantações → Editar → Versão: Nova versão → Implantar**. Confirme que está editando a implantação cuja URL `/exec` está no formulário. Abrir essa URL no navegador deve mostrar **“Formulário AUVELOIR ativo”** depois da atualização; antes disso, a versão correta ainda não foi publicada. Não execute `doPost` pelo botão **Executar** do editor, pois ele exige o evento HTTP fornecido pelo formulário.

O botão envia os dados por POST diretamente ao Apps Script, que valida os campos, grava a planilha e mostra uma confirmação. O Analytics registra apenas a tentativa de envio, sem nome, e-mail ou telefone.

Use uma planilha privada. Quem tiver a URL pública do aplicativo poderá enviar dados; o formulário tem um campo antispam simples e validação, mas pode precisar de proteção adicional se receber abuso.
