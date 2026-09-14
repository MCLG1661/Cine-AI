const featuredMoviesContainer =
  document.getElementById(
    "featuredMovies"
  );

const seriesGrid =
  document.getElementById(
    "seriesGrid"
  );

const myListSection =
  document.getElementById(
    "minha-lista"
  );


/* ======================================================
   CONFIGURAÇÃO DA API
====================================================== */

const CINEAI_API_URL =
  "https://cine-ai.vercel.app/api/movies";


let tmdbMovies =
  [];


/* ======================================================
   HERO
====================================================== */

const hero =
  document.getElementById(
    "inicio"
  );

const heroBadge =
  document.getElementById(
    "heroBadge"
  );

const heroTitle =
  document.getElementById(
    "heroTitle"
  );

const heroMeta =
  document.getElementById(
    "heroMeta"
  );

const heroDescription =
  document.getElementById(
    "heroDescription"
  );

const heroTrailerButton =
  document.getElementById(
    "heroTrailerButton"
  );

const heroDetailsButton =
  document.getElementById(
    "heroDetailsButton"
  );

const heroPrevious =
  document.getElementById(
    "heroPrevious"
  );

const heroNext =
  document.getElementById(
    "heroNext"
  );

const heroIndicators =
  document.getElementById(
    "heroIndicators"
  );


/* ======================================================
   BUSCA
====================================================== */

const searchButton =
  document.getElementById(
    "searchButton"
  );

const searchPanel =
  document.getElementById(
    "searchPanel"
  );

const searchInput =
  document.getElementById(
    "searchInput"
  );

const searchClose =
  document.getElementById(
    "searchClose"
  );

const searchResults =
  document.getElementById(
    "searchResults"
  );

const genreFilters =
  document.getElementById(
    "genreFilters"
  );


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

function normalizeSavedItem(
  item
) {

  if (
    typeof item ===
      "number"
  ) {

    return {
      source:
        "local",

      id:
        item
    };
  }


  if (
    typeof item ===
      "string" &&
    /^\d+$/.test(
      item
    )
  ) {

    return {
      source:
        "local",

      id:
        Number(
          item
        )
    };
  }


  if (
    item &&
    typeof item ===
      "object" &&
    item.id !==
      undefined
  ) {

    const source =
      item.source ===
        "tmdb"
        ? "tmdb"
        : "local";


    return {
      source,

      id:
        Number(
          item.id
        ),

      movie:
        source ===
          "tmdb"
          ? item.movie ||
            null
          : undefined
    };
  }


  return null;
}


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
      JSON.parse(
        storedList
      );


    if (
      !Array.isArray(
        parsedList
      )
    ) {
      return [];
    }


    const normalized =
      parsedList
        .map(
          normalizeSavedItem
        )
        .filter(
          Boolean
        );


    const uniqueItems =
      [];


    const usedKeys =
      new Set();


    normalized.forEach(
      item => {

        const key =
          `${item.source}:${item.id}`;


        if (
          usedKeys.has(
            key
          )
        ) {
          return;
        }


        usedKeys.add(
          key
        );


        uniqueItems.push(
          item
        );
      }
    );


    return uniqueItems;


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
      JSON.stringify(
        myList
      )
    );


  } catch (error) {

    console.error(
      "Erro ao salvar Minha Lista:",
      error
    );
  }
}


function getListKey(
  source,
  movieId
) {

  return `${source}:${movieId}`;
}


function isInMyList(
  movieId,
  source = "local"
) {

  const key =
    getListKey(
      source,
      movieId
    );


  return myList.some(
    item =>
      getListKey(
        item.source,
        item.id
      ) === key
  );
}


function createTmdbSnapshot(
  movie
) {

  return {

    id:
      movie.id,

    title:
      movie.title,

    originalTitle:
      movie.originalTitle ||
      null,

    description:
      movie.description ||
      "Sinopse não disponível.",

    releaseDate:
      movie.releaseDate ||
      null,

    rating:
      movie.rating || 0,

    voteCount:
      movie.voteCount || 0,

    popularity:
      movie.popularity || 0,

    genres:
      Array.isArray(
        movie.genres
      )
        ? movie.genres
        : [],

    poster:
      movie.poster ||
      null,

    backdrop:
      movie.backdrop ||
      null,

    trailer:
      movie.trailer ||
      null,

    trailerWatchUrl:
      movie.trailerWatchUrl ||
      null,

    trailerName:
      movie.trailerName ||
      null,

    trailerOfficial:
      Boolean(
        movie.trailerOfficial
      ),

    trailerLanguage:
      movie.trailerLanguage ||
      null,

    source:
      "tmdb"

  };
}


