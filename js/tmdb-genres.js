/* ======================================================
   CineAI — Filtros Reais por Gênero TMDB
   Fase 8.11
====================================================== */

(function () {
  "use strict";

  let lastGenreSignature = "";

  /* ======================================================
     NORMALIZAÇÃO
  ====================================================== */

  function normalizeGenreName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function getCanonicalGenre(value) {
    const normalized =
      normalizeGenreName(value);

    const aliases = {
      "sci-fi":
        "ficcao cientifica",

      "ficcao cientifica":
        "ficcao cientifica",

      "science fiction":
        "ficcao cientifica",

      "thriller":
        "suspense",

      "suspense":
        "suspense"
    };

    return aliases[normalized] ||
      normalized;
  }

  /* ======================================================
     GÊNEROS DE UM ITEM
  ====================================================== */

  function getItemGenres(item) {
    if (!item) {
      return [];
    }

    if (
      Array.isArray(item.genres)
    ) {
      return item.genres
        .filter(Boolean)
        .map(String);
    }

    if (item.genre) {
      return [
        String(item.genre)
      ];
    }

    return [];
  }

  /* ======================================================
     COMPARAÇÃO
  ====================================================== */

  function itemMatchesGenre(
    item,
    genre
  ) {
    if (
      genre === "all"
    ) {
      return true;
    }

    const target =
      getCanonicalGenre(genre);

    return getItemGenres(item)
      .some(
        itemGenre =>
          getCanonicalGenre(
            itemGenre
          ) === target
      );
  }

  /* ======================================================
     COLETA DOS GÊNEROS REAIS
  ====================================================== */

  function collectAvailableGenres() {
    const genreMap =
      new Map();

    const sources = [
      ...(Array.isArray(movies)
        ? movies
        : []),

      ...(Array.isArray(tmdbMovies)
        ? tmdbMovies
        : []),

      ...(Array.isArray(tmdbSeries)
        ? tmdbSeries
        : []),

      ...(Array.isArray(
        tmdbSearchResults
      )
        ? tmdbSearchResults
        : [])
    ];

    sources.forEach(
      item => {
        getItemGenres(item)
          .forEach(
            genre => {
              const canonical =
                getCanonicalGenre(
                  genre
                );

              if (!canonical) {
                return;
              }

              if (
                !genreMap.has(
                  canonical
                )
              ) {
                genreMap.set(
                  canonical,
                  genre
                );
              }
            }
          );
      }
    );

    return Array.from(
      genreMap.entries()
    )
      .map(
        ([canonical, label]) => ({
          canonical,
          label
        })
      )
      .sort(
        (a, b) =>
          a.label.localeCompare(
            b.label,
            "pt-BR"
          )
      );
  }

  /* ======================================================
     BOTÕES DINÂMICOS
  ====================================================== */

  function buildGenreSignature(
    genres
  ) {
    return genres
      .map(
        genre =>
          `${genre.canonical}:${genre.label}`
      )
      .join("|");
  }

  function refreshGenreFilters() {
    if (!genreFilters) {
      return;
    }

    const genres =
      collectAvailableGenres();

    const signature =
      buildGenreSignature(
        genres
      );

    if (
      signature ===
      lastGenreSignature
    ) {
      updateGenreButtons();
      return;
    }

    lastGenreSignature =
      signature;

    const currentCanonical =
      selectedGenre === "all"
        ? "all"
        : getCanonicalGenre(
            selectedGenre
          );

    const genreStillExists =
      currentCanonical ===
        "all" ||
      genres.some(
        genre =>
          genre.canonical ===
          currentCanonical
      );

    if (
      !genreStillExists
    ) {
      selectedGenre =
        "all";
    }

    genreFilters.innerHTML =
      "";

    const allButton =
      document.createElement(
        "button"
      );

    allButton.type =
      "button";

    allButton.className =
      "genre-filter";

    allButton.dataset.genre =
      "all";

    allButton.textContent =
      "Todos";

    genreFilters.appendChild(
      allButton
    );

    genres.forEach(
      genre => {
        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "genre-filter";

        button.dataset.genre =
          genre.label;

        button.textContent =
          genre.label;

        genreFilters.appendChild(
          button
        );
      }
    );

    updateGenreButtons();
  }

  /* ======================================================
     FILTRO LOCAL
  ====================================================== */

  getFilteredLocalMovies =
    function () {
      const term =
        normalizeText(
          searchInput.value.trim()
        );

      return movies.filter(
        item => {
          const text =
            normalizeText(`
              ${item.title}
              ${item.genre}
              ${item.description}
              ${item.year}
            `);

          const matchesSearch =
            !term ||
            text.includes(term);

          const matchesGenre =
            itemMatchesGenre(
              item,
              selectedGenre
            );

          return (
            matchesSearch &&
            matchesGenre
          );
        }
      );
    };

  /* ======================================================
     FILTRO TMDB
  ====================================================== */

  getFilteredTmdbSearchResults =
    function () {
      if (
        selectedGenre ===
        "all"
      ) {
        return tmdbSearchResults;
      }

      return tmdbSearchResults
        .filter(
          item =>
            itemMatchesGenre(
              item,
              selectedGenre
            )
        );
    };

  /* ======================================================
     INTEGRAÇÃO COM RENDER EXISTENTE
  ====================================================== */

  const originalRenderCombined =
    renderCombinedSearchResults;

  renderCombinedSearchResults =
    function (...args) {
      refreshGenreFilters();

      return originalRenderCombined(
        ...args
      );
    };

  const originalRenderFeatured =
    renderFeaturedMovies;

  renderFeaturedMovies =
    function (...args) {
      const result =
        originalRenderFeatured(
          ...args
        );

      refreshGenreFilters();

      return result;
    };

  const originalRenderSeries =
    renderSeries;

  renderSeries =
    function (...args) {
      const result =
        originalRenderSeries(
          ...args
        );

      refreshGenreFilters();

      return result;
    };

  /* ======================================================
     INICIALIZAÇÃO
  ====================================================== */

  refreshGenreFilters();

})();
