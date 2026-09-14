const featuredMoviesContainer =
  document.getElementById("featuredMovies");

const seriesGrid =
  document.getElementById("seriesGrid");

const recommendationGrid =
  document.getElementById("recommendationGrid");

const recommendationReason =
  document.getElementById("recommendationReason");

const myListSection =
  document.getElementById("minha-lista");

/* ======================================================
   API
====================================================== */

const CINEAI_API_URL =
  "https://cine-ai.vercel.app/api/movies";

let tmdbMovies = [];
let tmdbSeries = [];
let tmdbSearchResults = [];

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

const SEARCH_DEBOUNCE =
  450;

const MIN_TMDB_SEARCH_LENGTH =
  2;

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

let searchTimer =
  null;

let searchController =
  null;

let activeSearchQuery =
  "";

let searchLoadingMore =
  false;

let searchPagination = {
  movie:
    createEmptyPaginationState(),

  tv:
    createEmptyPaginationState()
};

/* ======================================================
   UTILITÁRIOS TMDB
====================================================== */

function getTmdbMediaType(item) {
  return item?.mediaType === "tv"
    ? "tv"
    : "movie";
}

function normalizeTmdbItem(
  item,
  mediaType = "movie"
) {
  return {
    ...item,
    mediaType,
    type:
      mediaType === "tv"
        ? "series"
        : "movie",
    source: "tmdb"
  };
}

/* ======================================================
   LOCAL STORAGE
====================================================== */

function normalizeSavedItem(item) {
  if (typeof item === "number") {
    return {
      source: "local",
      id: item
    };
  }

  if (
    typeof item === "string" &&
    /^\d+$/.test(item)
  ) {
    return {
      source: "local",
      id: Number(item)
    };
  }

  if (
    !item ||
    typeof item !== "object" ||
    item.id === undefined
  ) {
    return null;
  }

  if (item.source === "tmdb") {
    const mediaType =
      item.mediaType === "tv" ||
      item.movie?.mediaType === "tv"
        ? "tv"
        : "movie";

    return {
      source: "tmdb",
      id: Number(item.id),
      mediaType,
      movie:
        item.movie
          ? normalizeTmdbItem(
              item.movie,
              mediaType
            )
          : null
    };
  }

  return {
    source: "local",
    id: Number(item.id)
  };
}

function getListKey(
  source,
  id,
  mediaType = "movie"
) {
  if (source === "tmdb") {
    return `tmdb:${mediaType}:${id}`;
  }

  return `local:${id}`;
}

function loadMyList() {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized =
      parsed
        .map(normalizeSavedItem)
        .filter(Boolean);

    const unique = [];
    const keys = new Set();

    normalized.forEach(item => {
      const key =
        getListKey(
          item.source,
          item.id,
          item.mediaType
        );

      if (keys.has(key)) {
        return;
      }

      keys.add(key);
      unique.push(item);
    });

    return unique;

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

function isInMyList(
  id,
  source = "local",
  mediaType = "movie"
) {
  const key =
    getListKey(
      source,
      id,
      mediaType
    );

  return myList.some(
    item =>
      getListKey(
        item.source,
        item.id,
        item.mediaType
      ) === key
  );
}

function createTmdbSnapshot(item) {
  const mediaType =
    getTmdbMediaType(item);

  return {
    id: item.id,
    mediaType,
    type:
      mediaType === "tv"
        ? "series"
        : "movie",

    title:
      item.title,

    originalTitle:
      item.originalTitle ||
      null,

    description:
      item.description ||
      "Sinopse não disponível.",

    releaseDate:
      item.releaseDate ||
      null,

    rating:
      item.rating ||
      0,

    voteCount:
      item.voteCount ||
      0,

    popularity:
      item.popularity ||
      0,

    genres:
      Array.isArray(item.genres)
        ? item.genres
        : [],

    poster:
      item.poster ||
      null,

    backdrop:
      item.backdrop ||
      null,

    trailer:
      item.trailer ||
      null,

    trailerWatchUrl:
      item.trailerWatchUrl ||
      null,

    trailerName:
      item.trailerName ||
      null,

    trailerOfficial:
      Boolean(
        item.trailerOfficial
      ),

    trailerLanguage:
      item.trailerLanguage ||
      null,

    source:
      "tmdb"
  };
}

function toggleMyList(
  item,
  source = "local"
) {
  if (!item) {
    return;
  }

  const id =
    Number(item.id);

  const mediaType =
    source === "tmdb"
      ? getTmdbMediaType(item)
      : "local";

  const key =
    getListKey(
      source,
      id,
      mediaType
    );

  const exists =
    myList.some(
      saved =>
        getListKey(
          saved.source,
          saved.id,
          saved.mediaType
        ) === key
    );

  if (exists) {
    myList =
      myList.filter(
        saved =>
          getListKey(
            saved.source,
            saved.id,
            saved.mediaType
          ) !== key
      );
  } else if (
    source === "tmdb"
  ) {
    myList.push({
      source:
        "tmdb",

      id,

      mediaType,

      movie:
        createTmdbSnapshot(item)
    });
  } else {
    myList.push({
      source: "local",
      id
    });
  }

  saveMyList();
  refreshInterface();
}

/* ======================================================
   UTILITÁRIOS
====================================================== */

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}

function getTypeLabel(item) {
  return item.type === "series"
    ? "Série"
    : "Filme";
}

function getYearFromDate(date) {
  if (!date) {
    return "—";
  }

  return String(date).slice(
    0,
    4
  );
}

function getTmdbMovieById(id) {
  return tmdbMovies.find(
    item =>
      String(item.id) ===
      String(id)
  );
}

function getTmdbSeriesById(id) {
  return tmdbSeries.find(
    item =>
      String(item.id) ===
      String(id)
  );
}

function getSearchTmdbItemById(
  id,
  mediaType = "movie"
) {
  return tmdbSearchResults.find(
    item =>
      getTmdbMediaType(item) ===
        mediaType &&
      String(item.id) ===
        String(id)
  );
}

function getSavedTmdbItemById(
  id,
  mediaType = "movie"
) {
  const saved =
    myList.find(
      item =>
        item.source ===
          "tmdb" &&
        item.mediaType ===
          mediaType &&
        String(item.id) ===
          String(id)
    );

  return saved?.movie ||
    null;
}

