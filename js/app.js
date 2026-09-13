const featuredMoviesContainer =
  document.getElementById("featuredMovies");

const seriesGrid =
  document.getElementById("seriesGrid");

const myListSection =
  document.getElementById("minha-lista");


/* ======================================================
   HERO
====================================================== */

const hero =
  document.getElementById("inicio");

const heroBadge =
  document.getElementById("heroBadge");

const heroTitle =
  document.getElementById("heroTitle");

const heroMeta =
  document.getElementById("heroMeta");

const heroDescription =
  document.getElementById("heroDescription");

const heroTrailerButton =
  document.getElementById("heroTrailerButton");

const heroDetailsButton =
  document.getElementById("heroDetailsButton");

const heroPrevious =
  document.getElementById("heroPrevious");

const heroNext =
  document.getElementById("heroNext");

const heroIndicators =
  document.getElementById("heroIndicators");


/* ======================================================
   BUSCA
====================================================== */

const searchButton =
  document.getElementById("searchButton");

const searchPanel =
  document.getElementById("searchPanel");

const searchInput =
  document.getElementById("searchInput");

const searchClose =
  document.getElementById("searchClose");

const searchResults =
  document.getElementById("searchResults");

const genreFilters =
  document.getElementById("genreFilters");


/* ======================================================
   ESTADO
====================================================== */

const STORAGE_KEY =
  "cineai-my-list";

const HERO_INTERVAL =
  7000;

let myList =
  loadMyList();

let selectedGenre =
  "all";

let heroMovies =
  [];

let currentHeroIndex =
  0;

let heroTimer =
  null;


/* ======================================================
   LOCAL STORAGE
====================================================== */

function loadMyList() {
  try {

    const storedList =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!storedList) {
      return [];
    }

    const parsedList =
      JSON.parse(storedList);

    return Array.isArray(parsedList)
      ? parsedList
      : [];

  } catch (error) {

    console.error(
      "Erro ao carregar Minha Lista:",
      error
    );

    return [];
  }
}


function saveMyList() {
  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(myList)
    );

  } catch (error) {

    console.error(
      "Erro ao salvar Minha Lista:",
      error
    );
  }
}


function isInMyList(movieId) {
  return myList.includes(
    movieId
  );
}


function toggleMyList(movieId) {

  if (isInMyList(movieId)) {

    myList =
      myList.filter(
        id =>
          id !== movieId
      );

  } else {

    myList.push(
      movieId
    );
  }

  saveMyList();

  refreshInterface();
}


/* ======================================================
   UTILITÁRIOS
====================================================== */