function toggleMyList(
  movie,
  source = "local"
) {

  if (!movie) {
    return;
  }


  const movieId =
    Number(
      movie.id
    );


  const key =
    getListKey(
      source,
      movieId
    );


  const exists =
    myList.some(
      item =>
        getListKey(
          item.source,
          item.id
        ) === key
    );


  if (exists) {

    myList =
      myList.filter(
        item =>
          getListKey(
            item.source,
            item.id
          ) !== key
      );


  } else {

    if (
      source ===
        "tmdb"
    ) {

      myList.push({

        source:
          "tmdb",

        id:
          movieId,

        movie:
          createTmdbSnapshot(
            movie
          )

      });


    } else {

      myList.push({

        source:
          "local",

        id:
          movieId

      });
    }
  }


  saveMyList();

  refreshInterface();
}


/* ======================================================
   UTILITÁRIOS
====================================================== */

function getTypeLabel(
  movie
) {

  return movie.type ===
    "series"
    ? "Série"
    : "Filme";
}


function normalizeText(
  text
) {

  return String(
    text || ""
  )
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}


function getYearFromDate(
  date
) {

  if (!date) {
    return "—";
  }


  return String(
    date
  ).slice(
    0,
    4
  );
}


function getTmdbMovieById(
  id
) {

  return tmdbMovies.find(
    movie =>
      String(
        movie.id
      ) === String(
        id
      )
  );
}


function getSavedTmdbMovieById(
  id
) {

  const savedItem =
    myList.find(
      item =>
        item.source ===
          "tmdb" &&
        String(
          item.id
        ) === String(
          id
        )
    );


  return savedItem
    ?.movie ||
    null;
}


function getTmdbMovieFromAnySource(
  id
) {

  return (
    getTmdbMovieById(
      id
    ) ||
    getSavedTmdbMovieById(
      id
    ) ||
    null
  );
}


function isTmdbMovie(
  movie
) {

  return movie?.source ===
    "tmdb";
}


function getTmdbGenres(
  movie
) {

  if (
    !movie?.genres ||
    movie.genres.length ===
      0
  ) {

    return "Cinema";
  }


  return movie.genres
    .slice(
      0,
      3
    )
    .join(
      " • "
    );
}


function getWatchUrl(
  movie
) {

  if (
    movie?.trailerWatchUrl
  ) {

    return movie.trailerWatchUrl;
  }


  if (
    movie?.trailer
  ) {

    return movie.trailer.replace(
      "/embed/",
      "/watch?v="
    );
  }


  return null;
}


/* ======================================================
   TMDB
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
        movie => ({
          ...movie,
          source:
            "tmdb"
        })
      );


    renderFeaturedMovies();

    renderMyList();

    initializeTmdbHero();


  } catch (error) {

    console.error(
      "Erro ao carregar filmes do TMDB:",
      error
    );


    renderFeaturedFallback();

    renderMyList();
  }
}


function renderFeaturedLoading() {

  featuredMoviesContainer.innerHTML =
    `
      <div
        class="empty-list"
        style="grid-column: 1 / -1;"
      >

        <span>
          🎬
        </span>

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

  const featuredLocalMovies =
    movies.filter(
      movie =>
        movie.featured
    );


  featuredMoviesContainer.innerHTML =
    "";


  featuredLocalMovies.forEach(
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
   HERO LOCAL — FALLBACK
====================================================== */

