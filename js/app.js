const featuredMoviesContainer = document.getElementById("featuredMovies");
const seriesGrid = document.getElementById("seriesGrid");

function createMovieCard(movie) {
  const article = document.createElement("article");

  article.classList.add("movie-card");
  article.dataset.id = movie.id;

  article.innerHTML = `
    <div class="movie-card__image movie-placeholder">
      <span>🎬</span>
    </div>

    <div class="movie-card__content">
      <h3>${movie.title}</h3>

      <div class="movie-card__meta">
        <span>${movie.year}</span>
        <span>${movie.genre}</span>
        <span>⭐ ${movie.rating}</span>
      </div>

      <button
        class="trailer-button"
        aria-label="Assistir mini trailer de ${movie.title}"
        data-trailer="${movie.trailer}"
      >
        ▶
      </button>
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

function renderFeaturedMovies() {
  if (!featuredMoviesContainer) return;

  const featuredMovies = movies.filter(movie => movie.featured);

  featuredMoviesContainer.innerHTML = "";

  featuredMovies.forEach(movie => {
    const card = createMovieCard(movie);
    featuredMoviesContainer.appendChild(card);
  });
}

function renderSeries() {
  if (!seriesGrid) return;

  const series = movies.filter(movie => movie.type === "series");

  seriesGrid.innerHTML = "";

  series.forEach(movie => {
    const card = createMovieCard(movie);
    seriesGrid.appendChild(card);
  });
}

function openTrailer(card, trailerUrl) {
  const trailerLayer = card.querySelector(".movie-card__trailer");
  const iframe = trailerLayer.querySelector("iframe");

  iframe.src = `${trailerUrl}?autoplay=1&mute=1`;

  card.classList.add("is-playing");
}

function closeTrailer(card) {
  const trailerLayer = card.querySelector(".movie-card__trailer");
  const iframe = trailerLayer.querySelector("iframe");

  iframe.src = "";

  card.classList.remove("is-playing");
}

document.addEventListener("click", event => {
  const trailerButton = event.target.closest(".trailer-button");

  if (trailerButton) {
    const card = trailerButton.closest(".movie-card");
    const trailerUrl = trailerButton.dataset.trailer;

    openTrailer(card, trailerUrl);

    return;
  }

  const closeButton = event.target.closest(".trailer-close");

  if (closeButton) {
    const card = closeButton.closest(".movie-card");

    closeTrailer(card);
  }
});

renderFeaturedMovies();
renderSeries();
