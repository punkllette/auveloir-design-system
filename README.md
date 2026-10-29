# MELLO · Estúdio Digital Independente

> **Presença digital à altura do que você faz.**  
> Estúdio independente de design e desenvolvimento web, unindo direção visual autoral, engenharia de front-end nativa e rigor técnico em acessibilidade e performance.

---

## ✦ Visão Geral

Este repositório contém o código-fonte do portfólio autoral e catálogo do **AUVELOIR Design System**, desenvolvido por **Mikael Machado David (Mello)**. O portfólio é uma aplicação Astro; o Nexo fica em um projeto Astro independente na pasta `projects/nexo/`.

A interface foi concebida sob uma estética cinematográfica escura (*Void Black & Deep Surface* com acentos em *Event Red* `#C41632`), combinando tipografia expressiva (*Space Grotesk*, *Inter* e *IBM Plex Mono*), animações fluidas guiadas por scroll e cards interativos com rotação tridimensional (3D tilt) e lanterna radial sensível ao cursor.

---

## ✦ Estrutura do Projeto

```text
auveloir-design-system/
├── astro.config.mjs            # Configuração do portfólio Astro
├── package.json                # Comandos e dependências do portfólio
├── src/pages/index.astro       # Portfólio (Hero, Trajetória, Projetos, Lab, Contato)
├── public/
│   ├── design-system.html      # Catálogo interativo
│   └── assets/
│       ├── components/         # Especificações atômicas de componentes
│       └── overview/           # CSS, fontes e mídias do portfólio
└── projects/nexo/             # Código-fonte independente do Nexo (Astro)
```

---

## ✦ Seções do Portfólio

1. **Hero:** Identificação da marca MELLO, proposta de valor, brasão arquitetônico em SVG e dock de tecnologias (JavaScript, CSS, Python, Power BI).
2. **Trajetória:** Linha do tempo vertical interativa com preenchimento em gradiente vermelho reativo à rolagem, registrando experiências em logística (Amazon First Mile), análise de dados (Shopee) e formação em ADS (Multivix) / fundação da AUVELOIR.
3. **Projetos Selecionados:**
   - **ÉTER — Caneta Inteligente:** Estudo conceitual de produto e landing page cinematográfica (Asimov Academy) — [eter.auveloir.com](https://eter.auveloir.com/).
   - **Nexo — Finanças Pessoais:** Protótipo conceitual com painel financeiro, transações, metas e simulação local de registro por conversa — [nexo.auveloir.com](https://nexo.auveloir.com/).
4. **Laboratório & Experimentos:** Marquee contínuo com 5 iniciativas em Business Intelligence, Vibe Coding, Design de Produto Digital, Qualidade de Dados (ERPNext) e Sistemas Cloud/First Mile.
5. **CTA & Contato:** Canal direto para novos projetos e colaborações digitais.

---

## ✦ Stack Técnica

- **Astro e HTML5 Semântico:** Página do portfólio gerada estaticamente, com a estrutura e interações originais preservadas.
- **CSS3 Nativo Moderno:** CSS Custom Properties (Design Tokens), Flexbox, CSS Grid, Backdrop Filters, Scroll-driven visual state e media query `@media (prefers-reduced-motion: reduce)`.
- **Vanilla JavaScript:** Sem dependências ou frameworks pesados; IntersectionObserver para revelação progressiva e cálculo vetorial de física para o tilt tridimensional dos cards.
- **Ícones:** Lucide Icons & Iconify (Simple Icons).

## ✦ Desenvolvimento e builds

Requer Node.js 22.23.4 ou superior. O portfólio e o Nexo têm builds independentes:

```sh
# Portfólio AUVELOIR
npm ci
npm run dev
npm run build

# Nexo
cd projects/nexo
npm ci
npm run build
```

Depois de instalar as dependências dos dois projetos, `npm run build:all` na raiz gera ambos em sequência.

O build do portfólio sai em `dist/`; o do Nexo, em `projects/nexo/dist/`. Publique cada saída no domínio correspondente. O card do Nexo no portfólio aponta para [nexo.auveloir.com](https://nexo.auveloir.com/). Nenhum dos dois projetos depende da pasta `finelofinance`.

---

## ✦ Autor

**Mikael Machado David**  
- **GitHub:** [@punkllette](https://github.com/punkllette)  
- **LinkedIn:** [mikaelmachadodev](https://www.linkedin.com/in/mikaelmachadodev/)  
- **E-mail:** [machadomikaelpro@gmail.com](mailto:machadomikaelpro@gmail.com)  
- **AUVELOIR:** [auveloir.com](https://eter.auveloir.com/)
