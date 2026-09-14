<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="description"
    content="CineAI - Uma experiência de streaming desenvolvida com HTML, CSS, JavaScript e Inteligência Artificial."
  >

  <title>
    CineAI | Streaming Experience powered by AI
  </title>

  <!-- Performance -->
  <link
    rel="preconnect"
    href="https://image.tmdb.org"
    crossorigin
  >

  <link
    rel="preconnect"
    href="https://fonts.googleapis.com"
  >

  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin
  >

  <!-- Fonte carregada sem bloquear a primeira renderização -->
  <link
    rel="preload"
    as="style"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
    onload="this.onload=null;this.rel='stylesheet'"
  >

  <noscript>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
    >
  </noscript>

  <link
    rel="stylesheet"
    href="css/style.css"
  >

  <link
    rel="stylesheet"
    href="css/ux.css"
  >
</head>

<body>

  <header class="header">

    <div class="container header__content">

      <a
        href="#inicio"
        class="logo"
        aria-label="CineAI - Página inicial"
      >
        Cine<span>AI</span>
      </a>

      <nav
        class="navigation"
        aria-label="Navegação principal"
      >

        <a href="#inicio">
          Início
        </a>

        <a href="#filmes">
          Filmes
        </a>

        <a href="#series">
          Séries
        </a>

        <a href="#recomendados">
          Recomendados
        </a>

        <a href="#minha-lista">
          Minha Lista
        </a>

      </nav>

      <div class="header__actions">

        <button
          class="search-button"
          id="searchButton"
          aria-label="Pesquisar filmes e séries"
        >
          🔍
        </button>

        <div class="profile">
          <span>MG</span>
        </div>

      </div>

    </div>

  </header>


  <div
    class="search-panel"
    id="searchPanel"
  >

    <div
      class="container search-panel__content"
    >

      <div class="search-field">

        <span class="search-field__icon">
          🔍
        </span>

        <input
          type="search"
          id="searchInput"
          placeholder="Buscar filmes ou séries..."
          autocomplete="off"
          aria-label="Buscar filmes ou séries"
        >

        <button
          class="search-close"
          id="searchClose"
          aria-label="Fechar busca"
        >
          ✕
        </button>

      </div>

      <div
        class="genre-filters"
        id="genreFilters"
        aria-label="Filtros por gênero"
      >

        <button
          class="genre-filter is-active"
          data-genre="all"
        >
          Todos
        </button>

      </div>

      <div
        class="search-results"
        id="searchResults"
      ></div>

    </div>

  </div>


  <main>

    <section
      class="hero"
      id="inicio"
    >

      <div class="hero__overlay"></div>

      <div class="container hero__content">

        <span
          class="hero__badge"
          id="heroBadge"
        >
          Destaque CineAI
        </span>

        <h1 id="heroTitle">
          CineAI
        </h1>

        <div
          class="hero__meta"
          id="heroMeta"
        ></div>

        <p id="heroDescription">
          Descubra sua próxima história favorita.
        </p>

        <div class="hero__buttons">

          <button
            class="button button--primary"
            id="heroTrailerButton"
          >
            ▶ Assistir
          </button>

          <button
            class="button button--secondary"
            id="heroDetailsButton"
          >
            ⓘ Mais informações
          </button>

        </div>

        <div
          class="hero-carousel"
          aria-label="Controles dos destaques"
        >

          <button
            class="hero-carousel__arrow"
            id="heroPrevious"
            aria-label="Destaque anterior"
          >
            ←
          </button>

          <div
            class="hero-carousel__indicators"
            id="heroIndicators"
          ></div>

          <button
            class="hero-carousel__arrow"
            id="heroNext"
            aria-label="Próximo destaque"
          >
            →
          </button>

        </div>

      </div>

    </section>


    <section
      class="catalog"
      id="filmes"
    >

      <div class="container">

        <div class="section-header">

          <div>

            <span class="section-label">
              CineAI recomenda
            </span>

            <h2>
              Em destaque
            </h2>

          </div>

        </div>

        <div
          class="movie-grid"
          id="featuredMovies"
        ></div>

      </div>

    </section>


    <section
      class="catalog"
      id="series"
    >

      <div class="container">

        <div class="section-header">

          <div>

            <span class="section-label">
              Para maratonar
            </span>

            <h2>
              Séries populares
            </h2>

          </div>

        </div>

        <div
          class="movie-grid"
          id="seriesGrid"
        ></div>

      </div>

    </section>


    <section
      class="catalog"
      id="recomendados"
    >

      <div class="container">

        <div class="section-header">

          <div>

            <span class="section-label">
              Seleção personalizada
            </span>

            <h2>
              Recomendados para você
            </h2>

            <p id="recommendationReason">
              Analisando seus interesses...
            </p>

          </div>

        </div>

        <div
          class="movie-grid"
          id="recommendationGrid"
        ></div>

      </div>

    </section>


    <section
      class="catalog"
      id="minha-lista"
    >

      <div class="container">

        <div class="section-header">

          <div>

            <span class="section-label">
              Seus favoritos
            </span>

            <h2>
              Minha Lista
            </h2>

          </div>

        </div>

        <div class="empty-list">

          <span>
            ♡
          </span>

          <p>
            Sua lista ainda está vazia.
          </p>

          <small>
            Clique no coração de um filme ou série
            para adicioná-lo à sua lista.
          </small>

        </div>

      </div>

    </section>

  </main>


  <footer class="footer">

    <div class="container">

      <div class="footer__logo">
        Cine<span>AI</span>
      </div>

      <p>
        Projeto desenvolvido por Marcus Guedes.
      </p>

      <p class="footer__technology">
        HTML • CSS • JavaScript • API • TMDB • Inteligência Artificial
      </p>

      <div
        class="footer__credits"
        aria-label="Créditos de dados"
      >

        <p>
          Dados e imagens de filmes fornecidos por

          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            TMDB — The Movie Database
          </a>.
        </p>

        <p>
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>

      </div>

    </div>

  </footer>


  <script src="js/movies.js"></script>

  <script src="js/recommendations.js"></script>

  <script src="js/app.js"></script>


  <!--
    PERFORMANCE 8.16

    Evita substituir o Hero inicial durante
    o primeiro carregamento da página.

    O Hero vindo do TMDB é ativado somente
    quando o usuário interage com o carrossel.

    Isso evita que uma imagem externa tardia
    se transforme no LCP da página.
  -->

  <script>
    (() => {

      if (
        typeof window.initializeTmdbHero !== "function"
      ) {
        return;
      }

      const originalInitializeTmdbHero =
        window.initializeTmdbHero;

      let tmdbHeroAvailable =
        false;

      window.initializeTmdbHero =
        function () {

          tmdbHeroAvailable =
            true;

        };


      function activateTmdbHero() {

        if (
          !tmdbHeroAvailable
        ) {
          return;
        }

        tmdbHeroAvailable =
          false;

        window.initializeTmdbHero =
          originalInitializeTmdbHero;

        originalInitializeTmdbHero();

      }


      const heroNext =
        document.getElementById(
          "heroNext"
        );

      const heroPrevious =
        document.getElementById(
          "heroPrevious"
        );

      const heroIndicators =
        document.getElementById(
          "heroIndicators"
        );


      heroNext?.addEventListener(
        "click",
        activateTmdbHero,
        {
          once: true,
          capture: true
        }
      );


      heroPrevious?.addEventListener(
        "click",
        activateTmdbHero,
        {
          once: true,
          capture: true
        }
      );


      heroIndicators?.addEventListener(
        "click",
        activateTmdbHero,
        {
          once: true,
          capture: true
        }
      );

    })();
  </script>


  <script src="js/tmdb-genres.js"></script>

  <script src="js/details-enhanced.js"></script>

  <script src="js/ui-states.js"></script>

  <script src="js/search-pagination.js"></script>

</body>
</html>