function getTypeLabel(movie) {

  return movie.type === "series"
    ? "Série"
    : "Filme";
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


/* ======================================================
   HERO CAROUSEL
====================================================== */

function initializeHero() {

  heroMovies =
    movies.filter(
      movie =>
        movie.featured
    );

  if (
    heroMovies.length === 0
  ) {

    heroMovies =
      movies.slice(0, 4);
  }

  renderHeroIndicators();

  renderHero();

  startHeroAutoplay();
}


function getCurrentHeroMovie() {

  return (
    heroMovies[
      currentHeroIndex
    ] ||
    null
  );
}


function renderHero() {

  const movie =
    getCurrentHeroMovie();

  if (
    !movie ||
    !hero
  ) {
    return;
  }


  hero.classList.remove(
    "hero--changing"
  );

  void hero.offsetWidth;

  hero.classList.add(
    "hero--changing"
  );


  hero.style.background = `
    linear-gradient(
      to right,
      rgba(8, 11, 18, 0.98) 5%,
      rgba(8, 11, 18, 0.84) 44%,
      rgba(8, 11, 18, 0.34) 74%,
      rgba(8, 11, 18, 0.82) 100%
    ),
    ${movie.posterGradient}
  `;


  if (heroBadge) {

    heroBadge.textContent =
      `${getTypeLabel(movie)} em destaque`;
  }


  if (heroTitle) {

    heroTitle.textContent =
      movie.title;
  }


  if (heroMeta) {

    heroMeta.innerHTML = `
      <span>
        ${movie.year}
      </span>

      <span>
        ${movie.genre}
      </span>

      <span>
        ${movie.duration}
      </span>

      <span>
        ⭐ ${movie.rating}
      </span>
    `;
  }


  if (heroDescription) {

    heroDescription.textContent =
      movie.description;
  }


  if (heroTrailerButton) {

    heroTrailerButton.dataset.trailer =
      movie.trailer;
  }


  if (heroDetailsButton) {

    heroDetailsButton.dataset.movieId =
      movie.id;
  }


  updateHeroIndicators();
}


function renderHeroIndicators() {

  if (!heroIndicators) {
    return;
  }

  heroIndicators.innerHTML =
    "";

  heroMovies.forEach(
    (movie, index) => {

      const button =
        document.createElement(
          "button"
        );

      button.className =
        "hero-carousel__indicator";

      button.dataset.index =
        index;

      button.setAttribute(
        "aria-label",
        `Mostrar ${movie.title}`
      );

      heroIndicators.appendChild(
        button
      );
    }
  );
}


function updateHeroIndicators() {

  const indicators =
    document.querySelectorAll(
      ".hero-carousel__indicator"
    );

  indicators.forEach(
    (indicator, index) => {

      indicator.classList.toggle(
        "is-active",
        index ===
          currentHeroIndex
      );
    }
  );
}


function showNextHero() {

  if (
    heroMovies.length === 0
  ) {
    return;
  }

  currentHeroIndex =
    (
      currentHeroIndex + 1
    ) %
    heroMovies.length;

  renderHero();
}


function showPreviousHero() {

  if (
    heroMovies.length === 0
  ) {
    return;
  }

  currentHeroIndex =
    (
      currentHeroIndex -
      1 +
      heroMovies.length
    ) %
    heroMovies.length;

  renderHero();
}


function goToHero(index) {

  if (
    index < 0 ||
    index >= heroMovies.length
  ) {
    return;
  }

  currentHeroIndex =
    index;

  renderHero();

  restartHeroAutoplay();
}


function startHeroAutoplay() {

  stopHeroAutoplay();

  if (
    heroMovies.length <= 1
  ) {
    return;
  }

  heroTimer =
    setInterval(
      showNextHero,
      HERO_INTERVAL
    );
}


function stopHeroAutoplay() {

  if (heroTimer) {

    clearInterval(
      heroTimer
    );

    heroTimer =
      null;
  }
}


function restartHeroAutoplay() {

  stopHeroAutoplay();

  startHeroAutoplay();
}


function openHeroTrailer() {

  const movie =
    getCurrentHeroMovie();

  if (
    !movie ||
    !movie.trailer
  ) {
    return;
  }

  const trailerUrl =
    movie.trailer.replace(
      "/embed/",
      "/watch?v="
    );

  window.open(
    trailerUrl,
    "_blank",
    "noopener,noreferrer"
  );
}


/* ======================================================
   CRIAÇÃO DOS CARDS
====================================================== */

function createMovieCard(movie) {

  const article =
    document.createElement(
      "article"
    );

  const saved =
    isInMyList(
      movie.id
    );

  const typeLabel =
    getTypeLabel(
      movie
    );

  article.classList.add(
    "movie-card"
  );

  article.dataset.id =
    movie.id;


  article.innerHTML = `
    <div
      class="movie-card__poster"
      style="background: ${movie.posterGradient};"
    >

      <div
        class="movie-card__poster-effects"
      ></div>


      <div
        class="movie-card__poster-top"
      >

        <span
          class="movie-type-badge"
        >
          ${typeLabel}
        </span>

        <span
          class="movie-rating-badge"
        >
          ★ ${movie.rating}
        </span>

      </div>


      <div
        class="movie-card__poster-center"
      >

        <span
          class="movie-card__icon"
        >
          ${movie.icon}
        </span>

      </div>


      <div
        class="movie-card__poster-bottom"
      >

        <span
          class="movie-card__year"
        >
          ${movie.year}
        </span>

        <h3
          class="movie-card__poster-title"
        >
          ${movie.title}
        </h3>

        <span
          class="movie-card__poster-genre"
        >
          ${movie.genre}
        </span>

      </div>

    </div>


    <div
      class="movie-card__content"
    >

      <div
        class="movie-card__info"
      >

        <h3>
          ${movie.title}
        </h3>


        <div
          class="movie-card__meta"
        >

          <span>
            ${movie.year}
          </span>

          <span>
            ${movie.genre}
          </span>

          <span>
            ${movie.duration}
          </span>

        </div>

      </div>


      <div
        class="movie-card__actions"
      >

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


    <div
      class="movie-card__trailer"
    >

      <div
        class="trailer-preview"
      >

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
   FILMES
====================================================== */

function renderFeaturedMovies() {

  if (
    !featuredMoviesContainer
  ) {
    return;
  }

  const featuredMovies =
    movies.filter(
      movie =>
        movie.featured
    );

  featuredMoviesContainer.innerHTML =
    "";

  featuredMovies.forEach(
    movie => {

      featuredMoviesContainer
        .appendChild(
          createMovieCard(
            movie
          )
        );
    }
  );
}


/* ======================================================
   SÉRIES
====================================================== */

function renderSeries() {

  if (!seriesGrid) {
    return;
  }

  const series =
    movies.filter(
      movie =>
        movie.type === "series"
    );

  seriesGrid.innerHTML =
    "";

  series.forEach(
    seriesItem => {

      seriesGrid.appendChild(
        createMovieCard(
          seriesItem
        )
      );
    }
  );
}


/* ======================================================
   MINHA LISTA
====================================================== */

function renderMyList() {

  if (!myListSection) {
    return;
  }

  const container =
    myListSection.querySelector(
      ".container"
    );

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
    movies.filter(
      movie =>
        myList.includes(
          movie.id
        )
    );


  if (
    savedMovies.length === 0
  ) {

    const emptyState =
      document.createElement(
        "div"
      );

    emptyState.className =
      "empty-list";

    emptyState.innerHTML = `
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
    `;

    container.appendChild(
      emptyState
    );

    return;
  }


  const grid =
    document.createElement(
      "div"
    );

  grid.className =
    "movie-grid my-list-grid";


  savedMovies.forEach(
    movie => {

      grid.appendChild(
        createMovieCard(
          movie
        )
      );
    }
  );


  container.appendChild(
    grid
  );
}


/* ======================================================
   BUSCA
====================================================== */

function openSearch() {

  if (!searchPanel) {
    return;
  }

  searchPanel.classList.add(
    "is-open"
  );

  document.body.classList.add(
    "search-open"
  );

  stopHeroAutoplay();

  applySearchAndFilters();


  setTimeout(
    () => {

      searchInput?.focus();

    },
    100
  );
}


function closeSearch() {

  if (!searchPanel) {
    return;
  }

  searchPanel.classList.remove(
    "is-open"
  );

  document.body.classList.remove(
    "search-open"
  );


  if (searchInput) {

    searchInput.value =
      "";
  }


  selectedGenre =
    "all";

  updateGenreButtons();

  renderSearchResults(
    movies
  );

  startHeroAutoplay();
}


/* ======================================================
   FILTROS
====================================================== */

function getFilteredMovies() {

  const searchTerm =
    normalizeText(
      searchInput?.value.trim() ||
      ""
    );


  return movies.filter(
    movie => {

      const searchableText =
        normalizeText(
          `
          ${movie.title}
          ${movie.genre}
          ${movie.description}
          ${movie.year}
          ${getTypeLabel(movie)}
          `
        );


      const matchesSearch =
        !searchTerm ||
        searchableText.includes(
          searchTerm
        );


      const matchesGenre =
        selectedGenre === "all" ||
        movie.genre ===
          selectedGenre;


      return (
        matchesSearch &&
        matchesGenre
      );
    }
  );
}


function applySearchAndFilters() {

  const results =
    getFilteredMovies();

  renderSearchResults(
    results
  );
}


function renderSearchResults(
  results
) {

  if (!searchResults) {
    return;
  }

  searchResults.innerHTML =
    "";


  if (
    results.length === 0
  ) {

    searchResults.innerHTML = `
      <div class="search-empty">

        <span
          class="search-empty__icon"
        >
          🎬
        </span>

        <strong>
          Nenhum título encontrado
        </strong>

        <p>
          Tente outro termo ou selecione
          um gênero diferente.
        </p>

      </div>
    `;

    return;
  }


  const resultHeader =
    document.createElement(
      "div"
    );

  resultHeader.className =
    "search-results__header";


  resultHeader.innerHTML = `
    <span>

      ${results.length}

      ${
        results.length === 1
          ? "título encontrado"
          : "títulos encontrados"
      }

    </span>
  `;


  searchResults.appendChild(
    resultHeader
  );


  const grid =
    document.createElement(
      "div"
    );

  grid.className =
    "movie-grid search-results__grid";


  results.forEach(
    movie => {

      grid.appendChild(
        createMovieCard(
          movie
        )
      );
    }
  );


  searchResults.appendChild(
    grid
  );
}


function updateGenreButtons() {

  const buttons =
    document.querySelectorAll(
      ".genre-filter"
    );


  buttons.forEach(
    button => {

      const genre =
        button.dataset.genre;

      button.classList.toggle(
        "is-active",
        genre ===
          selectedGenre
      );
    }
  );
}


/* ======================================================
   MINI TRAILER
====================================================== */

function openTrailer(
  card,
  trailerUrl
) {

  if (
    !card ||
    !trailerUrl
  ) {
    return;
  }


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


  card.classList.add(
    "is-playing"
  );
}


function closeTrailer(card) {

  if (!card) {
    return;
  }


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


  card.classList.remove(
    "is-playing"
  );
}


function closeOtherTrailers(
  currentCard
) {

  const openedCards =
    document.querySelectorAll(
      ".movie-card.is-playing"
    );


  openedCards.forEach(
    card => {

      if (
        card !== currentCard
      ) {

        closeTrailer(
          card
        );
      }
    }
  );
}


/* ======================================================
   MODAL
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
    document.createElement(
      "div"
    );


  modal.classList.add(
    "details-modal"
  );

  modal.id =
    "detailsModal";


  modal.innerHTML = `
    <div
      class="details-modal__backdrop"
    ></div>


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


      <div
        class="details-modal__hero"
      >

        <div
          class="details-modal__poster-overlay"
        ></div>


        <div
          class="details-modal__hero-content"
        >

          <span
            class="details-modal__type"
            id="modalType"
          >
            Filme
          </span>


          <div
            class="details-modal__icon"
            id="modalIcon"
          >
            🎬
          </div>


          <span
            class="details-modal__hero-title"
            id="modalHeroTitle"
          ></span>

        </div>

      </div>


      <div
        class="details-modal__body"
      >

        <span
          class="section-label"
        >
          CineAI
        </span>


        <h2
          id="modalTitle"
        ></h2>


        <div
          class="details-modal__meta"
          id="modalMeta"
        ></div>


        <p
          class="details-modal__description"
          id="modalDescription"
        ></p>


        <div
          class="details-modal__buttons"
        >

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


  document.body.appendChild(
    modal
  );
}


function openDetailsModal(movie) {

  const modal =
    document.getElementById(
      "detailsModal"
    );


  if (!modal) {
    return;
  }


  const modalHero =
    modal.querySelector(
      ".details-modal__hero"
    );


  const icon =
    document.getElementById(
      "modalIcon"
    );


  const type =
    document.getElementById(
      "modalType"
    );


  const modalHeroTitle =
    document.getElementById(
      "modalHeroTitle"
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


  if (modalHero) {

    modalHero.style.background =
      movie.posterGradient;
  }


  if (icon) {

    icon.textContent =
      movie.icon;
  }


  if (type) {

    type.textContent =
      getTypeLabel(
        movie
      );
  }


  if (modalHeroTitle) {

    modalHeroTitle.textContent =
      movie.title;
  }


  if (title) {

    title.textContent =
      movie.title;
  }


  if (meta) {

    meta.innerHTML = `
      <span>
        ${movie.year}
      </span>

      <span>
        ${movie.genre}
      </span>

      <span>
        ${movie.duration}
      </span>

      <span>
        ⭐ ${movie.rating}
      </span>
    `;
  }


  if (description) {

    description.textContent =
      movie.description;
  }


  if (trailerButton) {

    trailerButton.dataset.trailer =
      movie.trailer;
  }


  if (favoriteButton) {

    favoriteButton.dataset.movieId =
      movie.id;
  }


  updateModalFavoriteButton(
    movie.id
  );


  modal.classList.add(
    "is-open"
  );

  document.body.classList.add(
    "modal-open"
  );

  stopHeroAutoplay();
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
    isInMyList(
      movieId
    );


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


  modal.classList.remove(
    "is-open"
  );

  document.body.classList.remove(
    "modal-open"
  );

  startHeroAutoplay();
}


/* ======================================================
   ATUALIZAÇÃO
====================================================== */

function refreshInterface() {

  renderFeaturedMovies();

  renderSeries();

  renderMyList();


  if (
    searchPanel &&
    searchPanel.classList.contains(
      "is-open"
    )
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
        modalFavoriteButton
          .dataset.movieId
      )
    );
  }
}


