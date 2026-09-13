const featuredMoviesContainer = document.getElementById("featuredMovies");
const seriesGrid = document.getElementById("seriesGrid");
const myListSection = document.getElementById("minha-lista");

const searchButton = document.getElementById("searchButton");
const searchPanel = document.getElementById("searchPanel");
const searchInput = document.getElementById("searchInput");
const searchClose = document.getElementById("searchClose");
const searchResults = document.getElementById("searchResults");
const genreFilters = document.getElementById("genreFilters");

const STORAGE_KEY = "cineai-my-list";

let myList = loadMyList();
let selectedGenre = "all";


/* ======================================================
   LOCAL STORAGE
====================================================== */

function loadMyList() {
  try {
    const storedList = localStorage.getItem(STORAGE_KEY);

    if (!storedList) {
      return [];
    }

    const parsedList = JSON.parse(storedList);

    return Array.isArray(parsedList)
      ? parsedList
      : [];
  } catch (error) {
    console.error("Erro ao carregar Minha Lista:", error);

    return [];
  }
}


function saveMyList() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(myList)
  );
}


function isInMyList(movieId) {
  return myList.includes(movieId);
}


function toggleMyList(movieId) {
  if (isInMyList(movieId)) {
    myList = myList.filter(
      id => id !== movieId
    );
  } else {
    myList.push(movieId);
  }

  saveMyList();
  refreshInterface();
}


/* ======================================================
   CRIAÇÃO DOS CARDS
====================================================== */

function createMovieCard(movie) {
  const article = document.createElement("article");
  const saved = isInMyList(movie.id);

  article.classList.add("movie-card");
  article.dataset.id = movie.id;

  article.innerHTML = `
    <div
      class="movie-card__image movie-placeholder"
      style="background: ${movie.posterGradient};"
    >
      <span>${movie.icon}</span>
    </div>

    <div class="movie-card__content">

      <h3>${movie.title}</h3>

      <div class="movie-card__meta">
        <span>${movie.year}</span>
        <span>${movie.genre}</span>
        <span>⭐ ${movie.rating}</span>
      </div>

      <div class="movie-card__actions">

        <button
          class="trailer-button"
          aria-label="Assistir mini trailer de ${movie.title}"
          title="Assistir mini trailer"
          data-trailer="${movie.trailer}"
        >
          ▶
        </button>

        <button
          class="details-button"
          aria-label="Ver mais informações sobre ${movie.title}"
          title="Mais informações"
          data-movie-id="${movie.id}"
        >
          ⓘ
        </button>

        <button
          class="favorite-button ${saved ? "is-saved" : ""}"
          aria-label="${
            saved
              ? `Remover ${movie.title} da Minha Lista`
              : `Adicionar ${movie.title} à Minha Lista`
          }"
          title="${
            saved
              ? "Remover da Minha Lista"
              : "Adicionar à Minha Lista"
          }"
          data-movie-id="${movie.id}"
        >
          ${saved ? "♥" : "♡"}
        </button>

      </div>

    </div>

    <div class="movie-card__trailer">

      <div class="trailer-preview">

        <button
          class="trailer-close"
          aria-label="Fechar trailer"
        >
          ✕
        </button>

        <iframe
          src=""
          title="Trailer de ${movie.title}"
          allow="autoplay; encrypted-media"
          allowfullscreen
        ></iframe>

      </div>

    </div>
  `;

  return article;
}


/* ======================================================
   RENDERIZAÇÃO PRINCIPAL
====================================================== */

function renderFeaturedMovies() {
  if (!featuredMoviesContainer) {
    return;
  }

  const featuredMovies =
    movies.filter(
      movie => movie.featured
    );

  featuredMoviesContainer.innerHTML = "";

  featuredMovies.forEach(movie => {
    featuredMoviesContainer.appendChild(
      createMovieCard(movie)
    );
  });
}


