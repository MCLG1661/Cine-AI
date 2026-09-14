/* ======================================================
   CINEAI — PAGINAÇÃO DA BUSCA TMDB
   FASE 8.9B
====================================================== */


/* ======================================================
   ESTADO DA PAGINAÇÃO
====================================================== */

let searchPaginationQuery =
  "";

let searchCurrentPage =
  0;

let searchTotalPages =
  0;

let searchHasMore =
  false;

let searchNextPage =
  null;

let searchLoadingMore =
  false;


/* ======================================================
   RESET DA PAGINAÇÃO
====================================================== */

function resetSearchPagination(
  query = ""
) {

  searchPaginationQuery =
    query;

  searchCurrentPage =
    0;

  searchTotalPages =
    0;

  searchHasMore =
    false;

  searchNextPage =
    null;

  searchLoadingMore =
    false;
}


/* ======================================================
   NORMALIZAÇÃO DOS RESULTADOS TMDB
====================================================== */

function normalizeTmdbSearchMovies(
  results = []
) {

  return results.map(
    movie => ({
      ...movie,
      source:
        "tmdb"
    })
  );
}


/* ======================================================
   REMOVE DUPLICADOS
====================================================== */

function mergeTmdbSearchResults(
  currentResults,
  newResults
) {

  const movieMap =
    new Map();


  currentResults.forEach(
    movie => {

      movieMap.set(
        String(
          movie.id
        ),
        movie
      );
    }
  );


  newResults.forEach(
    movie => {

      movieMap.set(
        String(
          movie.id
        ),
        movie
      );
    }
  );


  return Array.from(
    movieMap.values()
  );
}


/* ======================================================
   LOADING INICIAL DA BUSCA
====================================================== */

