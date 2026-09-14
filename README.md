# 🎬 CineAI

**Streaming Experience powered by AI**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TMDB](https://img.shields.io/badge/TMDB-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![AI Assisted](https://img.shields.io/badge/AI-Assisted%20Development-6C63FF?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Concluído-brightgreen?style=for-the-badge)

CineAI é uma aplicação web inspirada em plataformas de streaming, desenvolvida com **HTML, CSS e JavaScript**, com integração à **API do TMDB**, sistema de recomendações, busca dinâmica, favoritos, responsividade, acessibilidade e otimizações de performance.

O projeto foi desenvolvido como uma experiência autoral de portfólio, combinando **Front-End, consumo de API, experiência do usuário, lógica em JavaScript e desenvolvimento assistido por Inteligência Artificial**.

---

## 🌐 Demo

🔗 **Aplicação publicada na Vercel:**  
https://cine-ai.vercel.app

---

## 🚀 Objetivo

O objetivo do CineAI é simular uma experiência moderna de navegação por filmes e séries, aplicando conceitos de desenvolvimento Front-End e integração com serviços externos.

O projeto também explora a utilização de Inteligência Artificial como copiloto durante o processo de desenvolvimento, apoiando atividades de arquitetura, debugging, refatoração, UX/UI e documentação.

---

## ✨ Funcionalidades

### 🎬 Catálogo de filmes e séries

- filmes em destaque;
- séries populares;
- conteúdos carregados dinamicamente;
- dados obtidos através do TMDB.

### 🔎 Busca

- busca por filmes e séries;
- integração com resultados do TMDB;
- busca com debounce;
- paginação de resultados;
- carregamento incremental.

### 🎭 Filtros

- filtros por gênero;
- navegação horizontal em telas menores;
- integração entre filtros e resultados de busca.

### ❤️ Minha Lista

- adicionar filmes e séries aos favoritos;
- remover itens da lista;
- persistência com `localStorage`;
- suporte a conteúdos locais e do TMDB.

### 🤖 Recomendações

- sistema de recomendações baseado nos interesses do usuário;
- análise dos títulos adicionados à Minha Lista;
- priorização de gêneros;
- seleção de conteúdos relevantes.

### ℹ️ Modal de detalhes

- título;
- ano;
- gêneros;
- avaliação;
- sinopse;
- trailer;
- opção de adicionar ou remover da Minha Lista.

### ▶️ Trailers

- integração com vídeos do YouTube;
- seleção automática de trailers oficiais quando disponíveis;
- suporte a trailers em português e inglês.

### 🎠 Hero dinâmico

- carrossel de destaques;
- navegação por setas;
- indicadores;
- autoplay;
- suporte a filmes provenientes do TMDB.

### 📱 Responsividade

Interface validada em diferentes larguras:

- 375 px;
- 430 px;
- 768 px;
- desktop.

Foram testados:

- Hero;
- cards;
- busca;
- filtros;
- modal;
- navegação geral.

### ♿ Acessibilidade

- navegação por teclado;
- foco visível;
- ativação de controles com `Enter`;
- fechamento de modal com `Esc`;
- foco mantido dentro do modal;
- uso de atributos `aria-label`;
- estrutura semântica.

---

## ⚡ Performance

O CineAI passou por otimizações de carregamento e performance.

Resultados registrados no Lighthouse durante a fase de validação:

| Métrica | Resultado |
|---|---:|
| Performance | **98/100** |
| Best Practices | **100/100** |
| SEO | **100/100** |
| First Contentful Paint | **0,9 s** |
| Largest Contentful Paint | **0,9 s** |
| Total Blocking Time | **0 ms** |
| Cumulative Layout Shift | **0,001** |
| Speed Index | **0,9 s** |

Entre as melhorias implementadas:

- redução do tamanho das imagens do TMDB;
- otimização das consultas à API;
- redução de chamadas de trailers;
- cache em endpoints;
- paralelização de requisições;
- melhoria no carregamento inicial;
- prevenção de bloqueios desnecessários na renderização.

---

## 🛠️ Tecnologias

### Front-End

- HTML5
- CSS3
- JavaScript

### APIs e dados

- TMDB API
- Fetch API
- REST

### Backend / Serverless

- Vercel Functions
- JavaScript

### Persistência

- LocalStorage

### Ferramentas

- Git
- GitHub
- Vercel
- Chrome DevTools
- Lighthouse

### Inteligência Artificial

A IA foi utilizada como copiloto durante o desenvolvimento para:

- análise de requisitos;
- arquitetura;
- debugging;
- refatoração;
- testes;
- otimização de performance;
- UX/UI;
- documentação.

---

## 📂 Estrutura do projeto

```text
Cine-AI/
│
├── index.html
├── README.md
│
├── api/
│   └── movies.js
│
├── css/
│   ├── style.css
│   └── ux.css
│
└── js/
    ├── app.js
    ├── details-enhanced.js
    ├── movies.js
    ├── recommendations.js
    ├── search-pagination.js
    ├── tmdb-genres.js
    └── ui-states.js
```

---

## 🔌 Integração com TMDB

O CineAI utiliza a API do **The Movie Database — TMDB** para obter:

- filmes em alta;
- séries populares;
- resultados de busca;
- gêneros;
- posters;
- backdrops;
- avaliações;
- sinopses;
- trailers.

A comunicação é intermediada por uma função serverless hospedada na Vercel.

A chave da API é mantida em variável de ambiente e não é exposta diretamente no Front-End.

---

## 🧠 Sistema de recomendações

O CineAI possui um mecanismo de recomendações que analisa conteúdos salvos pelo usuário e identifica padrões de preferência, principalmente a partir dos gêneros mais frequentes.

Com base nesse perfil, o sistema prioriza títulos compatíveis entre os conteúdos disponíveis.

Esse componente demonstra conceitos de:

- personalização;
- análise de preferências;
- scoring;
- recomendação baseada em conteúdo.

---

## 🧪 Validação

O projeto foi validado em diferentes etapas, incluindo:

- testes funcionais;
- responsividade;
- busca;
- filtros;
- modal;
- Minha Lista;
- Hero;
- navegação por teclado;
- acessibilidade;
- performance;
- Best Practices;
- SEO.

---

## 📚 Origem do projeto

O projeto teve como ponto de partida os conhecimentos desenvolvidos durante a:

**Imersão Front-End na Era da IA — Alura**

A versão atual foi reconstruída, ampliada e evoluída como um projeto autoral de portfólio.

---

## 🎯 Aprendizados

Durante o desenvolvimento do CineAI foram aplicados conhecimentos relacionados a:

- manipulação do DOM;
- eventos em JavaScript;
- consumo de APIs;
- funções assíncronas;
- `fetch`;
- `Promise`;
- `async/await`;
- tratamento de erros;
- persistência local;
- componentização de interface;
- responsividade;
- acessibilidade;
- integração Front-End / API;
- performance web;
- testes com Lighthouse;
- versionamento com Git e GitHub.

---

## 👤 Autor

**Marcus Guedes**

Profissional com experiência em Gestão, Marketing, Operações e Projetos, ampliando sua atuação em **Dados, Inteligência Artificial, Cloud e desenvolvimento de soluções tecnológicas**.

### 🔗 Conecte-se comigo

- **LinkedIn:** [Marcus Guedes](https://www.linkedin.com/in/marcus-guedes/)
- **GitHub:** [MCLG1661](https://github.com/MCLG1661)

---

## 📌 Status

**Projeto concluído. ✅**

O CineAI está publicado, funcional, responsivo e validado como projeto de portfólio.
