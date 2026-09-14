const TMDB_BASE_URL =
  "https://api.themoviedb.org/3";

const TMDB_IMAGE_URL =
  "https://image.tmdb.org/t/p";

/*
  Performance:
  antes o carregamento inicial consultava trailers
  para até 10 títulos por categoria.
  Agora enriquecemos somente os 3 primeiros.
*/
const TRAILER_ITEMS_LIMIT = 3;

const SEARCH_TRAILER_LIMIT = 4;


/* ======================================================
   HEADERS
====================================================== */

function setCorsHeaders(response) {
  response.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS"
  );

  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
}


function setCacheHeaders(
  response,
  isSearch = false
) {
  response.setHeader(
    "Cache-Control",
    isSearch
      ? "public, s-maxage=300, stale-while-revalidate=3600"
      : "public, s-maxage=900, stale-while-revalidate=86400"
  );
}


/* ======================================================
   TIPO DE CONTEÚDO
====================================================== */

function getMediaType(request) {
  const rawType =
    Array.isArray(request.query?.type)
      ? request.query.type[0]
      : request.query?.type;

  return rawType === "tv"
    ? "tv"
    : "movie";
}


/* ======================================================
   PÁGINA
====================================================== */

function getSearchPage(request) {
  const rawPage =
    Array.isArray(request.query?.page)
      ? request.query.page[0]
      : request.query?.page;

  const parsedPage =
    Number.parseInt(
      rawPage,
      10
    );

  if (
    !Number.isInteger(parsedPage) ||
    parsedPage < 1
  ) {
    return 1;
  }

  return Math.min(
    parsedPage,
    500
  );
}


/* ======================================================
   QUERY
====================================================== */

function getSearchQuery(request) {
  const rawQuery =
    Array.isArray(request.query?.q)
      ? request.query.q[0]
      : request.query?.q;

  return String(
    rawQuery || ""
  )
    .trim()
    .slice(
      0,
      100
    );
}


/* ======================================================
   FETCH TMDB
====================================================== */

async function fetchTmdbJson(
  url,
  headers,
  errorCode
) {
  const response =
    await fetch(
      url,
      {
        headers
      }
    );

  if (!response.ok) {
    const errorData =
      await response.text();

    console.error(
      `Erro TMDB ${errorCode}:`,
      response.status,
      errorData
    );

    throw new Error(
      errorCode
    );
  }

  return response.json();
}


/* ======================================================
   SELEÇÃO DE TRAILER
====================================================== */

function selectBestTrailer(
  videos = []
) {
  const youtubeVideos =
    videos.filter(
      video =>
        video.site === "YouTube" &&
        video.key
    );

  if (
    youtubeVideos.length === 0
  ) {
    return null;
  }

  const officialTrailers =
    youtubeVideos.filter(
      video =>
        video.type === "Trailer" &&
        video.official
    );

  const trailers =
    youtubeVideos.filter(
      video =>
        video.type === "Trailer"
    );

  const officialTeasers =
    youtubeVideos.filter(
      video =>
        video.type === "Teaser" &&
        video.official
    );

  const teasers =
    youtubeVideos.filter(
      video =>
        video.type === "Teaser"
    );

  const selected =
    officialTrailers[0] ||
    trailers[0] ||
    officialTeasers[0] ||
    teasers[0] ||
    youtubeVideos[0];

  if (!selected) {
    return null;
  }

  return {
    id:
      selected.id ||
      null,

    name:
      selected.name ||
      "Trailer",

    key:
      selected.key,

    site:
      selected.site,

    type:
      selected.type,

    official:
      Boolean(
        selected.official
      ),

    language:
      selected.iso_639_1 ||
      null,

    country:
      selected.iso_3166_1 ||
      null,

    publishedAt:
      selected.published_at ||
      null,

    embedUrl:
      `https://www.youtube.com/embed/${selected.key}`,

    watchUrl:
      `https://www.youtube.com/watch?v=${selected.key}`
  };
}


/* ======================================================
   TRAILER
====================================================== */

async function fetchTrailer(
  itemId,
  mediaType,
  headers
) {
  const endpoint =
    mediaType === "tv"
      ? "tv"
      : "movie";

  const ptUrl =
    `${TMDB_BASE_URL}/${endpoint}/${itemId}/videos?language=pt-BR`;

  const enUrl =
    `${TMDB_BASE_URL}/${endpoint}/${itemId}/videos?language=en-US`;

  try {
    /*
      PT-BR e EN-US são consultados em paralelo.
      Isso reduz bastante o tempo de resposta
      comparado à consulta sequencial anterior.
    */
    const [
      ptResult,
      enResult
    ] =
      await Promise.allSettled([
        fetch(
          ptUrl,
          {
            headers
          }
        ),

        fetch(
          enUrl,
          {
            headers
          }
        )
      ]);

    if (
      ptResult.status ===
        "fulfilled" &&
      ptResult.value.ok
    ) {
      const ptData =
        await ptResult.value.json();

      const ptTrailer =
        selectBestTrailer(
          ptData.results || []
        );

      if (ptTrailer) {
        return ptTrailer;
      }
    }

    if (
      enResult.status ===
        "fulfilled" &&
      enResult.value.ok
    ) {
      const enData =
        await enResult.value.json();

      return selectBestTrailer(
        enData.results || []
      );
    }

    return null;

  } catch (error) {
    console.error(
      `Erro ao consultar trailer ${mediaType} ${itemId}:`,
      error
    );

    return null;
  }
}