function renderSeries() {
  if (!seriesGrid) {
    return;
  }

  const series =
    movies.filter(
      movie => movie.type === "series"
    );

  seriesGrid.innerHTML = "";

  series.forEach(seriesItem => {
    seriesGrid.appendChild(
      createMovieCard(seriesItem)
    );
  });
}


/* ======================================================
   MINHA LISTA
====================================================== */

function renderMyList() {
  if (!myListSection) {
    return;
  }

  const container =
    myListSection.querySelector(".container");

  if (!container) {
    return;
  }

  const oldContent =
    container.querySelector(
      ".empty-list, .my-list-grid"
    );

  if (oldContent) {
    oldContent.remove();
  }

  const savedMovies =
    movies.filter(movie =>
      myList.includes(movie.id)
    );

  if (savedMovies.length === 0) {
    const emptyState =
      document.createElement("div");

    emptyState.className = "empty-list";

    emptyState.innerHTML = `
      <span>♡</span>

      <p>
        Sua lista ainda está vazia.
      </p>

      <small>
        Clique no coração de um filme ou série
        para adicioná-lo à sua lista.
      </small>
    `;

    container.appendChild(emptyState);

    return;
  }

  const grid =
    document.createElement("div");

  grid.className =
    "movie-grid my-list-grid";

  savedMovies.forEach(movie => {
    grid.appendChild(
      createMovieCard(movie)
    );
  });

  container.appendChild(grid);
}


/* ======================================================
   BUSCA E FILTRO
====================================================== */

function openSearch() {
  searchPanel.classList.add("is-open");
  document.body.classList.add("search-open");

  setTimeout(() => {
    searchInput.focus();
  }, 100);
}


function closeSearch() {
  searchPanel.classList.remove("is-open");
  document.body.classList.remove("search-open");

  searchInput.value = "";
  selectedGenre = "all";

  updateGenreButtons();

  renderSearchResults(movies);
}


function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}


function getFilteredMovies() {
  const searchTerm =
    normalizeText(
      searchInput.value.trim()
    );

  return movies.filter(movie => {
    const searchableText =
      normalizeText(
        `${movie.title} ${movie.genre} ${movie.description}`
      );

    const matchesSearch =
      !searchTerm ||
      searchableText.includes(
        searchTerm
      );

    const matchesGenre =
      selectedGenre === "all" ||
      movie.genre === selectedGenre;

    return (
      matchesSearch &&
      matchesGenre
    );
  });
}


function applySearchAndFilters() {
  const results =
    getFilteredMovies();

  renderSearchResults(results);
}


