# Nexo

Protótipo de finanças pessoais da **Auveloir**, feito com Astro. Reúne visão financeira, transações, metas, um assistente de registro simulado e uma página de planos com captura de interesse.

## Executar localmente

Requer Node.js 22.23.4 ou superior.

```sh
npm ci
npm run dev
```

Para gerar a versão estática:

```sh
npm run build
npm run preview
```

No ambiente de desenvolvimento deste projeto, inicie o servidor em segundo plano com `astro dev --background` e gerencie-o com `astro dev status`, `astro dev logs` e `astro dev stop`.

## Como usar o protótipo

- Abra `/` para explorar o painel, registrar transações e acompanhar metas.
- Use **Meus dados** para personalizar os dados locais, exportá-los ou começar de novo.
- Abra `/planos` para comparar os preços ilustrativos e registrar um interesse local.

Os dados editados são salvos no `localStorage` do navegador em uso. A exportação permite guardar uma cópia antes de limpar o navegador ou trocar de dispositivo. Não há conta, sincronização, pagamento, envio de dados financeiros nem reserva de vaga. O assistente e os preços são demonstrativos.

## Estrutura

- `src/pages/`: painel e página de planos.
- `src/components/`: elementos compartilhados.
- `src/styles/` e `src/scripts/`: estilos e interações do Astro.
- `nexo-financas-prototipo/`: base original do painel e lógica de dados, ainda usada pela versão Astro.
- `public/`: favicon e arquivos públicos.

## Aviso

Este é um **protótipo**, não um serviço financeiro operacional. Não use dados sensíveis reais. A interface informa o funcionamento local dos dados e apresenta uma orientação de privacidade pelos princípios da LGPD; isso não substitui uma revisão jurídica antes de um lançamento público.
