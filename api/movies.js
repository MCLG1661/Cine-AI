const TMDB_BASE_URL =
  "https://api.themoviedb.org/3";

const TMDB_IMAGE_URL =
  "https://image.tmdb.org/t/p";

const TRAILER_ITEMS_LIMIT =
  10;

const SEARCH_TRAILER_LIMIT =
  8;


/* ======================================================
   CORS
====================================================== */

function setCorsHeaders(
  response
) {

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


/* ======================================================
   TIPO DE CONTEÚDO
====================================================== */

function getMediaType(
  request
) {

  const rawType =
    Array.isArray(
      request.query?.type
    )
      ? request.query.type[0]
      : request.query?.type;


  return rawType === "tv"
    ? "tv"
    : "movie";
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
   BUSCA DE TRAILER
====================================================== */

async function fetchTrailer(
  itemId,
  mediaType,
  headers
) {

  try {

    const endpoint =
      mediaType === "tv"
        ? "tv"
        : "movie";


    const ptResponse =
      await fetch(
        `${TMDB_BASE_URL}/${endpoint}/${itemId}/videos?language=pt-BR`,
        {
          headers
        }
      );


    if (ptResponse.ok) {

      const ptData =
        await ptResponse.json();


      const ptTrailer =
        selectBestTrailer(
          ptData.results || []
        );


      if (ptTrailer) {

        return ptTrailer;
      }
    }


    const enResponse =
      await fetch(
        `${TMDB_BASE_URL}/${endpoint}/${itemId}/videos?language=en-US`,
        {
          headers
        }
      );


    if (!enResponse.ok) {

      return null;
    }


    const enData =
      await enResponse.json();


    return selectBestTrailer(
      enData.results || []
    );


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

    mediaType:
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
        .filter(
          Boolean
        ),

    originCountry:
      isTv
        ? item.origin_country ||
          []
        : [],

    originalLanguage:
      item.original_language ||
      null,

    poster:
      item.poster_path
        ? `${TMDB_IMAGE_URL}/w500${item.poster_path}`
        : null,

    backdrop:
      item.backdrop_path
        ? `${TMDB_IMAGE_URL}/original${item.backdrop_path}`
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
   TRAILERS
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
   PÁGINA
====================================================== */

function getSearchPage(
  request
) {

  const rawPage =
    Array.isArray(
      request.query?.page
    )
      ? request.query.page[0]
      : request.query?.page;


  const parsedPage =
    Number.parseInt(
      rawPage,
      10
    );


  if (
    !Number.isInteger(
      parsedPage
    ) ||
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

function getSearchQuery(
  request
) {

  const rawQuery =
    Array.isArray(
      request.query?.q
    )
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
   GÊNEROS
====================================================== */

async function fetchGenres(
  mediaType,
  headers
) {

  const genresResponse =
    await fetch(
      `${TMDB_BASE_URL}/genre/${mediaType}/list?language=pt-BR`,
      {
        headers
      }
    );


  if (!genresResponse.ok) {

    const errorData =
      await genresResponse.text();


    console.error(
      `Erro TMDB Genres ${mediaType}:`,
      genresResponse.status,
      errorData
    );


    throw new Error(
      "GENRES_ERROR"
    );
  }


  const genresData =
    await genresResponse.json();


  return Object.fromEntries(
    (
      genresData.genres ||
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
   BUSCA
====================================================== */

async function searchItems(
  searchQuery,
  searchPage,
  mediaType,
  genreMap,
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


  /*
    O parâmetro region é aplicável
    à busca de filmes.
  */

  if (
    mediaType === "movie"
  ) {

    searchUrl.searchParams.set(
      "region",
      "BR"
    );
  }


  const searchResponse =
    await fetch(
      searchUrl,
      {
        headers
      }
    );


  if (!searchResponse.ok) {

    const errorData =
      await searchResponse.text();


    console.error(
      `Erro TMDB Search ${mediaType}:`,
      searchResponse.status,
      errorData
    );


    throw new Error(
      "SEARCH_ERROR"
    );
  }


  const searchData =
    await searchResponse.json();


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
   TRENDING
====================================================== */

async function fetchTrending(
  mediaType,
  genreMap,
  headers
) {

  const trendingResponse =
    await fetch(
      `${TMDB_BASE_URL}/trending/${mediaType}/week?language=pt-BR`,
      {
        headers
      }
    );


  if (!trendingResponse.ok) {

    const errorData =
      await trendingResponse.text();


    console.error(
      `Erro TMDB Trending ${mediaType}:`,
      trendingResponse.status,
      errorData
    );


    throw new Error(
      "TRENDING_ERROR"
    );
  }


  const trendingData =
    await trendingResponse.json();


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


    const genreMap =
      await fetchGenres(
        mediaType,
        headers
      );


    if (searchQuery) {

      const data =
        await searchItems(
          searchQuery,
          searchPage,
          mediaType,
          genreMap,
          headers
        );


      return response
        .status(200)
        .json(data);
    }


    const data =
      await fetchTrending(
        mediaType,
        genreMap,
        headers
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