function getTmdbItemFromAnySource(
  id,
  mediaType = "movie"
) {
  if (mediaType === "tv") {
    return (
      getTmdbSeriesById(id) ||
      getSearchTmdbItemById(
        id,
        "tv"
      ) ||
      getSavedTmdbItemById(
        id,
        "tv"
      ) ||
      null
    );
  }

  return (
    getTmdbMovieById(id) ||
    getSearchTmdbItemById(
      id,
      "movie"
    ) ||
    getSavedTmdbItemById(
      id,
      "movie"
    ) ||
    null
  );
}

function isTmdbItem(item) {
  return item?.source === "tmdb";
}

function getTmdbGenres(item) {
  if (
    !Array.isArray(item?.genres) ||
    item.genres.length === 0
  ) {
    return item?.mediaType === "tv"
      ? "Série"
      : "Cinema";
  }

  return item.genres
    .slice(0, 3)
    .join(" • ");
}

function getWatchUrl(item) {
  if (item?.trailerWatchUrl) {
    return item.trailerWatchUrl;
  }

  if (item?.trailer) {
    return item.trailer.replace(
      "/embed/",
      "/watch?v="
    );
  }

  return null;
}

/* ======================================================
   RECOMENDAÇÕES
====================================================== */

function renderRecommendations() {
  if (
    !recommendationGrid ||
    !recommendationReason
  ) {
    return;
  }

  recommendationGrid.innerHTML =
    "";

  if (
    !window.CineAIRecommendations
  ) {
    recommendationReason.textContent =
      "Recomendações temporariamente indisponíveis.";

    return;
  }

  if (
    tmdbMovies.length === 0 &&
    tmdbSeries.length === 0
  ) {
    recommendationReason.textContent =
      "Carregando sugestões personalizadas...";

    recommendationGrid.innerHTML = `
      <div
        class="empty-list"
        style="grid-column: 1 / -1;"
      >
        <span>✨</span>

        <p>
          Preparando recomendações...
        </p>
      </div>
    `;

    return;
  }

  const result =
    window.CineAIRecommendations
      .recommend({
        savedList:
          myList,

        localCatalog:
          movies,

        tmdbMovies,

        tmdbSeries,

        limit:
          8
      });

  const recommendations =
    result.recommendations || [];

  if (
    result.mode ===
    "personalized" &&
    result.genreProfile?.length
  ) {
    const topGenres =
      result.genreProfile
        .slice(0, 2)
        .map(
          genre =>
            genre.name
        );

    if (
      topGenres.length === 1
    ) {
      recommendationReason.textContent =
        `Com base no seu interesse por ${topGenres[0]}.`;
    } else {
      recommendationReason.textContent =
        `Com base nos seus interesses por ${topGenres[0]} e ${topGenres[1]}.`;
    }
  } else {
    recommendationReason.textContent =
      "Seleção baseada nos títulos mais bem avaliados e populares do momento.";
  }

  if (
    recommendations.length === 0
  ) {
    recommendationGrid.innerHTML = `
      <div
        class="empty-list"
        style="grid-column: 1 / -1;"
      >
        <span>🎯</span>

        <p>
          Ainda não há recomendações disponíveis.
        </p>

        <small>
          Adicione filmes ou séries à Minha Lista.
        </small>
      </div>
    `;

    return;
  }

  recommendations.forEach(
    item => {
      recommendationGrid
        .appendChild(
          createTmdbMovieCard(item)
        );
    }
  );
}

/* ======================================================
   TMDB — FILMES EM ALTA
====================================================== */

async function loadTmdbMovies() {
  if (
    !featuredMoviesContainer
  ) {
    return;
  }

  renderFeaturedLoading();

  try {
    const response =
      await fetch(
        CINEAI_API_URL
      );

    if (!response.ok) {
      throw new Error(
        `API respondeu com status ${response.status}`
      );
    }

    const data =
      await response.json();

    if (
      !Array.isArray(
        data.results
      )
    ) {
      throw new Error(
        "Formato inesperado da API"
      );
    }

    tmdbMovies =
      data.results.map(
        item =>
          normalizeTmdbItem(
            item,
            "movie"
          )
      );

    renderFeaturedMovies();
    renderMyList();
    renderRecommendations();
    initializeTmdbHero();

  } catch (error) {
    console.error(
      "Erro ao carregar filmes TMDB:",
      error
    );

    renderFeaturedFallback();
    renderMyList();
    renderRecommendations();
  }
}

function renderFeaturedLoading() {
  featuredMoviesContainer.innerHTML = `
    <div
      class="empty-list"
      style="grid-column: 1 / -1;"
    >
      <span>🎬</span>

      <p>
        Carregando filmes em alta...
      </p>

      <small>
        Buscando dados no TMDB.
      </small>
    </div>
  `;
}

function renderFeaturedFallback() {
  featuredMoviesContainer.innerHTML =
    "";

  movies
    .filter(
      item =>
        item.featured
    )
    .forEach(
      item => {
        featuredMoviesContainer
          .appendChild(
            createMovieCard(item)
          );
      }
    );
}

/* ======================================================
   TMDB — SÉRIES EM ALTA
====================================================== */

async function loadTmdbSeries() {
  if (!seriesGrid) {
    return;
  }

  renderSeriesLoading();

  try {
    const response =
      await fetch(
        `${CINEAI_API_URL}?type=tv`
      );

    if (!response.ok) {
      throw new Error(
        `API de séries respondeu com status ${response.status}`
      );
    }

    const data =
      await response.json();

    if (
      !Array.isArray(
        data.results
      )
    ) {
      throw new Error(
        "Formato inesperado da API de séries"
      );
    }

    tmdbSeries =
      data.results.map(
        item =>
          normalizeTmdbItem(
            item,
            "tv"
          )
      );

    renderSeries();
    renderMyList();
    renderRecommendations();

  } catch (error) {
    console.error(
      "Erro ao carregar séries TMDB:",
      error
    );

    tmdbSeries = [];

    renderSeriesFallback();
    renderMyList();
    renderRecommendations();
  }
}