/* ======================================================
   MAPEAMENTO
====================================================== */

function mapItem(
  item,
  genreMap,
  mediaType,
  trailer = null
) {
  const isTv =
    mediaType === "tv";

  return {
    id:
      item.id,

    mediaType,

    type:
      isTv
        ? "series"
        : "movie",

    title:
      isTv
        ? item.name
        : item.title,

    originalTitle:
      isTv
        ? item.original_name
        : item.original_title,

    description:
      item.overview ||
      "Sinopse não disponível.",

    releaseDate:
      isTv
        ? item.first_air_date ||
          null
        : item.release_date ||
          null,

    rating:
      Number(
        item.vote_average
          ?.toFixed(1)
      ) || 0,

    voteCount:
      item.vote_count ||
      0,

    popularity:
      item.popularity ||
      0,

    genres:
      (
        item.genre_ids ||
        []
      )
        .map(
          genreId =>
            genreMap[
              genreId
            ]
        )
        .filter(Boolean),

    originCountry:
      isTv
        ? item.origin_country ||
          []
        : [],

    originalLanguage:
      item.original_language ||
      null,

    /*
      Redução importante do peso das imagens.
      O projeto não precisa de poster w500
      nem backdrop "original" para este layout.
    */
    poster:
      item.poster_path
        ? `${TMDB_IMAGE_URL}/w342${item.poster_path}`
        : null,

    backdrop:
      item.backdrop_path
        ? `${TMDB_IMAGE_URL}/w1280${item.backdrop_path}`
        : null,

    trailer:
      trailer?.embedUrl ||
      null,

    trailerWatchUrl:
      trailer?.watchUrl ||
      null,

    trailerName:
      trailer?.name ||
      null,

    trailerOfficial:
      trailer?.official ||
      false,

    trailerLanguage:
      trailer?.language ||
      null
  };
}


/* ======================================================
   ENRIQUECIMENTO DE TRAILERS
====================================================== */

async function enrichWithTrailers(
  sourceItems,
  genreMap,
  mediaType,
  headers,
  limit
) {
  const itemsForTrailers =
    sourceItems.slice(
      0,
      limit
    );

  if (
    itemsForTrailers.length === 0
  ) {
    return sourceItems.map(
      item =>
        mapItem(
          item,
          genreMap,
          mediaType
        )
    );
  }

  const trailers =
    await Promise.all(
      itemsForTrailers.map(
        item =>
          fetchTrailer(
            item.id,
            mediaType,
            headers
          )
      )
    );

  const trailerMap =
    new Map();

  itemsForTrailers.forEach(
    (
      item,
      index
    ) => {
      trailerMap.set(
        item.id,
        trailers[index] ||
        null
      );
    }
  );

  return sourceItems.map(
    item =>
      mapItem(
        item,
        genreMap,
        mediaType,
        trailerMap.get(
          item.id
        ) ||
        null
      )
  );
}


/* ======================================================
   GÊNEROS
====================================================== */

async function fetchGenres(
  mediaType,
  headers
) {
  const data =
    await fetchTmdbJson(
      `${TMDB_BASE_URL}/genre/${mediaType}/list?language=pt-BR`,
      headers,
      "GENRES_ERROR"
    );

  return Object.fromEntries(
    (
      data.genres ||
      []
    ).map(
      genre => [
        genre.id,
        genre.name
      ]
    )
  );
}


/* ======================================================
   BUSCA RAW
====================================================== */

async function fetchSearchRaw(
  searchQuery,
  searchPage,
  mediaType,
  headers
) {
  const endpoint =
    mediaType === "tv"
      ? "tv"
      : "movie";

  const searchUrl =
    new URL(
      `${TMDB_BASE_URL}/search/${endpoint}`
    );

  searchUrl.searchParams.set(
    "query",
    searchQuery
  );

  searchUrl.searchParams.set(
    "language",
    "pt-BR"
  );

  searchUrl.searchParams.set(
    "include_adult",
    "false"
  );

  searchUrl.searchParams.set(
    "page",
    String(
      searchPage
    )
  );

  if (
    mediaType === "movie"
  ) {
    searchUrl.searchParams.set(
      "region",
      "BR"
    );
  }

  return fetchTmdbJson(
    searchUrl,
    headers,
    "SEARCH_ERROR"
  );
}