function initializeHero() {

  heroMovies =
    movies
      .filter(
        movie =>
          movie.featured
      )
      .map(
        movie => ({
          ...movie,
          source:
            "local"
        })
      );


  if (
    heroMovies.length === 0
  ) {

    heroMovies =
      movies
        .slice(
          0,
          4
        )
        .map(
          movie => ({
            ...movie,
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


/* ======================================================
   HERO TMDB
====================================================== */

function initializeTmdbHero() {

  const moviesWithBackdrop =
    tmdbMovies.filter(
      movie =>
        movie.backdrop
    );


  const sourceMovies =
    moviesWithBackdrop.length >=
      5
      ? moviesWithBackdrop
      : tmdbMovies;


  if (
    sourceMovies.length === 0
  ) {
    return;
  }


  heroMovies =
    sourceMovies
      .slice(
        0,
        5
      )
      .map(
        movie => ({
          ...movie,
          source:
            "tmdb"
        })
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


/* ======================================================
   RENDER DO HERO
====================================================== */

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


  if (
    isTmdbMovie(
      movie
    )
  ) {

    renderTmdbHero(
      movie
    );


  } else {

    renderLocalHero(
      movie
    );
  }


  updateHeroIndicators();
}


function renderLocalHero(
  movie
) {

  hero.style.background =
    `
      linear-gradient(
        to right,
        rgba(8, 11, 18, 0.98) 5%,
        rgba(8, 11, 18, 0.84) 44%,
        rgba(8, 11, 18, 0.34) 74%,
        rgba(8, 11, 18, 0.82) 100%
      ),
      ${movie.posterGradient}
    `;


  heroBadge.textContent =
    `${getTypeLabel(movie)} em destaque`;


  heroTitle.textContent =
    movie.title;


  heroMeta.innerHTML =
    `
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


  heroDescription.textContent =
    movie.description;


  heroTrailerButton.style.display =
    "";


  heroTrailerButton.dataset.trailer =
    movie.trailer ||
    "";


  heroDetailsButton.dataset.movieId =
    movie.id;


  heroDetailsButton.dataset.source =
    "local";
}


function renderTmdbHero(
  movie
) {

  const heroImage =
    movie.backdrop ||
    movie.poster;


  if (heroImage) {

    hero.style.background =
      `
        linear-gradient(
          to right,
          rgba(8, 11, 18, 0.98) 4%,
          rgba(8, 11, 18, 0.90) 31%,
          rgba(8, 11, 18, 0.58) 57%,
          rgba(8, 11, 18, 0.28) 78%,
          rgba(8, 11, 18, 0.66) 100%
        ),
        linear-gradient(
          to top,
          rgba(8, 11, 18, 0.95) 0%,
          rgba(8, 11, 18, 0.12) 45%
        ),
        url("${heroImage}")
        center / cover
        no-repeat
      `;


  } else {

    hero.style.background =
      `
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
    movie.title;


  heroMeta.innerHTML =
    `
      <span>
        ${getYearFromDate(
          movie.releaseDate
        )}
      </span>

      <span>
        ${getTmdbGenres(
          movie
        )}
      </span>

      <span>
        ⭐ ${movie.rating}
      </span>

      <span>
        ${movie.voteCount || 0}
        avaliações
      </span>
    `;


  heroDescription.textContent =
    movie.description ||
    "Sinopse não disponível.";


  if (
    movie.trailer
  ) {

    heroTrailerButton.style.display =
      "";


    heroTrailerButton.dataset.trailer =
      movie.trailer;


  } else {

    heroTrailerButton.style.display =
      "none";


    heroTrailerButton.dataset.trailer =
      "";
  }


  heroDetailsButton.dataset.movieId =
    movie.id;


  heroDetailsButton.dataset.source =
    "tmdb";
}


/* ======================================================
   INDICADORES DO HERO
====================================================== */

function renderHeroIndicators() {

  if (!heroIndicators) {
    return;
  }


  heroIndicators.innerHTML =
    "";


  heroMovies.forEach(
    (
      movie,
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
        `Mostrar ${movie.title}`
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


/* ======================================================
   NAVEGAÇÃO DO HERO
====================================================== */

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


function goToHero(
  index
) {

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

  const movie =
    getCurrentHeroMovie();


  if (!movie) {
    return;
  }


  const watchUrl =
    getWatchUrl(
      movie
    );


  if (!watchUrl) {
    return;
  }


  window.open(
    watchUrl,
    "_blank",
    "noopener,noreferrer"
  );
}


/* ======================================================
   CARD LOCAL
====================================================== */

function createMovieCard(
  movie
) {

  const article =
    document.createElement(
      "article"
    );


  const saved =
    isInMyList(
      movie.id,
      "local"
    );


  article.className =
    "movie-card";


  article.dataset.id =
    movie.id;


  article.innerHTML =
    `
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
            ${getTypeLabel(movie)}
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
            data-trailer="${movie.trailer}"
            title="Assistir mini trailer"
            aria-label="Assistir mini trailer de ${movie.title}"
          >
            ▶
          </button>


          <button
            class="details-button"
            data-source="local"
            data-movie-id="${movie.id}"
            title="Mais informações"
            aria-label="Mais informações sobre ${movie.title}"
          >
            ⓘ
          </button>


          <button
            class="favorite-button ${saved ? "is-saved" : ""}"
            data-source="local"
            data-movie-id="${movie.id}"
            title="Minha Lista"
            aria-label="Adicionar ou remover ${movie.title} da Minha Lista"
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
   CARD TMDB
====================================================== */

function createTmdbMovieCard(
  movie
) {

  const article =
    document.createElement(
      "article"
    );


  const saved =
    isInMyList(
      movie.id,
      "tmdb"
    );


  article.className =
    "movie-card";


  article.dataset.id =
    movie.id;


  const year =
    getYearFromDate(
      movie.releaseDate
    );


  const genreText =
    movie.genres?.length
      ? movie.genres
          .slice(
            0,
            2
          )
          .join(" • ")
      : "Cinema";


  const posterBackground =
    movie.poster
      ? `
        linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.02),
          rgba(0, 0, 0, 0.12) 50%,
          rgba(0, 0, 0, 0.9)
        ),
        url("${movie.poster}")
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


  const trailerButton =
    movie.trailer
      ? `
          <button
            class="trailer-button"
            data-trailer="${movie.trailer}"
            title="Assistir trailer"
            aria-label="Assistir trailer de ${movie.title}"
          >
            ▶
          </button>
        `
      : "";


  article.innerHTML =
    `
      <div
        class="movie-card__poster"
        style='background: ${posterBackground};'
      >

        <div
          class="movie-card__poster-top"
        >

          <span
            class="movie-type-badge"
          >
            TMDB
          </span>


          <span
            class="movie-rating-badge"
          >
            ★ ${movie.rating}
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
            ${movie.title}
          </h3>


          <div
            class="movie-card__meta"
          >

            <span>
              ${year}
            </span>

            <span>
              ${genreText}
            </span>

            <span>
              ⭐ ${movie.rating}
            </span>

          </div>

        </div>


        <div
          class="movie-card__actions"
        >

          ${trailerButton}


          <button
            class="details-button"
            data-source="tmdb"
            data-movie-id="${movie.id}"
            title="Mais informações"
            aria-label="Mais informações sobre ${movie.title}"
          >
            ⓘ
          </button>


          <button
            class="favorite-button ${saved ? "is-saved" : ""}"
            data-source="tmdb"
            data-movie-id="${movie.id}"
            title="Minha Lista"
            aria-label="Adicionar ou remover ${movie.title} da Minha Lista"
          >
            ${saved ? "♥" : "♡"}
          </button>

        </div>

      </div>


      ${
        movie.trailer
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
                  title="Trailer de ${movie.title}"
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
   FILMES EM DESTAQUE
====================================================== */

function renderFeaturedMovies() {

  if (
    !featuredMoviesContainer
  ) {
    return;
  }


  if (
    tmdbMovies.length === 0
  ) {

    renderFeaturedFallback();

    return;
  }


  featuredMoviesContainer.innerHTML =
    "";


  tmdbMovies
    .slice(
      0,
      8
    )
    .forEach(
      movie => {

        featuredMoviesContainer
          .appendChild(
            createTmdbMovieCard(
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
        movie.type ===
          "series"
    );


  seriesGrid.innerHTML =
    "";


  series.forEach(
    movie => {

      seriesGrid.appendChild(
        createMovieCard(
          movie
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


  const resolvedItems =
    myList
      .map(
        item => {

          if (
            item.source ===
              "local"
          ) {

            const movie =
              movies.find(
                localMovie =>
                  Number(
                    localMovie.id
                  ) === Number(
                    item.id
                  )
              );


            return movie
              ? {
                  source:
                    "local",

                  movie
                }
              : null;
          }


          const movie =
            getTmdbMovieById(
              item.id
            ) ||
            item.movie;


          return movie
            ? {
                source:
                  "tmdb",

                movie: {
                  ...movie,
                  source:
                    "tmdb"
                }
              }
            : null;
        }
      )
      .filter(
        Boolean
      );


  if (
    resolvedItems.length ===
      0
  ) {

    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "empty-list";


    empty.innerHTML =
      `
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


  resolvedItems.forEach(
    item => {

      if (
        item.source ===
          "tmdb"
      ) {

        grid.appendChild(
          createTmdbMovieCard(
            item.movie
          )
        );


      } else {

        grid.appendChild(
          createMovieCard(
            item.movie
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
   BUSCA
====================================================== */

function openSearch() {

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

      searchInput.focus();

    },
    100
  );
}


function closeSearch() {

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


  updateGenreButtons();


  renderSearchResults(
    movies
  );


  startHeroAutoplay();
}


function getFilteredMovies() {

  const searchTerm =
    normalizeText(
      searchInput.value.trim()
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
          `
        );


      const matchesSearch =
        !searchTerm ||
        searchableText.includes(
          searchTerm
        );


      const matchesGenre =
        selectedGenre ===
          "all" ||
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

  renderSearchResults(
    getFilteredMovies()
  );
}


function renderSearchResults(
  results
) {

  searchResults.innerHTML =
    "";


  if (
    results.length === 0
  ) {

    searchResults.innerHTML =
      `
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
            Tente outro termo ou gênero.
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
   TRAILER
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
    trailerUrl.includes(
      "?"
    )
      ? "&"
      : "?";


  iframe.src =
    `${trailerUrl}${separator}autoplay=1&mute=1&rel=0`;


  card.classList.add(
    "is-playing"
  );
}


function closeTrailer(
  card
) {

  if (!card) {
    return;
  }


  const iframe =
    card.querySelector(
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


  modal.innerHTML =
    `
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


/* ======================================================
   MODAL LOCAL
====================================================== */

function openLocalDetails(
  movie
) {

  const modal =
    document.getElementById(
      "detailsModal"
    );


  const modalHero =
    modal.querySelector(
      ".details-modal__hero"
    );


  modalHero.style.background =
    movie.posterGradient;


  document.getElementById(
    "modalType"
  ).textContent =
    getTypeLabel(
      movie
    );


  document.getElementById(
    "modalIcon"
  ).textContent =
    movie.icon;


  document.getElementById(
    "modalHeroTitle"
  ).textContent =
    movie.title;


  document.getElementById(
    "modalTitle"
  ).textContent =
    movie.title;


  document.getElementById(
    "modalMeta"
  ).innerHTML =
    `
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


  document.getElementById(
    "modalDescription"
  ).textContent =
    movie.description;


  const trailerButton =
    document.getElementById(
      "modalTrailerButton"
    );


  trailerButton.style.display =
    "";


  trailerButton.dataset.trailer =
    movie.trailer;


  trailerButton.dataset.watchUrl =
    getWatchUrl(
      movie
    ) ||
    "";


  const favoriteButton =
    document.getElementById(
      "modalFavoriteButton"
    );


  favoriteButton.style.display =
    "";


  favoriteButton.dataset.movieId =
    movie.id;


  favoriteButton.dataset.source =
    "local";


  updateModalFavoriteButton(
    movie.id,
    "local"
  );


  showDetailsModal();
}


/* ======================================================
   MODAL TMDB
====================================================== */

function openTmdbDetails(
  movie
) {

  const modal =
    document.getElementById(
      "detailsModal"
    );


  const modalHero =
    modal.querySelector(
      ".details-modal__hero"
    );


  if (
    movie.backdrop
  ) {

    modalHero.style.background =
      `
        linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.1),
          rgba(8, 11, 18, 0.92)
        ),
        url("${movie.backdrop}")
        center / cover
        no-repeat
      `;


  } else {

    modalHero.style.background =
      `
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
    "Filme • TMDB";


  document.getElementById(
    "modalIcon"
  ).textContent =
    "🎬";


  document.getElementById(
    "modalHeroTitle"
  ).textContent =
    movie.title;


  document.getElementById(
    "modalTitle"
  ).textContent =
    movie.title;


  const genres =
    movie.genres?.length
      ? movie.genres.join(
          " • "
        )
      : "Cinema";


  document.getElementById(
    "modalMeta"
  ).innerHTML =
    `
      <span>
        ${getYearFromDate(
          movie.releaseDate
        )}
      </span>

      <span>
        ${genres}
      </span>

      <span>
        ⭐ ${movie.rating}
      </span>
    `;


  document.getElementById(
    "modalDescription"
  ).textContent =
    movie.description ||
    "Sinopse não disponível.";


  const trailerButton =
    document.getElementById(
      "modalTrailerButton"
    );


  if (
    movie.trailer
  ) {

    trailerButton.style.display =
      "";


    trailerButton.dataset.trailer =
      movie.trailer;


    trailerButton.dataset.watchUrl =
      getWatchUrl(
        movie
      ) ||
      "";


  } else {

    trailerButton.style.display =
      "none";


    trailerButton.dataset.trailer =
      "";


    trailerButton.dataset.watchUrl =
      "";
  }


  const favoriteButton =
    document.getElementById(
      "modalFavoriteButton"
    );


  favoriteButton.style.display =
    "";


  favoriteButton.dataset.movieId =
    movie.id;


  favoriteButton.dataset.source =
    "tmdb";


  updateModalFavoriteButton(
    movie.id,
    "tmdb"
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
  movieId,
  source
) {

  const button =
    document.getElementById(
      "modalFavoriteButton"
    );


  const saved =
    isInMyList(
      movieId,
      source
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

    applySearchAndFilters();
  }


  const modalButton =
    document.getElementById(
      "modalFavoriteButton"
    );


  if (
    modalButton
      ?.dataset.movieId &&
    modalButton.style.display !==
      "none"
  ) {

    updateModalFavoriteButton(
      Number(
        modalButton
          .dataset.movieId
      ),
      modalButton
        .dataset.source ||
        "local"
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

    const movie =
      getCurrentHeroMovie();


    if (!movie) {
      return;
    }


    if (
      isTmdbMovie(
        movie
      )
    ) {

      openTmdbDetails(
        movie
      );


    } else {

      openLocalDetails(
        movie
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


      closeOtherTrailers(
        card
      );


      openTrailer(
        card,
        trailerButton
          .dataset.trailer
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
        detailsButton
          .dataset.source;


      const movieId =
        detailsButton
          .dataset.movieId;


      if (
        source ===
          "tmdb"
      ) {

        const movie =
          getTmdbMovieFromAnySource(
            movieId
          );


        if (movie) {

          openTmdbDetails(
            movie
          );
        }


      } else {

        const movie =
          movies.find(
            item =>
              String(
                item.id
              ) ===
              String(
                movieId
              )
          );


        if (movie) {

          openLocalDetails(
            movie
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
        favoriteButton
          .dataset.source ||
        "local";


      const movieId =
        favoriteButton
          .dataset.movieId;


      if (
        source ===
          "tmdb"
      ) {

        const movie =
          getTmdbMovieFromAnySource(
            movieId
          );


        if (movie) {

          toggleMyList(
            movie,
            "tmdb"
          );
        }


      } else {

        const movie =
          movies.find(
            item =>
              String(
                item.id
              ) ===
              String(
                movieId
              )
          );


        if (movie) {

          toggleMyList(
            movie,
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
      modalFavorite
        .style.display !==
        "none"
    ) {

      const source =
        modalFavorite
          .dataset.source ||
        "local";


      const movieId =
        modalFavorite
          .dataset.movieId;


      if (
        source ===
          "tmdb"
      ) {

        const movie =
          getTmdbMovieFromAnySource(
            movieId
          );


        if (movie) {

          toggleMyList(
            movie,
            "tmdb"
          );
        }


      } else {

        const movie =
          movies.find(
            item =>
              String(
                item.id
              ) ===
              String(
                movieId
              )
          );


        if (movie) {

          toggleMyList(
            movie,
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
      modalTrailer
        .style.display !==
        "none"
    ) {

      const watchUrl =
        modalTrailer
          .dataset.watchUrl;


      if (watchUrl) {

        window.open(
          watchUrl,
          "_blank",
          "noopener,noreferrer"
        );


        return;
      }


      const trailer =
        modalTrailer
          .dataset.trailer;


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

renderSearchResults(
  movies
);


/*
  Primeiro carregamos o Hero local.
  Ele funciona como fallback caso
  a API TMDB não responda.
*/

initializeHero();


/*
  Quando o TMDB responder,
  os filmes reais substituem
  automaticamente o Hero local.
*/

loadTmdbMovies();