function renderSeriesLoading() {
  seriesGrid.innerHTML = `
    <div
      class="empty-list"
      style="grid-column: 1 / -1;"
    >
      <span>📺</span>

      <p>
        Carregando séries populares...
      </p>

      <small>
        Buscando dados no TMDB.
      </small>
    </div>
  `;
}

function renderSeriesFallback() {
  seriesGrid.innerHTML =
    "";

  movies
    .filter(
      item =>
        item.type === "series"
    )
    .forEach(
      item => {
        seriesGrid.appendChild(
          createMovieCard(item)
        );
      }
    );
}

/* ======================================================
   HERO
====================================================== */

function initializeHero() {
  heroMovies =
    movies
      .filter(
        item =>
          item.featured
      )
      .map(
        item => ({
          ...item,
          source:
            "local"
        })
      );

  if (
    heroMovies.length === 0
  ) {
    heroMovies =
      movies
        .slice(0, 4)
        .map(
          item => ({
            ...item,
            source:
              "local"
          })
        );
  }

  currentHeroIndex =
    0;

  renderHeroIndicators();
  renderHero();
  startHeroAutoplay();
}

function initializeTmdbHero() {
  const withBackdrop =
    tmdbMovies.filter(
      item =>
        item.backdrop
    );

  const source =
    withBackdrop.length >= 5
      ? withBackdrop
      : tmdbMovies;

  if (
    source.length === 0
  ) {
    return;
  }

  heroMovies =
    source
      .slice(0, 5)
      .map(
        item =>
          normalizeTmdbItem(
            item,
            "movie"
          )
      );

  currentHeroIndex =
    0;

  renderHeroIndicators();
  renderHero();
  restartHeroAutoplay();
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
  const item =
    getCurrentHeroMovie();

  if (
    !item ||
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

  if (
    isTmdbItem(item)
  ) {
    renderTmdbHero(item);
  } else {
    renderLocalHero(item);
  }

  updateHeroIndicators();
}

function renderLocalHero(item) {
  hero.style.background = `
    linear-gradient(
      to right,
      rgba(8,11,18,.98) 5%,
      rgba(8,11,18,.84) 44%,
      rgba(8,11,18,.34) 74%,
      rgba(8,11,18,.82) 100%
    ),
    ${item.posterGradient}
  `;

  heroBadge.textContent =
    `${getTypeLabel(item)} em destaque`;

  heroTitle.textContent =
    item.title;

  heroMeta.innerHTML = `
    <span>
      ${item.year}
    </span>

    <span>
      ${item.genre}
    </span>

    <span>
      ${item.duration}
    </span>

    <span>
      ⭐ ${item.rating}
    </span>
  `;

  heroDescription.textContent =
    item.description;

  heroTrailerButton.style.display =
    "";

  heroTrailerButton.dataset.trailer =
    item.trailer || "";

  heroDetailsButton.dataset.movieId =
    item.id;

  heroDetailsButton.dataset.source =
    "local";

  heroDetailsButton.dataset.mediaType =
    "local";
}

function renderTmdbHero(item) {
  const image =
    item.backdrop ||
    item.poster;

  if (image) {
    hero.style.background = `
      linear-gradient(
        to right,
        rgba(8,11,18,.98) 4%,
        rgba(8,11,18,.90) 31%,
        rgba(8,11,18,.58) 57%,
        rgba(8,11,18,.28) 78%,
        rgba(8,11,18,.66) 100%
      ),
      linear-gradient(
        to top,
        rgba(8,11,18,.95),
        rgba(8,11,18,.12)
      ),
      url("${image}")
      center / cover
      no-repeat
    `;
  } else {
    hero.style.background = `
      linear-gradient(
        135deg,
        #080b12,
        #312e81,
        #0f766e
      )
    `;
  }

  heroBadge.textContent =
    "Filme em alta • TMDB";

  heroTitle.textContent =
    item.title;

  heroMeta.innerHTML = `
    <span>
      ${getYearFromDate(
        item.releaseDate
      )}
    </span>

    <span>
      ${getTmdbGenres(
        item
      )}
    </span>

    <span>
      ⭐ ${item.rating}
    </span>

    <span>
      ${item.voteCount || 0}
      avaliações
    </span>
  `;

  heroDescription.textContent =
    item.description ||
    "Sinopse não disponível.";

  heroTrailerButton.style.display =
    item.trailer
      ? ""
      : "none";

  heroTrailerButton.dataset.trailer =
    item.trailer || "";

  heroDetailsButton.dataset.movieId =
    item.id;

  heroDetailsButton.dataset.source =
    "tmdb";

  heroDetailsButton.dataset.mediaType =
    "movie";
}

function renderHeroIndicators() {
  if (!heroIndicators) {
    return;
  }

  heroIndicators.innerHTML =
    "";

  heroMovies.forEach(
    (
      item,
      index
    ) => {
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
        `Mostrar ${item.title}`
      );

      heroIndicators.appendChild(
        button
      );
    }
  );
}

