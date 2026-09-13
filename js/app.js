const featuredMoviesContainer = document.getElementById("featuredMovies");
const seriesGrid = document.getElementById("seriesGrid");


/* ======================================================
   CRIAÇÃO DOS CARDS
====================================================== */

function createMovieCard(movie) {
  const article = document.createElement("article");

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
          data-trailer="${movie.trailer}"
        >
          ▶
        </button>

        <button
          class="details-button"
          aria-label="Ver mais informações sobre ${movie.title}"
          data-movie-id="${movie.id}"
        >
          ⓘ
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
   FILMES EM DESTAQUE
====================================================== */

function renderFeaturedMovies() {
  if (!featuredMoviesContainer) {
    return;
  }

  const featuredMovies = movies.filter(
    movie => movie.featured
  );

  featuredMoviesContainer.innerHTML = "";

  featuredMovies.forEach(movie => {
    const card = createMovieCard(movie);

    featuredMoviesContainer.appendChild(card);
  });
}


/* ======================================================
   SÉRIES
====================================================== */

function renderSeries() {
  if (!seriesGrid) {
    return;
  }

  const series = movies.filter(
    movie => movie.type === "series"
  );

  seriesGrid.innerHTML = "";

  series.forEach(seriesItem => {
    const card = createMovieCard(seriesItem);

    seriesGrid.appendChild(card);
  });
}


/* ======================================================
   MINI TRAILER
====================================================== */

function openTrailer(card, trailerUrl) {
  const trailerLayer =
    card.querySelector(".movie-card__trailer");

  const iframe =
    trailerLayer.querySelector("iframe");

  iframe.src =
    `${trailerUrl}?autoplay=1&mute=1&rel=0`;

  card.classList.add("is-playing");
}


function closeTrailer(card) {
  const trailerLayer =
    card.querySelector(".movie-card__trailer");

  const iframe =
    trailerLayer.querySelector("iframe");

  iframe.src = "";

  card.classList.remove("is-playing");
}


function closeOtherTrailers(currentCard) {
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
  const modal = document.createElement("div");

  modal.classList.add("details-modal");
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
        <div class="details-modal__icon" id="modalIcon">
          🎬
        </div>
      </div>

      <div class="details-modal__body">

        <span class="section-label">
          CineAI
        </span>

        <h2 id="modalTitle"></h2>

        <div class="details-modal__meta" id="modalMeta"></div>

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

        </div>

      </div>

    </div>
  `;

  document.body.appendChild(modal);
}


function openDetailsModal(movie) {
  const modal =
    document.getElementById("detailsModal");

  if (!modal) {
    return;
  }

  const content =
    modal.querySelector(".details-modal__content");

  const icon =
    document.getElementById("modalIcon");

  const title =
    document.getElementById("modalTitle");

  const meta =
    document.getElementById("modalMeta");

  const description =
    document.getElementById("modalDescription");

  const trailerButton =
    document.getElementById("modalTrailerButton");

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

  modal.classList.add("is-open");

  document.body.classList.add("modal-open");
}


function closeDetailsModal() {
  const modal =
    document.getElementById("detailsModal");

  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");

  document.body.classList.remove("modal-open");
}


/* ======================================================
   EVENTOS
====================================================== */

document.addEventListener("click", event => {

  const trailerButton =
    event.target.closest(".trailer-button");

  if (trailerButton) {

    const card =
      trailerButton.closest(".movie-card");

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
    event.target.closest(".trailer-close");

  if (closeTrailerButton) {

    const card =
      closeTrailerButton.closest(".movie-card");

    closeTrailer(card);

    return;
  }


  const detailsButton =
    event.target.closest(".details-button");

  if (detailsButton) {

    const movieId =
      Number(detailsButton.dataset.movieId);

    const movie =
      movies.find(
        item => item.id === movieId
      );

    if (movie) {
      openDetailsModal(movie);
    }

    return;
  }


  const modalClose =
    event.target.closest(".details-modal__close");

  const modalBackdrop =
    event.target.closest(".details-modal__backdrop");

  if (modalClose || modalBackdrop) {
    closeDetailsModal();

    return;
  }


  const modalTrailerButton =
    event.target.closest("#modalTrailerButton");

  if (modalTrailerButton) {

    const trailerUrl =
      modalTrailerButton.dataset.trailer;

    if (trailerUrl) {
      window.open(
        trailerUrl.replace(
          "/embed/",
          "/watch?v="
        ),
        "_blank"
      );
    }
  }

});


/* ======================================================
   TECLA ESC
====================================================== */

document.addEventListener("keydown", event => {

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
});


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

createDetailsModal();

renderFeaturedMovies();

renderSeries();