function renderPaginatedSearchLoading(
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


  const loading =
    document.createElement(
      "div"
    );


  loading.className =
    "empty-list";


  loading.style.marginTop =
    "24px";


  loading.innerHTML =
    `
      <span>
        🔎
      </span>

      <p>
        Pesquisando também no TMDB...
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
   BOTÃO CARREGAR MAIS
====================================================== */

function createLoadMoreButton() {

  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    "search-load-more-wrapper";


  wrapper.style.display =
    "flex";

  wrapper.style.justifyContent =
    "center";

  wrapper.style.width =
    "100%";

  wrapper.style.margin =
    "32px 0 8px";


  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.id =
    "searchLoadMore";


  button.className =
    "button button--secondary search-load-more";


  button.textContent =
    searchLoadingMore
      ? "Carregando..."
      : "Carregar mais";


  button.disabled =
    searchLoadingMore;


  button.setAttribute(
    "aria-label",
    searchLoadingMore
      ? "Carregando mais filmes"
      : "Carregar mais resultados da busca"
  );


  wrapper.appendChild(
    button
  );


  return wrapper;
}


/* ======================================================
   NOVO RENDER DA BUSCA
====================================================== */

renderCombinedSearchResults =
  function (
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
      movie => {

        grid.appendChild(
          createMovieCard(
            movie
          )
        );
      }
    );


    tmdbResults.forEach(
      movie => {

        grid.appendChild(
          createTmdbMovieCard(
            movie
          )
        );
      }
    );


    searchResults.appendChild(
      grid
    );


    const currentQuery =
      searchInput.value.trim();


    if (
      currentQuery.length >=
        MIN_TMDB_SEARCH_LENGTH &&
      searchHasMore
    ) {

      searchResults.appendChild(
        createLoadMoreButton()
      );
    }
  };


/* ======================================================
   NOVA BUSCA TMDB — PÁGINA 1
====================================================== */

searchTmdbMovies =
  async function (
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


    if (searchController) {

      searchController.abort();
    }


    const normalizedQuery =
      normalizeText(
        query
      );


    const normalizedPaginationQuery =
      normalizeText(
        searchPaginationQuery
      );


    if (
      normalizedQuery !==
        normalizedPaginationQuery
    ) {

      tmdbSearchResults =
        [];


      resetSearchPagination(
        query
      );
    }


    searchController =
      new AbortController();


    const currentController =
      searchController;


    const localResults =
      getFilteredLocalMovies();


    renderPaginatedSearchLoading(
      localResults
    );


    try {

      const url =
        `${CINEAI_API_URL}?q=${encodeURIComponent(
          query
        )}&page=1`;


      const response =
        await fetch(
          url,
          {
            signal:
              currentController.signal
          }
        );


      if (!response.ok) {

        throw new Error(
          `Busca respondeu com status ${response.status}`
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
          "Formato inesperado da busca"
        );
      }


      if (
        normalizeText(
          searchInput.value.trim()
        ) !==
        normalizedQuery
      ) {

        return;
      }


      tmdbSearchResults =
        normalizeTmdbSearchMovies(
          data.results
        );


      activeSearchQuery =
        query;


      searchPaginationQuery =
        query;


      searchCurrentPage =
        Number(
          data.page
        ) || 1;


      searchTotalPages =
        Number(
          data.totalPages
        ) || 0;


      searchHasMore =
        Boolean(
          data.hasMore
        );


      searchNextPage =
        data.nextPage
          ? Number(
              data.nextPage
            )
          : null;


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


      resetSearchPagination(
        query
      );


      renderCombinedSearchResults(
        true
      );


    } finally {

      if (
        searchController ===
          currentController
      ) {

        searchController =
          null;
      }
    }
  };


/* ======================================================
   CARREGAR PRÓXIMA PÁGINA
====================================================== */

async function loadMoreTmdbMovies() {

  if (
    searchLoadingMore ||
    !searchHasMore ||
    !searchNextPage
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


  if (
    normalizeText(
      query
    ) !==
    normalizeText(
      searchPaginationQuery
    )
  ) {

    return;
  }


  searchLoadingMore =
    true;


  renderCombinedSearchResults();


  try {

    const url =
      `${CINEAI_API_URL}?q=${encodeURIComponent(
        query
      )}&page=${searchNextPage}`;


    const response =
      await fetch(
        url
      );


    if (!response.ok) {

      throw new Error(
        `Paginação respondeu com status ${response.status}`
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
        "Formato inesperado da paginação"
      );
    }


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


    const newMovies =
      normalizeTmdbSearchMovies(
        data.results
      );


    tmdbSearchResults =
      mergeTmdbSearchResults(
        tmdbSearchResults,
        newMovies
      );


    searchCurrentPage =
      Number(
        data.page
      ) ||
      searchCurrentPage;


    searchTotalPages =
      Number(
        data.totalPages
      ) ||
      searchTotalPages;


    searchHasMore =
      Boolean(
        data.hasMore
      );


    searchNextPage =
      data.nextPage
        ? Number(
            data.nextPage
          )
        : null;


  } catch (error) {

    console.error(
      "Erro ao carregar mais filmes:",
      error
    );


  } finally {

    searchLoadingMore =
      false;


    renderCombinedSearchResults();
  }
}


/* ======================================================
   RESET QUANDO A BUSCA MUDA
====================================================== */

searchInput.addEventListener(
  "input",
  () => {

    const query =
      searchInput.value.trim();


    if (
      normalizeText(
        query
      ) !==
      normalizeText(
        searchPaginationQuery
      )
    ) {

      resetSearchPagination(
        query
      );
    }


    if (
      query.length <
        MIN_TMDB_SEARCH_LENGTH
    ) {

      tmdbSearchResults =
        [];


      renderCombinedSearchResults();
    }
  }
);


/* ======================================================
   CLIQUE EM CARREGAR MAIS
====================================================== */

document.addEventListener(
  "click",
  event => {

    const loadMoreButton =
      event.target.closest(
        "#searchLoadMore"
      );


    if (!loadMoreButton) {
      return;
    }


    loadMoreTmdbMovies();
  }
);


/* ======================================================
   ESTADO INICIAL
====================================================== */

resetSearchPagination();