function updateHeroIndicators() {
  document
    .querySelectorAll(
      ".hero-carousel__indicator"
    )
    .forEach(
      (
        indicator,
        index
      ) => {
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
      currentHeroIndex +
      1
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
    index >=
      heroMovies.length
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
    heroMovies.length <=
    1
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
  if (!heroTimer) {
    return;
  }

  clearInterval(
    heroTimer
  );

  heroTimer =
    null;
}

function restartHeroAutoplay() {
  startHeroAutoplay();
}

function openHeroTrailer() {
  const item =
    getCurrentHeroMovie();

  const url =
    getWatchUrl(item);

  if (!url) {
    return;
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

/* ======================================================
   CARD LOCAL
====================================================== */

function createMovieCard(item) {
  const article =
    document.createElement(
      "article"
    );

  const saved =
    isInMyList(
      item.id,
      "local"
    );

  article.className =
    "movie-card";

  article.dataset.id =
    item.id;

  article.innerHTML = `
    <div
      class="movie-card__poster"
      style="background: ${item.posterGradient};"
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
          ${getTypeLabel(item)}
        </span>

        <span
          class="movie-rating-badge"
        >
          ★ ${item.rating}
        </span>

      </div>

      <div
        class="movie-card__poster-center"
      >

        <span
          class="movie-card__icon"
        >
          ${item.icon}
        </span>

      </div>

      <div
        class="movie-card__poster-bottom"
      >

        <span
          class="movie-card__year"
        >
          ${item.year}
        </span>

        <h3
          class="movie-card__poster-title"
        >
          ${item.title}
        </h3>

        <span
          class="movie-card__poster-genre"
        >
          ${item.genre}
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
          ${item.title}
        </h3>

        <div
          class="movie-card__meta"
        >

          <span>
            ${item.year}
          </span>

          <span>
            ${item.genre}
          </span>

          <span>
            ${item.duration}
          </span>

        </div>

      </div>

      <div
        class="movie-card__actions"
      >

        <button
          class="trailer-button"
          data-trailer="${item.trailer}"
          aria-label="Assistir trailer de ${item.title}"
        >
          ▶
        </button>

        <button
          class="details-button"
          data-source="local"
          data-media-type="local"
          data-movie-id="${item.id}"
          aria-label="Mais informações sobre ${item.title}"
        >
          ⓘ
        </button>

        <button
          class="favorite-button ${saved ? "is-saved" : ""}"
          data-source="local"
          data-media-type="local"
          data-movie-id="${item.id}"
          aria-label="Minha Lista"
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
          title="Trailer de ${item.title}"
          allow="autoplay; encrypted-media"
          allowfullscreen
        ></iframe>

      </div>

    </div>
  `;

  return article;
}

/* ======================================================
   CARD TMDB
====================================================== */

function createTmdbMovieCard(item) {
  const mediaType =
    getTmdbMediaType(item);

  const saved =
    isInMyList(
      item.id,
      "tmdb",
      mediaType
    );

  const year =
    getYearFromDate(
      item.releaseDate
    );

  const genres =
    item.genres?.length
      ? item.genres
          .slice(0, 2)
          .join(" • ")
      : mediaType === "tv"
        ? "Série"
        : "Cinema";

  const background =
    item.poster
      ? `
        linear-gradient(
          to bottom,
          rgba(0,0,0,.02),
          rgba(0,0,0,.12) 50%,
          rgba(0,0,0,.90)
        ),
        url("${item.poster}")
        center / cover
        no-repeat
      `
      : `
        linear-gradient(
          135deg,
          #111827,
          #312e81,
          #0f766e
        )
      `;

  const article =
    document.createElement(
      "article"
    );

  article.className =
    "movie-card";

  article.dataset.id =
    item.id;

  article.dataset.mediaType =
    mediaType;

  article.innerHTML = `
    <div
      class="movie-card__poster"
      style='background: ${background};'
    >

      <div
        class="movie-card__poster-top"
      >

        <span
          class="movie-type-badge"
        >
          ${
            mediaType === "tv"
              ? "Série • TMDB"
              : "Filme • TMDB"
          }
        </span>

        <span
          class="movie-rating-badge"
        >
          ★ ${item.rating}
        </span>

      </div>

      <div
        class="movie-card__poster-bottom"
      >

        <span
          class="movie-card__year"
        >
          ${year}
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
          ${item.title}
        </h3>

        <div
          class="movie-card__meta"
        >

          <span>
            ${year}
          </span>

          <span>
            ${genres}
          </span>

          <span>
            ⭐ ${item.rating}
          </span>

        </div>

      </div>

      <div
        class="movie-card__actions"
      >

        ${
          item.trailer
            ? `
              <button
                class="trailer-button"
                data-trailer="${item.trailer}"
                aria-label="Assistir trailer de ${item.title}"
              >
                ▶
              </button>
            `
            : ""
        }

        <button
          class="details-button"
          data-source="tmdb"
          data-media-type="${mediaType}"
          data-movie-id="${item.id}"
          aria-label="Mais informações sobre ${item.title}"
        >
          ⓘ
        </button>

        <button
          class="favorite-button ${saved ? "is-saved" : ""}"
          data-source="tmdb"
          data-media-type="${mediaType}"
          data-movie-id="${item.id}"
          aria-label="Minha Lista"
        >
          ${saved ? "♥" : "♡"}
        </button>

      </div>

    </div>

    ${
      item.trailer
        ? `
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
                title="Trailer de ${item.title}"
                allow="autoplay; encrypted-media"
                allowfullscreen
              ></iframe>

            </div>

          </div>
        `
        : ""
    }
  `;

  return article;
}

/* ======================================================
   DESTAQUES
====================================================== */

function renderFeaturedMovies() {
  if (
    !featuredMoviesContainer
  ) {
    return;
  }

  if (
    tmdbMovies.length ===
    0
  ) {
    renderFeaturedFallback();
    return;
  }

  featuredMoviesContainer.innerHTML =
    "";

  tmdbMovies
    .slice(0, 8)
    .forEach(
      item => {
        featuredMoviesContainer
          .appendChild(
            createTmdbMovieCard(item)
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

  if (
    tmdbSeries.length ===
    0
  ) {
    renderSeriesFallback();
    return;
  }

  seriesGrid.innerHTML =
    "";

  tmdbSeries
    .slice(0, 8)
    .forEach(
      item => {
        seriesGrid.appendChild(
          createTmdbMovieCard(item)
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

  const old =
    container.querySelector(
      ".empty-list, .my-list-grid"
    );

  if (old) {
    old.remove();
  }

  const resolved =
    myList
      .map(saved => {
        if (
          saved.source ===
          "local"
        ) {
          const localItem =
            movies.find(
              item =>
                Number(item.id) ===
                Number(saved.id)
            );

          return localItem
            ? {
                source:
                  "local",

                item:
                  localItem
              }
            : null;
        }

        const mediaType =
          saved.mediaType ===
            "tv"
            ? "tv"
            : "movie";

        const tmdbItem =
          getTmdbItemFromAnySource(
            saved.id,
            mediaType
          ) ||
          saved.movie;

        return tmdbItem
          ? {
              source:
                "tmdb",

              item:
                normalizeTmdbItem(
                  tmdbItem,
                  mediaType
                )
            }
          : null;
      })
      .filter(Boolean);

  if (
    resolved.length === 0
  ) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "empty-list";

    empty.innerHTML = `
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
      empty
    );

    return;
  }

  const grid =
    document.createElement(
      "div"
    );

  grid.className =
    "movie-grid my-list-grid";

  resolved.forEach(
    resolvedItem => {
      if (
        resolvedItem.source ===
        "tmdb"
      ) {
        grid.appendChild(
          createTmdbMovieCard(
            resolvedItem.item
          )
        );
      } else {
        grid.appendChild(
          createMovieCard(
            resolvedItem.item
          )
        );
      }
    }
  );

  container.appendChild(
    grid
  );
}

/* ======================================================
   BUSCA LOCAL
====================================================== */

function getFilteredLocalMovies() {
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
        selectedGenre ===
          "all" ||
        item.genre ===
          selectedGenre;

      return (
        matchesSearch &&
        matchesGenre
      );
    }
  );
}

function getFilteredTmdbSearchResults() {
  if (
    selectedGenre ===
    "all"
  ) {
    return tmdbSearchResults;
  }

  return tmdbSearchResults.filter(
    item =>
      Array.isArray(
        item.genres
      ) &&
      item.genres.includes(
        selectedGenre
      )
  );
}

/* ======================================================
   PAGINAÇÃO
====================================================== */

function createEmptyPaginationState() {
  return {
    currentPage: 0,
    totalPages: 0,
    hasMore: false,
    nextPage: null
  };
}

function resetSearchPagination() {
  searchPagination = {
    movie:
      createEmptyPaginationState(),

    tv:
      createEmptyPaginationState()
  };

  searchLoadingMore =
    false;
}

function updatePaginationState(
  mediaType,
  data
) {
  searchPagination[
    mediaType
  ] = {
    currentPage:
      Number(data.page) || 1,

    totalPages:
      Number(
        data.totalPages
      ) || 0,

    hasMore:
      Boolean(
        data.hasMore
      ),

    nextPage:
      data.nextPage
        ? Number(
            data.nextPage
          )
        : null
  };
}

function hasMoreSearchResults() {
  return (
    searchPagination.movie.hasMore ||
    searchPagination.tv.hasMore
  );
}

function mergeSearchResults(
  current,
  incoming
) {
  const map =
    new Map();

  current.forEach(
    item => {
      const key =
        `${getTmdbMediaType(item)}:${item.id}`;

      map.set(
        key,
        item
      );
    }
  );

  incoming.forEach(
    item => {
      const key =
        `${getTmdbMediaType(item)}:${item.id}`;

      map.set(
        key,
        item
      );
    }
  );

  return Array.from(
    map.values()
  );
}

function cancelPendingSearch() {
  if (searchTimer) {
    clearTimeout(
      searchTimer
    );

    searchTimer =
      null;
  }

  if (searchController) {
    searchController.abort();

    searchController =
      null;
  }
}

/* ======================================================
   BUSCA — LOADING
====================================================== */

function renderSearchLoading(
  localResults
) {
  searchResults.innerHTML =
    "";

  if (
    localResults.length >
    0
  ) {
    const grid =
      document.createElement(
        "div"
      );

    grid.className =
      "movie-grid search-results__grid";

    localResults.forEach(
      item => {
        grid.appendChild(
          createMovieCard(item)
        );
      }
    );

    searchResults.appendChild(
      grid
    );
  }

  const loading =
    document.createElement(
      "div"
    );

  loading.className =
    "empty-list";

  loading.innerHTML = `
    <span>
      🔎
    </span>

    <p>
      Pesquisando filmes e séries no TMDB...
    </p>

    <small>
      Aguarde um instante.
    </small>
  `;

  searchResults.appendChild(
    loading
  );
}

/* ======================================================
   BUSCA TMDB — FILMES + SÉRIES
====================================================== */

async function fetchTmdbSearchPage(
  query,
  mediaType,
  page,
  signal = null
) {
  const typeParameter =
    mediaType === "tv"
      ? "&type=tv"
      : "";

  const url =
    `${CINEAI_API_URL}?q=${encodeURIComponent(query)}&page=${page}${typeParameter}`;

  const response =
    await fetch(
      url,
      signal
        ? {
            signal
          }
        : undefined
    );

  if (!response.ok) {
    throw new Error(
      `${
        mediaType === "tv"
          ? "Séries"
          : "Filmes"
      }: status ${response.status}`
    );
  }

  const data =
    await response.json();

  if (
    !Array.isArray(
      data.results
    )
  ) {
    throw new Error(
      `Formato inesperado da busca de ${
        mediaType === "tv"
          ? "séries"
          : "filmes"
      }`
    );
  }

  return data;
}

async function searchTmdbContent(
  query
) {
  if (
    query.length <
    MIN_TMDB_SEARCH_LENGTH
  ) {
    tmdbSearchResults =
      [];

    resetSearchPagination();

    renderCombinedSearchResults();

    return;
  }

  if (
    searchController
  ) {
    searchController.abort();
  }

  searchController =
    new AbortController();

  const controller =
    searchController;

  const localResults =
    getFilteredLocalMovies();

  renderSearchLoading(
    localResults
  );

  try {
    const [
      movieResult,
      tvResult
    ] =
      await Promise.allSettled([
        fetchTmdbSearchPage(
          query,
          "movie",
          1,
          controller.signal
        ),

        fetchTmdbSearchPage(
          query,
          "tv",
          1,
          controller.signal
        )
      ]);

    if (
      normalizeText(
        searchInput.value.trim()
      ) !==
      normalizeText(
        query
      )
    ) {
      return;
    }

    const firstPageItems =
      [];

    let successfulRequests =
      0;

    if (
      movieResult.status ===
      "fulfilled"
    ) {
      successfulRequests +=
        1;

      updatePaginationState(
        "movie",
        movieResult.value
      );

      firstPageItems.push(
        ...movieResult.value.results.map(
          item =>
            normalizeTmdbItem(
              item,
              "movie"
            )
        )
      );
    } else {
      searchPagination.movie =
        createEmptyPaginationState();
    }

    if (
      tvResult.status ===
      "fulfilled"
    ) {
      successfulRequests +=
        1;

      updatePaginationState(
        "tv",
        tvResult.value
      );

      firstPageItems.push(
        ...tvResult.value.results.map(
          item =>
            normalizeTmdbItem(
              item,
              "tv"
            )
        )
      );
    } else {
      searchPagination.tv =
        createEmptyPaginationState();
    }

    if (
      successfulRequests ===
      0
    ) {
      throw new Error(
        "Busca indisponível"
      );
    }

    tmdbSearchResults =
      mergeSearchResults(
        [],
        firstPageItems
      );

    activeSearchQuery =
      query;

    renderCombinedSearchResults();

  } catch (error) {
    if (
      error.name ===
      "AbortError"
    ) {
      return;
    }

    console.error(
      "Erro ao pesquisar no TMDB:",
      error
    );

    tmdbSearchResults =
      [];

    resetSearchPagination();

    renderCombinedSearchResults(
      true
    );

  } finally {
    if (
      searchController ===
      controller
    ) {
      searchController =
        null;
    }
  }
}

/* ======================================================
   CARREGAR MAIS
====================================================== */

async function loadMoreTmdbContent() {
  if (
    searchLoadingMore ||
    !hasMoreSearchResults()
  ) {
    return;
  }

  const query =
    searchInput.value.trim();

  if (
    query.length <
    MIN_TMDB_SEARCH_LENGTH
  ) {
    return;
  }

  searchLoadingMore =
    true;

  renderCombinedSearchResults();

  const requests =
    [];

  if (
    searchPagination.movie.hasMore &&
    searchPagination.movie.nextPage
  ) {
    requests.push({
      mediaType:
        "movie",

      promise:
        fetchTmdbSearchPage(
          query,
          "movie",
          searchPagination.movie.nextPage
        )
    });
  }

  if (
    searchPagination.tv.hasMore &&
    searchPagination.tv.nextPage
  ) {
    requests.push({
      mediaType:
        "tv",

      promise:
        fetchTmdbSearchPage(
          query,
          "tv",
          searchPagination.tv.nextPage
        )
    });
  }

  try {
    const results =
      await Promise.allSettled(
        requests.map(
          request =>
            request.promise
        )
      );

    const newItems =
      [];

    results.forEach(
      (
        result,
        index
      ) => {
        const mediaType =
          requests[
            index
          ].mediaType;

        if (
          result.status ===
          "fulfilled"
        ) {
          updatePaginationState(
            mediaType,
            result.value
          );

          newItems.push(
            ...result.value.results.map(
              item =>
                normalizeTmdbItem(
                  item,
                  mediaType
                )
            )
          );
        }
      }
    );

    tmdbSearchResults =
      mergeSearchResults(
        tmdbSearchResults,
        newItems
      );

  } finally {
    searchLoadingMore =
      false;

    renderCombinedSearchResults();
  }
}

/* ======================================================
   RENDER DA BUSCA
====================================================== */

function renderCombinedSearchResults(
  tmdbError = false
) {
  const localResults =
    getFilteredLocalMovies();

  const tmdbResults =
    getFilteredTmdbSearchResults();

  searchResults.innerHTML =
    "";

  if (
    localResults.length ===
      0 &&
    tmdbResults.length ===
      0
  ) {
    searchResults.innerHTML = `
      <div
        class="search-empty"
      >
        <span
          class="search-empty__icon"
        >
          🎬
        </span>

        <strong>
          Nenhum título encontrado
        </strong>

        <p>
          ${
            tmdbError
              ? "A busca online não respondeu. Tente novamente."
              : "Tente outro termo ou gênero."
          }
        </p>
      </div>
    `;

    return;
  }

  const grid =
    document.createElement(
      "div"
    );

  grid.className =
    "movie-grid search-results__grid";

  localResults.forEach(
    item => {
      grid.appendChild(
        createMovieCard(item)
      );
    }
  );

  tmdbResults.forEach(
    item => {
      grid.appendChild(
        createTmdbMovieCard(item)
      );
    }
  );

  searchResults.appendChild(
    grid
  );

  const query =
    searchInput.value.trim();

  if (
    query.length >=
      MIN_TMDB_SEARCH_LENGTH &&
    hasMoreSearchResults()
  ) {
    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.style.display =
      "flex";

    wrapper.style.justifyContent =
      "center";

    wrapper.style.width =
      "100%";

    wrapper.style.padding =
      "32px 0 16px";

    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.id =
      "searchLoadMore";

    button.className =
      "button button--secondary";

    button.disabled =
      searchLoadingMore;

    button.textContent =
      searchLoadingMore
        ? "Carregando..."
        : "Carregar mais";

    wrapper.appendChild(
      button
    );

    searchResults.appendChild(
      wrapper
    );
  }
}

/* ======================================================
   AGENDAMENTO DA BUSCA
====================================================== */

function scheduleSearch() {
  cancelPendingSearch();

  const query =
    searchInput.value.trim();

  activeSearchQuery =
    query;

  tmdbSearchResults =
    [];

  resetSearchPagination();

  if (
    query.length <
    MIN_TMDB_SEARCH_LENGTH
  ) {
    renderCombinedSearchResults();

    return;
  }

  renderCombinedSearchResults();

  searchTimer =
    setTimeout(
      () => {
        searchTimer =
          null;

        searchTmdbContent(
          query
        );
      },
      SEARCH_DEBOUNCE
    );
}

/* ======================================================
   PAINEL DE BUSCA
====================================================== */

function openSearch() {
  searchPanel.classList.add(
    "is-open"
  );

  document.body.classList.add(
    "search-open"
  );

  stopHeroAutoplay();

  tmdbSearchResults =
    [];

  activeSearchQuery =
    "";

  resetSearchPagination();

  renderCombinedSearchResults();

  setTimeout(
    () => {
      searchInput.focus();
    },
    100
  );
}

function closeSearch() {
  cancelPendingSearch();

  searchPanel.classList.remove(
    "is-open"
  );

  document.body.classList.remove(
    "search-open"
  );

  searchInput.value =
    "";

  selectedGenre =
    "all";

  tmdbSearchResults =
    [];

  activeSearchQuery =
    "";

  resetSearchPagination();

  updateGenreButtons();
  renderCombinedSearchResults();
  startHeroAutoplay();
}

function updateGenreButtons() {
  document
    .querySelectorAll(
      ".genre-filter"
    )
    .forEach(
      button => {
        button.classList.toggle(
          "is-active",
          button.dataset.genre ===
            selectedGenre
        );
      }
    );
}

/* ======================================================
   TRAILERS
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

  const iframe =
    card.querySelector(
      "iframe"
    );

  if (!iframe) {
    return;
  }

  const separator =
    trailerUrl.includes("?")
      ? "&"
      : "?";

  iframe.src =
    `${trailerUrl}${separator}autoplay=1&mute=1&rel=0`;

  card.classList.add(
    "is-playing"
  );
}

function closeTrailer(card) {
  if (!card) {
    return;
  }

  const iframe =
    card.querySelector(
      "iframe"
    );

  if (iframe) {
    iframe.src =
      "";
  }

  card.classList.remove(
    "is-playing"
  );
}

function closeOtherTrailers(
  currentCard
) {
  document
    .querySelectorAll(
      ".movie-card.is-playing"
    )
    .forEach(
      card => {
        if (
          card !==
          currentCard
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
  if (
    document.getElementById(
      "detailsModal"
    )
  ) {
    return;
  }

  const modal =
    document.createElement(
      "div"
    );

  modal.id =
    "detailsModal";

  modal.className =
    "details-modal";

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

function openLocalDetails(item) {
  const modal =
    document.getElementById(
      "detailsModal"
    );

  const modalHero =
    modal.querySelector(
      ".details-modal__hero"
    );

  modalHero.style.background =
    item.posterGradient;

  document.getElementById(
    "modalType"
  ).textContent =
    getTypeLabel(item);

  document.getElementById(
    "modalIcon"
  ).textContent =
    item.icon;

  document.getElementById(
    "modalHeroTitle"
  ).textContent =
    item.title;

  document.getElementById(
    "modalTitle"
  ).textContent =
    item.title;

  document.getElementById(
    "modalMeta"
  ).innerHTML = `
    <span>
      ${item.year}
    </span>

    <span>
      ${item.genre}
    </span>

    <span>
      ${item.duration}
    </span>

    <span>
      ⭐ ${item.rating}
    </span>
  `;

  document.getElementById(
    "modalDescription"
  ).textContent =
    item.description;

  const trailerButton =
    document.getElementById(
      "modalTrailerButton"
    );

  trailerButton.style.display =
    "";

  trailerButton.dataset.trailer =
    item.trailer;

  trailerButton.dataset.watchUrl =
    getWatchUrl(item) ||
    "";

  const favoriteButton =
    document.getElementById(
      "modalFavoriteButton"
    );

  favoriteButton.style.display =
    "";

  favoriteButton.dataset.movieId =
    item.id;

  favoriteButton.dataset.source =
    "local";

  favoriteButton.dataset.mediaType =
    "local";

  updateModalFavoriteButton(
    item.id,
    "local",
    "local"
  );

  showDetailsModal();
}

function openTmdbDetails(item) {
  const mediaType =
    getTmdbMediaType(item);

  const modal =
    document.getElementById(
      "detailsModal"
    );

  const modalHero =
    modal.querySelector(
      ".details-modal__hero"
    );

  if (item.backdrop) {
    modalHero.style.background = `
      linear-gradient(
        to bottom,
        rgba(0,0,0,.1),
        rgba(8,11,18,.92)
      ),
      url("${item.backdrop}")
      center / cover
      no-repeat
    `;
  } else {
    modalHero.style.background = `
      linear-gradient(
        135deg,
        #111827,
        #312e81,
        #0f766e
      )
    `;
  }

  document.getElementById(
    "modalType"
  ).textContent =
    mediaType === "tv"
      ? "Série • TMDB"
      : "Filme • TMDB";

  document.getElementById(
    "modalIcon"
  ).textContent =
    mediaType === "tv"
      ? "📺"
      : "🎬";

  document.getElementById(
    "modalHeroTitle"
  ).textContent =
    item.title;

  document.getElementById(
    "modalTitle"
  ).textContent =
    item.title;

  document.getElementById(
    "modalMeta"
  ).innerHTML = `
    <span>
      ${getYearFromDate(
        item.releaseDate
      )}
    </span>

    <span>
      ${getTmdbGenres(
        item
      )}
    </span>

    <span>
      ⭐ ${item.rating}
    </span>
  `;

  document.getElementById(
    "modalDescription"
  ).textContent =
    item.description ||
    "Sinopse não disponível.";

  const trailerButton =
    document.getElementById(
      "modalTrailerButton"
    );

  trailerButton.style.display =
    item.trailer
      ? ""
      : "none";

  trailerButton.dataset.trailer =
    item.trailer ||
    "";

  trailerButton.dataset.watchUrl =
    getWatchUrl(item) ||
    "";

  const favoriteButton =
    document.getElementById(
      "modalFavoriteButton"
    );

  favoriteButton.style.display =
    "";

  favoriteButton.dataset.movieId =
    item.id;

  favoriteButton.dataset.source =
    "tmdb";

  favoriteButton.dataset.mediaType =
    mediaType;

  updateModalFavoriteButton(
    item.id,
    "tmdb",
    mediaType
  );

  showDetailsModal();
}

function showDetailsModal() {
  const modal =
    document.getElementById(
      "detailsModal"
    );

  modal.classList.add(
    "is-open"
  );

  document.body.classList.add(
    "modal-open"
  );

  stopHeroAutoplay();
}

function closeDetailsModal() {
  const modal =
    document.getElementById(
      "detailsModal"
    );

  modal.classList.remove(
    "is-open"
  );

  document.body.classList.remove(
    "modal-open"
  );

  startHeroAutoplay();
}

function updateModalFavoriteButton(
  id,
  source,
  mediaType = "movie"
) {
  const button =
    document.getElementById(
      "modalFavoriteButton"
    );

  const saved =
    isInMyList(
      id,
      source,
      mediaType
    );

  button.textContent =
    saved
      ? "♥ Na Minha Lista"
      : "♡ Minha Lista";

  button.classList.toggle(
    "is-saved",
    saved
  );
}

/* ======================================================
   INTERFACE
====================================================== */

function refreshInterface() {
  renderSeries();
  renderMyList();
  renderRecommendations();

  if (
    tmdbMovies.length >
    0
  ) {
    renderFeaturedMovies();
  }

  if (
    searchPanel.classList.contains(
      "is-open"
    )
  ) {
    renderCombinedSearchResults();
  }

  const modalButton =
    document.getElementById(
      "modalFavoriteButton"
    );

  if (
    modalButton?.dataset.movieId &&
    modalButton.style.display !==
      "none"
  ) {
    updateModalFavoriteButton(
      Number(
        modalButton.dataset.movieId
      ),
      modalButton.dataset.source ||
        "local",
      modalButton.dataset.mediaType ||
        "movie"
    );
  }
}

/* ======================================================
   EVENTOS HERO
====================================================== */

heroTrailerButton.addEventListener(
  "click",
  openHeroTrailer
);

heroDetailsButton.addEventListener(
  "click",
  () => {
    const item =
      getCurrentHeroMovie();

    if (!item) {
      return;
    }

    if (
      isTmdbItem(item)
    ) {
      openTmdbDetails(
        item
      );
    } else {
      openLocalDetails(
        item
      );
    }
  }
);

heroNext.addEventListener(
  "click",
  () => {
    showNextHero();
    restartHeroAutoplay();
  }
);

heroPrevious.addEventListener(
  "click",
  () => {
    showPreviousHero();
    restartHeroAutoplay();
  }
);

heroIndicators.addEventListener(
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
  scheduleSearch
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

    renderCombinedSearchResults();
  }
);

/* ======================================================
   EVENTOS GERAIS
====================================================== */

document.addEventListener(
  "click",
  event => {
    const loadMore =
      event.target.closest(
        "#searchLoadMore"
      );

    if (loadMore) {
      loadMoreTmdbContent();
      return;
    }

    const trailerButton =
      event.target.closest(
        ".trailer-button"
      );

    if (trailerButton) {
      const card =
        trailerButton.closest(
          ".movie-card"
        );

      closeOtherTrailers(
        card
      );

      openTrailer(
        card,
        trailerButton.dataset.trailer
      );

      return;
    }

    const trailerClose =
      event.target.closest(
        ".trailer-close"
      );

    if (trailerClose) {
      closeTrailer(
        trailerClose.closest(
          ".movie-card"
        )
      );

      return;
    }

    const detailsButton =
      event.target.closest(
        ".details-button"
      );

    if (detailsButton) {
      const source =
        detailsButton.dataset.source;

      const mediaType =
        detailsButton.dataset.mediaType ||
        "movie";

      const id =
        detailsButton.dataset.movieId;

      if (
        source ===
        "tmdb"
      ) {
        const item =
          getTmdbItemFromAnySource(
            id,
            mediaType
          );

        if (item) {
          openTmdbDetails(
            item
          );
        }
      } else {
        const item =
          movies.find(
            local =>
              String(local.id) ===
              String(id)
          );

        if (item) {
          openLocalDetails(
            item
          );
        }
      }

      return;
    }

    const favoriteButton =
      event.target.closest(
        ".favorite-button"
      );

    if (favoriteButton) {
      const source =
        favoriteButton.dataset.source ||
        "local";

      const mediaType =
        favoriteButton.dataset.mediaType ||
        "movie";

      const id =
        favoriteButton.dataset.movieId;

      if (
        source ===
        "tmdb"
      ) {
        const item =
          getTmdbItemFromAnySource(
            id,
            mediaType
          );

        if (item) {
          toggleMyList(
            item,
            "tmdb"
          );
        }
      } else {
        const item =
          movies.find(
            local =>
              String(local.id) ===
              String(id)
          );

        if (item) {
          toggleMyList(
            item,
            "local"
          );
        }
      }

      return;
    }

    const modalFavorite =
      event.target.closest(
        "#modalFavoriteButton"
      );

    if (
      modalFavorite &&
      modalFavorite.style.display !==
        "none"
    ) {
      const source =
        modalFavorite.dataset.source ||
        "local";

      const mediaType =
        modalFavorite.dataset.mediaType ||
        "movie";

      const id =
        modalFavorite.dataset.movieId;

      if (
        source ===
        "tmdb"
      ) {
        const item =
          getTmdbItemFromAnySource(
            id,
            mediaType
          );

        if (item) {
          toggleMyList(
            item,
            "tmdb"
          );
        }
      } else {
        const item =
          movies.find(
            local =>
              String(local.id) ===
              String(id)
          );

        if (item) {
          toggleMyList(
            item,
            "local"
          );
        }
      }

      return;
    }

    if (
      event.target.closest(
        ".details-modal__close"
      ) ||
      event.target.closest(
        ".details-modal__backdrop"
      )
    ) {
      closeDetailsModal();

      return;
    }

    const modalTrailer =
      event.target.closest(
        "#modalTrailerButton"
      );

    if (
      modalTrailer &&
      modalTrailer.style.display !==
        "none"
    ) {
      const watchUrl =
        modalTrailer.dataset.watchUrl;

      if (watchUrl) {
        window.open(
          watchUrl,
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }

      const trailer =
        modalTrailer.dataset.trailer;

      if (trailer) {
        window.open(
          trailer.replace(
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
      event.key ===
        "ArrowRight" &&
      !searchPanel.classList.contains(
        "is-open"
      )
    ) {
      showNextHero();
      restartHeroAutoplay();
    }

    if (
      event.key ===
        "ArrowLeft" &&
      !searchPanel.classList.contains(
        "is-open"
      )
    ) {
      showPreviousHero();
      restartHeroAutoplay();
    }

    if (
      event.key !==
      "Escape"
    ) {
      return;
    }

    document
      .querySelectorAll(
        ".movie-card.is-playing"
      )
      .forEach(
        closeTrailer
      );

    const modal =
      document.getElementById(
        "detailsModal"
      );

    if (
      modal.classList.contains(
        "is-open"
      )
    ) {
      closeDetailsModal();
    }

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
   VISIBILIDADE
====================================================== */

document.addEventListener(
  "visibilitychange",
  () => {
    if (
      document.hidden
    ) {
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

renderCombinedSearchResults();

initializeHero();

loadTmdbMovies();

loadTmdbSeries();
