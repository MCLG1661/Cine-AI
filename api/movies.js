export default async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({
      error: "Método não permitido"
    });
  }

  const token = process.env.TMDB_TOKEN;

  if (!token) {
    return response.status(500).json({
      error: "TMDB_TOKEN não configurado"
    });
  }

  try {
    const tmdbResponse = await fetch(
      "https://api.themoviedb.org/3/trending/movie/week?language=pt-BR",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      }
    );

    if (!tmdbResponse.ok) {
      const errorData = await tmdbResponse.text();

      console.error(
        "Erro TMDB:",
        tmdbResponse.status,
        errorData
      );

      return response.status(tmdbResponse.status).json({
        error: "Erro ao consultar o TMDB"
      });
    }

    const data = await tmdbResponse.json();

    const movies = data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      description: movie.overview,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null
    }));

    return response.status(200).json({
      source: "TMDB",
      count: movies.length,
      results: movies
    });

  } catch (error) {
    console.error(
      "Erro interno:",
      error
    );

    return response.status(500).json({
      error: "Erro interno ao consultar filmes"
    });
  }
}