/* ======================================================
   EVENTOS HERO
====================================================== */

heroTrailerButton?.addEventListener(
  "click",
  openHeroTrailer
);


heroDetailsButton?.addEventListener(
  "click",
  () => {

    const movie =
      getCurrentHeroMovie();

    if (movie) {

      openDetailsModal(
        movie
      );
    }
  }
);


heroNext?.addEventListener(
  "click",
  () => {

    showNextHero();

    restartHeroAutoplay();
  }
);


heroPrevious?.addEventListener(
  "click",
  () => {

    showPreviousHero();

    restartHeroAutoplay();
  }
);


heroIndicators?.addEventListener(
  "click",
  event => {

    const indicator =
      event.target.closest(
        ".hero-carousel__indicator"
      );


    if (!indicator) {
      return;
    }


    goToHero(
      Number(
        indicator.dataset.index
      )
    );
  }
);


/* ======================================================
   EVENTOS BUSCA
====================================================== */

searchButton?.addEventListener(
  "click",
  openSearch
);


searchClose?.addEventListener(
  "click",
  closeSearch
);


searchInput?.addEventListener(
  "input",
  applySearchAndFilters
);


genreFilters?.addEventListener(
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


      closeOtherTrailers(
        card
      );


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


      closeTrailer(
        card
      );

      return;
    }


    const detailsButton =
      event.target.closest(
        ".details-button"
      );


    if (detailsButton) {

      const movieId =
        Number(
          detailsButton
            .dataset.movieId
        );


      const movie =
        movies.find(
          item =>
            item.id === movieId
        );


      if (movie) {

        openDetailsModal(
          movie
        );
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
          favoriteButton
            .dataset.movieId
        );


      toggleMyList(
        movieId
      );

      return;
    }


    const modalFavoriteButton =
      event.target.closest(
        "#modalFavoriteButton"
      );


    if (modalFavoriteButton) {

      const movieId =
        Number(
          modalFavoriteButton
            .dataset.movieId
        );


      toggleMyList(
        movieId
      );

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
        modalTrailerButton
          .dataset.trailer;


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
   TECLADO
====================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "ArrowRight" &&
      !searchPanel?.classList.contains(
        "is-open"
      )
    ) {

      showNextHero();

      restartHeroAutoplay();
    }


    if (
      event.key === "ArrowLeft" &&
      !searchPanel?.classList.contains(
        "is-open"
      )
    ) {

      showPreviousHero();

      restartHeroAutoplay();
    }


    if (
      event.key !== "Escape"
    ) {
      return;
    }


    const openedCards =
      document.querySelectorAll(
        ".movie-card.is-playing"
      );


    openedCards.forEach(
      card => {

        closeTrailer(
          card
        );
      }
    );


    closeDetailsModal();


    if (
      searchPanel &&
      searchPanel.classList.contains(
        "is-open"
      )
    ) {

      closeSearch();
    }
  }
);


/* ======================================================
   VISIBILIDADE DA ABA
====================================================== */

document.addEventListener(
  "visibilitychange",
  () => {

    if (document.hidden) {

      stopHeroAutoplay();

    } else {

      startHeroAutoplay();
    }
  }
);


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

createDetailsModal();

refreshInterface();

renderSearchResults(
  movies
);

initializeHero();
