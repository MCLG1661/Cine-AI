const TMDB_BASE_URL =
  "https://api.themoviedb.org/3";

const TMDB_IMAGE_URL =
  "https://image.tmdb.org/t/p";


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


export default async function handler(
  request,
  response
) {
  setCorsHeaders(response);


  if (request.method === "OPTIONS") {
    return response
      .status(204)
      .end();
  }


  if (request.method !== "GET") {
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

    const [
      trendingResponse,
      genresResponse
    ] =
      await Promise.all([
        fetch(
          `${TMDB_BASE_URL}/trending/movie/week?language=pt-BR`,
          {
            headers
          }
        ),

        fetch(
          `${TMDB_BASE_URL}/genre/movie/list?language=pt-BR`,
          {
            headers
          }
        )
      ]);


    if (!trendingResponse.ok) {
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


    if (!genresResponse.ok) {
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


    const trendingData =
      await trendingResponse.json();

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


    const movies =
      trendingData.results.map(
        movie => ({
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
            ) || 0,

          voteCount:
            movie.vote_count || 0,

          popularity:
            movie.popularity || 0,

          genres:
            (
              movie.genre_ids || []
            )
              .map(
                genreId =>
                  genreMap[
                    genreId
                  ]
              )
              .filter(Boolean),

          poster:
            movie.poster_path
              ? `${TMDB_IMAGE_URL}/w500${movie.poster_path}`
              : null,

          backdrop:
            movie.backdrop_path
              ? `${TMDB_IMAGE_URL}/original${movie.backdrop_path}`
              : null
        })
      );


    return response
      .status(200)
      .json({
        source:
          "TMDB",

        period:
          "week",

        count:
          movies.length,

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
