/* ======================================================
   CineAI — Estados de Interface
   Fase 8.13
   Loading • Erro • Vazio • Fallback
====================================================== */

(function () {
  "use strict";

  /* ======================================================
     COMPONENTE DE ESTADO
  ====================================================== */

  function createStatePanel({
    type = "info",
    icon = "🎬",
    title = "",
    message = "",
    compact = false
  }) {
    const panel =
      document.createElement(
        "div"
      );

    panel.className =
      `cineai-state cineai-state--${type}`;

    if (compact) {
      panel.classList.add(
        "cineai-state--compact"
      );
    }

    panel.setAttribute(
      "role",
      type === "error"
        ? "alert"
        : "status"
    );

    panel.setAttribute(
      "aria-live",
      type === "error"
        ? "assertive"
        : "polite"
    );

    panel.innerHTML = `
      <div class="cineai-state__icon">
        ${icon}
      </div>

      <div class="cineai-state__content">

        ${
          title
            ? `
              <strong class="cineai-state__title">
                ${title}
              </strong>
            `
            : ""
        }

        ${
          message
            ? `
              <p class="cineai-state__message">
                ${message}
              </p>
            `
            : ""
        }

      </div>
    `;

    return panel;
  }

  /* ======================================================
     LOADING — FILMES
  ====================================================== */

  renderFeaturedLoading =
    function () {
      if (!featuredMoviesContainer) {
        return;
      }

      featuredMoviesContainer.innerHTML =
        "";

      const state =
        createStatePanel({
          type: "loading",
          icon: "🎬",
          title:
            "Carregando filmes em alta",
          message:
            "Buscando os títulos mais populares no TMDB."
        });

      state.style.gridColumn =
        "1 / -1";

      featuredMoviesContainer
        .appendChild(state);
    };

  /* ======================================================
     LOADING — SÉRIES
  ====================================================== */

  renderSeriesLoading =
    function () {
      if (!seriesGrid) {
        return;
      }

      seriesGrid.innerHTML =
        "";

      const state =
        createStatePanel({
          type: "loading",
          icon: "📺",
          title:
            "Carregando séries populares",
          message:
            "Buscando séries em destaque no TMDB."
        });

      state.style.gridColumn =
        "1 / -1";

      seriesGrid.appendChild(
        state
      );
    };

  /* ======================================================
     FALLBACK — FILMES
  ====================================================== */

  const originalRenderFeaturedFallback =
    renderFeaturedFallback;

  renderFeaturedFallback =
    function () {
      originalRenderFeaturedFallback();

      if (!featuredMoviesContainer) {
        return;
      }

      const warning =
        createStatePanel({
          type: "warning",
          icon: "⚠️",
          title:
            "Catálogo online temporariamente indisponível",
          message:
            "Exibindo títulos locais do CineAI enquanto o TMDB não responde.",
          compact: true
        });

      warning.style.gridColumn =
        "1 / -1";

      featuredMoviesContainer
        .prepend(warning);
    };

  /* ======================================================
     FALLBACK — SÉRIES
  ====================================================== */

  const originalRenderSeriesFallback =
    renderSeriesFallback;

  renderSeriesFallback =
    function () {
      originalRenderSeriesFallback();

      if (!seriesGrid) {
        return;
      }

      const warning =
        createStatePanel({
          type: "warning",
          icon: "⚠️",
          title:
            "Séries online temporariamente indisponíveis",
          message:
            "Exibindo o catálogo local do CineAI como alternativa.",
          compact: true
        });

      warning.style.gridColumn =
        "1 / -1";

      seriesGrid.prepend(
        warning
      );
    };

  /* ======================================================
     LOADING — BUSCA
  ====================================================== */

  const originalRenderSearchLoading =
    renderSearchLoading;

  renderSearchLoading =
    function (localResults) {
      originalRenderSearchLoading(
        localResults
      );

      const oldLoading =
        searchResults.querySelector(
          ".empty-list:last-child"
        );

      if (!oldLoading) {
        return;
      }

      const state =
        createStatePanel({
          type: "loading",
          icon: "🔎",
          title:
            "Pesquisando no TMDB",
          message:
            "Buscando filmes e séries correspondentes."
        });

      oldLoading.replaceWith(
        state
      );
    };

  /* ======================================================
     BUSCA — ERRO E VAZIO
  ====================================================== */

  const originalRenderCombinedSearchResults =
    renderCombinedSearchResults;

  renderCombinedSearchResults =
    function (
      tmdbError = false
    ) {
      originalRenderCombinedSearchResults(
        tmdbError
      );

      if (
        tmdbError &&
        searchResults
      ) {
        const existingError =
          searchResults.querySelector(
            ".cineai-search-error"
          );

        if (!existingError) {
          const error =
            createStatePanel({
              type: "error",
              icon: "⚠️",
              title:
                "Não foi possível consultar o TMDB",
              message:
                "Verifique sua conexão e tente realizar a busca novamente.",
              compact: true
            });

          error.classList.add(
            "cineai-search-error"
          );

          searchResults.prepend(
            error
          );
        }
      }

      const empty =
        searchResults?.querySelector(
          ".search-empty"
        );

      if (
        empty &&
        !tmdbError
      ) {
        empty.classList.add(
          "search-empty--enhanced"
        );

        empty.setAttribute(
          "role",
          "status"
        );

        empty.setAttribute(
          "aria-live",
          "polite"
        );
      }
    };

  /* ======================================================
     MINHA LISTA — VAZIO
  ====================================================== */

  const originalRenderMyList =
    renderMyList;

  renderMyList =
    function (...args) {
      const result =
        originalRenderMyList(
          ...args
        );

      const empty =
        myListSection
          ?.querySelector(
            ".empty-list"
          );

      if (empty) {
        empty.classList.add(
          "cineai-empty-state"
        );

        empty.setAttribute(
          "role",
          "status"
        );

        empty.setAttribute(
          "aria-live",
          "polite"
        );
      }

      return result;
    };

  /* ======================================================
     RECOMENDAÇÕES — ESTADOS
  ====================================================== */

  const originalRenderRecommendations =
    renderRecommendations;

  renderRecommendations =
    function (...args) {
      const result =
        originalRenderRecommendations(
          ...args
        );

      const empty =
        recommendationGrid
          ?.querySelector(
            ".empty-list"
          );

      if (empty) {
        empty.classList.add(
          "cineai-empty-state"
        );

        empty.setAttribute(
          "role",
          "status"
        );

        empty.setAttribute(
          "aria-live",
          "polite"
        );
      }

      return result;
    };

})();
