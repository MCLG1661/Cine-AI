const TMDB_BASE_URL =
  "https://api.themoviedb.org/3";

const TMDB_IMAGE_URL =
  "https://image.tmdb.org/t/p";

const TRAILER_MOVIES_LIMIT =
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
   SELEÇÃO DE TRAILER
====================================================== */

function selectBestTrailer(
  videos = []
) {

  const youtubeVideos =
    videos.filter(
      video =>
        video.site ===
          "YouTube" &&
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
        video.type ===
          "Trailer" &&
        video.official
    );


  const trailers =
    youtubeVideos.filter(
      video =>
        video.type ===
          "Trailer"
    );


  const officialTeasers =
    youtubeVideos.filter(
      video =>
        video.type ===
          "Teaser" &&
        video.official
    );


  const teasers =
    youtubeVideos.filter(
      video =>
        video.type ===
          "Teaser"
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

async function fetchMovieTrailer(
  movieId,
  headers
) {

  try {

    const ptResponse =
      await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/videos?language=pt-BR`,
        {
          headers
        }
      );


    if (ptResponse.ok) {

      const ptData =
        await ptResponse.json();


      const ptTrailer =
        selectBestTrailer(
          ptData.results ||
          []
        );


      if (ptTrailer) {

        return ptTrailer;
      }
    }


    const enResponse =
      await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/videos?language=en-US`,
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
      enData.results ||
      []
    );


  } catch (error) {

    console.error(
      `Erro ao consultar trailer do filme ${movieId}:`,
      error
    );


    return null;
  }
}


/* ======================================================
   MAPEAMENTO DE FILMES
====================================================== */

function mapMovie(
  movie,
  genreMap,
  trailer = null
) {

  return {

    id:
      movie.id,

    title:
      movie.title,

    originalTitle:
      movie.original_title,

    description:
      movie.overview ||
      "Sinopse não disponível.",

    releaseDate:
      movie.release_date ||
      null,

    rating:
      Number(
        movie.vote_average
          ?.toFixed(1)
      ) ||
      0,

    voteCount:
      movie.vote_count ||
      0,

    popularity:
      movie.popularity ||
      0,

    genres:
      (
        movie.genre_ids ||
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

    poster:
      movie.poster_path
        ? `${TMDB_IMAGE_URL}/w500${movie.poster_path}`
        : null,

    backdrop:
      movie.backdrop_path
        ? `${TMDB_IMAGE_URL}/original${movie.backdrop_path}`
        : null,

    trailer:
      trailer
        ?.embedUrl ||
      null,

    trailerWatchUrl:
      trailer
        ?.watchUrl ||
      null,

    trailerName:
      trailer
        ?.name ||
      null,

    trailerOfficial:
      trailer
        ?.official ||
      false,

    trailerLanguage:
      trailer
        ?.language ||
      null

  };
}


/* ======================================================
   ENRIQUECIMENTO DE TRAILERS
====================================================== */

async function enrichMoviesWithTrailers(
  sourceMovies,
  genreMap,
  headers,
  limit
) {

  const moviesForTrailers =
    sourceMovies.slice(
      0,
      limit
    );


  const trailers =
    await Promise.all(
      moviesForTrailers.map(
        movie =>
          fetchMovieTrailer(
            movie.id,
            headers
          )
      )
    );


  const trailerMap =
    new Map();


  moviesForTrailers.forEach(
    (
      movie,
      index
    ) => {

      trailerMap.set(
        movie.id,
        trailers[index] ||
        null
      );
    }
  );


  return sourceMovies.map(
    movie =>
      mapMovie(
        movie,
        genreMap,
        trailerMap.get(
          movie.id
        ) ||
        null
      )
  );
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

    const rawQuery =
      Array.isArray(
        request.query?.q
      )
        ? request.query.q[0]
        : request.query?.q;


    const searchQuery =
      String(
        rawQuery ||
        ""
      )
        .trim()
        .slice(
          0,
          100
        );


    const genresResponse =
      await fetch(
        `${TMDB_BASE_URL}/genre/movie/list?language=pt-BR`,
        {
          headers
        }
      );


    if (
      !genresResponse.ok
    ) {

      const errorData =
        await genresResponse.text();


      console.error(
        "Erro TMDB Genres:",
        genresResponse.status,
        errorData
      );


      return response
        .status(
          genresResponse.status
        )
        .json({
          error:
            "Erro ao consultar gêneros"
        });
    }


    const genresData =
      await genresResponse.json();


    const genreMap =
      Object.fromEntries(
        genresData.genres.map(
          genre => [
            genre.id,
            genre.name
          ]
        )
      );


    /* ==================================================
       MODO BUSCA
    ================================================== */

    if (searchQuery) {

      const searchUrl =
        new URL(
          `${TMDB_BASE_URL}/search/movie`
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
        "region",
        "BR"
      );


      searchUrl.searchParams.set(
        "include_adult",
        "false"
      );


      searchUrl.searchParams.set(
        "page",
        "1"
      );


      const searchResponse =
        await fetch(
          searchUrl,
          {
            headers
          }
        );


      if (
        !searchResponse.ok
      ) {

        const errorData =
          await searchResponse.text();


        console.error(
          "Erro TMDB Search:",
          searchResponse.status,
          errorData
        );


        return response
          .status(
            searchResponse.status
          )
          .json({
            error:
              "Erro ao pesquisar filmes"
          });
      }


      const searchData =
        await searchResponse.json();


      const sourceMovies =
        Array.isArray(
          searchData.results
        )
          ? searchData.results
          : [];


      const movies =
        await enrichMoviesWithTrailers(
          sourceMovies,
          genreMap,
          headers,
          SEARCH_TRAILER_LIMIT
        );


      return response
        .status(200)
        .json({

          source:
            "TMDB",

          mode:
            "search",

          query:
            searchQuery,

          page:
            searchData.page ||
            1,

          totalPages:
            searchData.total_pages ||
            0,

          totalResults:
            searchData.total_results ||
            movies.length,

          count:
            movies.length,

          trailersEnriched:
            movies.filter(
              movie =>
                movie.trailer
            ).length,

          results:
            movies

        });
    }


    /* ==================================================
       MODO EM ALTA
    ================================================== */

    const trendingResponse =
      await fetch(
        `${TMDB_BASE_URL}/trending/movie/week?language=pt-BR`,
        {
          headers
        }
      );


    if (
      !trendingResponse.ok
    ) {

      const errorData =
        await trendingResponse.text();


      console.error(
        "Erro TMDB Trending:",
        trendingResponse.status,
        errorData
      );


      return response
        .status(
          trendingResponse.status
        )
        .json({
          error:
            "Erro ao consultar filmes em alta"
        });
    }


    const trendingData =
      await trendingResponse.json();


    const sourceMovies =
      Array.isArray(
        trendingData.results
      )
        ? trendingData.results
        : [];


    const movies =
      await enrichMoviesWithTrailers(
        sourceMovies,
        genreMap,
        headers,
        TRAILER_MOVIES_LIMIT
      );


    return response
      .status(200)
      .json({

        source:
          "TMDB",

        mode:
          "trending",

        period:
          "week",

        count:
          movies.length,

        trailersEnriched:
          movies.filter(
            movie =>
              movie.trailer
          ).length,

        results:
          movies

      });


  } catch (error) {

    console.error(
      "Erro interno:",
      error
    );


    return response
      .status(500)
      .json({
        error:
          "Erro interno ao consultar filmes"
      });
  }
}