/* ======================================================
   BUSCA
====================================================== */

async function searchItems(
  searchQuery,
  searchPage,
  mediaType,
  genreMap,
  headers,
  searchData
) {
  const sourceItems =
    Array.isArray(
      searchData.results
    )
      ? searchData.results
      : [];

  const results =
    await enrichWithTrailers(
      sourceItems,
      genreMap,
      mediaType,
      headers,
      SEARCH_TRAILER_LIMIT
    );

  const currentPage =
    searchData.page ||
    searchPage;

  const totalPages =
    searchData.total_pages ||
    0;

  return {
    source:
      "TMDB",

    mode:
      "search",

    mediaType,

    contentType:
      mediaType === "tv"
        ? "series"
        : "movies",

    query:
      searchQuery,

    page:
      currentPage,

    totalPages,

    totalResults:
      searchData.total_results ||
      results.length,

    hasMore:
      currentPage <
      totalPages,

    nextPage:
      currentPage <
      totalPages
        ? currentPage + 1
        : null,

    count:
      results.length,

    trailersEnriched:
      results.filter(
        item => item.trailer
      ).length,

    results
  };
}


/* ======================================================
   TRENDING RAW
====================================================== */

async function fetchTrendingRaw(
  mediaType,
  headers
) {
  return fetchTmdbJson(
    `${TMDB_BASE_URL}/trending/${mediaType}/week?language=pt-BR`,
    headers,
    "TRENDING_ERROR"
  );
}


/* ======================================================
   TRENDING
====================================================== */

async function buildTrending(
  mediaType,
  genreMap,
  headers,
  trendingData
) {
  const sourceItems =
    Array.isArray(
      trendingData.results
    )
      ? trendingData.results
      : [];

  const results =
    await enrichWithTrailers(
      sourceItems,
      genreMap,
      mediaType,
      headers,
      TRAILER_ITEMS_LIMIT
    );

  return {
    source:
      "TMDB",

    mode:
      "trending",

    mediaType,

    contentType:
      mediaType === "tv"
        ? "series"
        : "movies",

    period:
      "week",

    count:
      results.length,

    trailersEnriched:
      results.filter(
        item => item.trailer
      ).length,

    results
  };
}


/* ======================================================
   HANDLER
====================================================== */

export default async function handler(
  request,
  response
) {
  setCorsHeaders(
    response
  );

  if (
    request.method ===
    "OPTIONS"
  ) {
    return response
      .status(204)
      .end();
  }

  if (
    request.method !==
    "GET"
  ) {
    return response
      .status(405)
      .json({
        error:
          "Método não permitido"
      });
  }

  const token =
    process.env.TMDB_TOKEN;

  if (!token) {
    return response
      .status(500)
      .json({
        error:
          "TMDB_TOKEN não configurado"
      });
  }

  const headers = {
    Authorization:
      `Bearer ${token}`,

    Accept:
      "application/json"
  };

  try {
    const mediaType =
      getMediaType(
        request
      );

    const searchQuery =
      getSearchQuery(
        request
      );

    const searchPage =
      getSearchPage(
        request
      );

    /*
      Gêneros e conteúdo principal agora
      são requisitados simultaneamente.
    */
    if (searchQuery) {
      setCacheHeaders(
        response,
        true
      );

      const [
        genreMap,
        searchData
      ] =
        await Promise.all([
          fetchGenres(
            mediaType,
            headers
          ),

          fetchSearchRaw(
            searchQuery,
            searchPage,
            mediaType,
            headers
          )
        ]);

      const data =
        await searchItems(
          searchQuery,
          searchPage,
          mediaType,
          genreMap,
          headers,
          searchData
        );

      return response
        .status(200)
        .json(data);
    }

    setCacheHeaders(
      response,
      false
    );

    const [
      genreMap,
      trendingData
    ] =
      await Promise.all([
        fetchGenres(
          mediaType,
          headers
        ),

        fetchTrendingRaw(
          mediaType,
          headers
        )
      ]);

    const data =
      await buildTrending(
        mediaType,
        genreMap,
        headers,
        trendingData
      );

    return response
      .status(200)
      .json(data);

  } catch (error) {
    console.error(
      "Erro interno:",
      error
    );

    if (
      error.message ===
      "GENRES_ERROR"
    ) {
      return response
        .status(502)
        .json({
          error:
            "Erro ao consultar gêneros no TMDB"
        });
    }

    if (
      error.message ===
      "SEARCH_ERROR"
    ) {
      return response
        .status(502)
        .json({
          error:
            "Erro ao pesquisar no TMDB"
        });
    }

    if (
      error.message ===
      "TRENDING_ERROR"
    ) {
      return response
        .status(502)
        .json({
          error:
            "Erro ao consultar conteúdos em alta"
        });
    }

    return response
      .status(500)
      .json({
        error:
          "Erro interno ao consultar o TMDB"
      });
  }
}