function renderSearchResults(results) {
  searchResults.innerHTML = "";

  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="search-empty">
        Nenhum título encontrado para os filtros selecionados.
      </div>
    `;

    return;
  }

  const grid =
    document.createElement("div");

  grid.className =
    "movie-grid search-results__grid";

  results.forEach(movie => {
    grid.appendChild(
      createMovieCard(movie)
    );
  });

  searchResults.appendChild(grid);
}


function updateGenreButtons() {
  const buttons =
    document.querySelectorAll(
      ".genre-filter"
    );

  buttons.forEach(button => {
    const genre =
      button.dataset.genre;

    button.classList.toggle(
      "is-active",
      genre === selectedGenre
    );
  });
}


/* ======================================================
   MINI TRAILER
====================================================== */

function openTrailer(
  card,
  trailerUrl
) {
  const trailerLayer =
    card.querySelector(
      ".movie-card__trailer"
    );

  if (!trailerLayer) {
    return;
  }

  const iframe =
    trailerLayer.querySelector(
      "iframe"
    );

  if (!iframe) {
    return;
  }

  iframe.src =
    `${trailerUrl}?autoplay=1&mute=1&rel=0`;

  card.classList.add("is-playing");
}


function closeTrailer(card) {
  const trailerLayer =
    card.querySelector(
      ".movie-card__trailer"
    );

  if (!trailerLayer) {
    return;
  }

  const iframe =
    trailerLayer.querySelector(
      "iframe"
    );

  if (iframe) {
    iframe.src = "";
  }

  card.classList.remove("is-playing");
}


function closeOtherTrailers(
  currentCard
) {
  const openedCards =
    document.querySelectorAll(
      ".movie-card.is-playing"
    );

  openedCards.forEach(card => {
    if (card !== currentCard) {
      closeTrailer(card);
    }
  });
}


/* ======================================================
   MODAL DE DETALHES
====================================================== */

function createDetailsModal() {
  const existingModal =
    document.getElementById(
      "detailsModal"
    );

  if (existingModal) {
    return;
  }

  const modal =
    document.createElement("div");

  modal.classList.add(
    "details-modal"
  );

  modal.id = "detailsModal";

  modal.innerHTML = `
    <div class="details-modal__backdrop"></div>

    <div
      class="details-modal__content"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >

      <button
        class="details-modal__close"
        aria-label="Fechar detalhes"
      >
        ✕
      </button>

      <div class="details-modal__hero">

        <div
          class="details-modal__icon"
          id="modalIcon"
        >
          🎬
        </div>

      </div>

      <div class="details-modal__body">

        <span class="section-label">
          CineAI
        </span>

        <h2 id="modalTitle"></h2>

        <div
          class="details-modal__meta"
          id="modalMeta"
        ></div>

        <p
          class="details-modal__description"
          id="modalDescription"
        ></p>

        <div class="details-modal__buttons">

          <button
            class="button button--primary"
            id="modalTrailerButton"
          >
            ▶ Assistir trailer
          </button>

          <button
            class="button button--secondary"
            id="modalFavoriteButton"
          >
            ♡ Minha Lista
          </button>

        </div>

      </div>

    </div>
  `;

  document.body.appendChild(modal);
}


function openDetailsModal(movie) {
  const modal =
    document.getElementById(
      "detailsModal"
    );

  if (!modal) {
    return;
  }

  const content =
    modal.querySelector(
      ".details-modal__content"
    );

  const icon =
    document.getElementById(
      "modalIcon"
    );

  const title =
    document.getElementById(
      "modalTitle"
    );

  const meta =
    document.getElementById(
      "modalMeta"
    );

  const description =
    document.getElementById(
      "modalDescription"
    );

  const trailerButton =
    document.getElementById(
      "modalTrailerButton"
    );

  const favoriteButton =
    document.getElementById(
      "modalFavoriteButton"
    );

  content.style.background = `
    linear-gradient(
      to bottom,
      transparent 0%,
      rgba(8, 11, 18, 0.95) 38%,
      #080b12 62%
    ),
    ${movie.posterGradient}
  `;

  icon.textContent = movie.icon;
  title.textContent = movie.title;

  meta.innerHTML = `
    <span>${movie.year}</span>
    <span>${movie.genre}</span>
    <span>${movie.duration}</span>
    <span>⭐ ${movie.rating}</span>
  `;

  description.textContent =
    movie.description;

  trailerButton.dataset.trailer =
    movie.trailer;

  favoriteButton.dataset.movieId =
    movie.id;

  updateModalFavoriteButton(
    movie.id
  );

  modal.classList.add("is-open");
  document.body.classList.add("modal-open");
}


function updateModalFavoriteButton(
  movieId
) {
  const favoriteButton =
    document.getElementById(
      "modalFavoriteButton"
    );

  if (!favoriteButton) {
    return;
  }

  const saved =
    isInMyList(movieId);

  favoriteButton.textContent =
    saved
      ? "♥ Na Minha Lista"
      : "♡ Minha Lista";

  favoriteButton.classList.toggle(
    "is-saved",
    saved
  );
}


function closeDetailsModal() {
  const modal =
    document.getElementById(
      "detailsModal"
    );

  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  document.body.classList.remove("modal-open");
}


/* ======================================================
   ATUALIZAÇÃO DA INTERFACE
====================================================== */

function refreshInterface() {
  renderFeaturedMovies();
  renderSeries();
  renderMyList();

  if (
    searchPanel.classList.contains("is-open")
  ) {
    applySearchAndFilters();
  }

  const modalFavoriteButton =
    document.getElementById(
      "modalFavoriteButton"
    );

  if (
    modalFavoriteButton &&
    modalFavoriteButton.dataset.movieId
  ) {
    updateModalFavoriteButton(
      Number(
        modalFavoriteButton.dataset.movieId
      )
    );
  }
}


/* ======================================================
   EVENTOS DE BUSCA
====================================================== */

searchButton.addEventListener(
  "click",
  openSearch
);


searchClose.addEventListener(
  "click",
  closeSearch
);


searchInput.addEventListener(
  "input",
  applySearchAndFilters
);


genreFilters.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest(
        ".genre-filter"
      );

    if (!button) {
      return;
    }

    selectedGenre =
      button.dataset.genre;

    updateGenreButtons();
    applySearchAndFilters();
  }
);


/* ======================================================
   EVENTOS GERAIS
====================================================== */

document.addEventListener(
  "click",
  event => {

    const trailerButton =
      event.target.closest(
        ".trailer-button"
      );

    if (trailerButton) {
      const card =
        trailerButton.closest(
          ".movie-card"
        );

      const trailerUrl =
        trailerButton.dataset.trailer;

      closeOtherTrailers(card);

      openTrailer(
        card,
        trailerUrl
      );

      return;
    }


    const closeTrailerButton =
      event.target.closest(
        ".trailer-close"
      );

    if (closeTrailerButton) {
      const card =
        closeTrailerButton.closest(
          ".movie-card"
        );

      closeTrailer(card);

      return;
    }


    const detailsButton =
      event.target.closest(
        ".details-button"
      );

    if (detailsButton) {
      const movieId =
        Number(
          detailsButton.dataset.movieId
        );

      const movie =
        movies.find(
          item =>
            item.id === movieId
        );

      if (movie) {
        openDetailsModal(movie);
      }

      return;
    }


    const favoriteButton =
      event.target.closest(
        ".favorite-button"
      );

    if (favoriteButton) {
      const movieId =
        Number(
          favoriteButton.dataset.movieId
        );

      toggleMyList(movieId);

      return;
    }


    const modalFavoriteButton =
      event.target.closest(
        "#modalFavoriteButton"
      );

    if (modalFavoriteButton) {
      const movieId =
        Number(
          modalFavoriteButton.dataset.movieId
        );

      toggleMyList(movieId);

      return;
    }


    const modalClose =
      event.target.closest(
        ".details-modal__close"
      );

    const modalBackdrop =
      event.target.closest(
        ".details-modal__backdrop"
      );

    if (
      modalClose ||
      modalBackdrop
    ) {
      closeDetailsModal();

      return;
    }


    const modalTrailerButton =
      event.target.closest(
        "#modalTrailerButton"
      );

    if (modalTrailerButton) {
      const trailerUrl =
        modalTrailerButton.dataset.trailer;

      if (trailerUrl) {
        window.open(
          trailerUrl.replace(
            "/embed/",
            "/watch?v="
          ),
          "_blank",
          "noopener,noreferrer"
        );
      }
    }
  }
);


/* ======================================================
   TECLA ESC
====================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Escape") {
      return;
    }

    const openedCards =
      document.querySelectorAll(
        ".movie-card.is-playing"
      );

    openedCards.forEach(card => {
      closeTrailer(card);
    });

    closeDetailsModal();

    if (
      searchPanel.classList.contains(
        "is-open"
      )
    ) {
      closeSearch();
    }
  }
);


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

createDetailsModal();
refreshInterface();
renderSearchResults(movies);
