/* ======================================================
   CineAI — Motor de Recomendações
   Fase 8.11A
====================================================== */

(function () {
  "use strict";

  const MAX_RECOMMENDATIONS = 8;

  const SCORE = {
    PRIMARY_GENRE: 3,
    SECONDARY_GENRE: 2,
    RATING_HIGH: 2,
    RATING_GOOD: 1,
    POPULARITY_HIGH: 1
  };

  /* ======================================================
     UTILITÁRIOS
  ====================================================== */

  function normalizeGenre(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );
  }

  function getMediaType(item) {
    return item?.mediaType === "tv"
      ? "tv"
      : "movie";
  }

  function getItemKey(item) {
    if (!item) {
      return null;
    }

    const source =
      item.source === "local"
        ? "local"
        : "tmdb";

    if (source === "local") {
      return `local:${item.id}`;
    }

    return `tmdb:${getMediaType(item)}:${item.id}`;
  }

  function getSavedItemKey(saved) {
    if (!saved) {
      return null;
    }

    if (saved.source === "local") {
      return `local:${saved.id}`;
    }

    const mediaType =
      saved.mediaType === "tv"
        ? "tv"
        : "movie";

    return `tmdb:${mediaType}:${saved.id}`;
  }

  function getItemGenres(item) {
    if (!item) {
      return [];
    }

    if (
      Array.isArray(item.genres)
    ) {
      return item.genres
        .filter(Boolean)
        .map(String);
    }

    if (item.genre) {
      return [
        String(item.genre)
      ];
    }

    return [];
  }

  function getRating(item) {
    const rating =
      Number(item?.rating);

    return Number.isFinite(rating)
      ? rating
      : 0;
  }

  function getPopularity(item) {
    const popularity =
      Number(item?.popularity);

    return Number.isFinite(
      popularity
    )
      ? popularity
      : 0;
  }

  /* ======================================================
     RESOLUÇÃO DA MINHA LISTA
  ====================================================== */

  function resolveSavedItems(
    savedList,
    localCatalog,
    tmdbMovies,
    tmdbSeries
  ) {
    if (
      !Array.isArray(savedList)
    ) {
      return [];
    }

    return savedList
      .map(saved => {
        if (!saved) {
          return null;
        }

        if (
          saved.source ===
          "local"
        ) {
          return localCatalog.find(
            item =>
              String(item.id) ===
              String(saved.id)
          ) || null;
        }

        const mediaType =
          saved.mediaType === "tv"
            ? "tv"
            : "movie";

        const catalog =
          mediaType === "tv"
            ? tmdbSeries
            : tmdbMovies;

        const catalogItem =
          catalog.find(
            item =>
              String(item.id) ===
              String(saved.id)
          );

        if (catalogItem) {
          return catalogItem;
        }

        if (saved.movie) {
          return {
            ...saved.movie,
            mediaType,
            source: "tmdb"
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  /* ======================================================
     PERFIL DE PREFERÊNCIAS
  ====================================================== */

  function buildGenreProfile(
    savedItems
  ) {
    const counts =
      new Map();

    savedItems.forEach(item => {
      getItemGenres(item)
        .forEach(genre => {
          const normalized =
            normalizeGenre(genre);

          if (!normalized) {
            return;
          }

          const current =
            counts.get(
              normalized
            ) || {
              name: genre,
              count: 0
            };

          current.count += 1;

          counts.set(
            normalized,
            current
          );
        });
    });

    return Array.from(
      counts.entries()
    )
      .map(
        ([key, value]) => ({
          key,
          name: value.name,
          count: value.count
        })
      )
      .sort(
        (a, b) =>
          b.count -
          a.count
      );
  }

  /* ======================================================
     PONTUAÇÃO
  ====================================================== */

  function calculateGenreScore(
    item,
    genreProfile
  ) {
    const itemGenres =
      getItemGenres(item)
        .map(normalizeGenre);

    let score = 0;
    let matches = 0;

    genreProfile.forEach(
      profile => {
        if (
          !itemGenres.includes(
            profile.key
          )
        ) {
          return;
        }

        matches += 1;

        if (matches === 1) {
          score +=
            SCORE.PRIMARY_GENRE;
        } else {
          score +=
            SCORE.SECONDARY_GENRE;
        }
      }
    );

    return {
      score,
      matches
    };
  }

  function calculateRatingScore(
    item
  ) {
    const rating =
      getRating(item);

    if (rating >= 8) {
      return SCORE.RATING_HIGH;
    }

    if (rating >= 7) {
      return SCORE.RATING_GOOD;
    }

    return 0;
  }

  function calculatePopularityScore(
    item,
    popularityThreshold
  ) {
    const popularity =
      getPopularity(item);

    if (
      popularityThreshold > 0 &&
      popularity >=
        popularityThreshold
    ) {
      return SCORE.POPULARITY_HIGH;
    }

    return 0;
  }

  function calculatePopularityThreshold(
    candidates
  ) {
    const values =
      candidates
        .map(getPopularity)
        .filter(
          value =>
            value > 0
        )
        .sort(
          (a, b) =>
            b - a
        );

    if (
      values.length === 0
    ) {
      return 0;
    }

    const position =
      Math.max(
        0,
        Math.floor(
          values.length * 0.25
        ) - 1
      );

    return values[position];
  }

  /* ======================================================
     MOTIVO DA RECOMENDAÇÃO
  ====================================================== */

  function createReason(
    item,
    genreProfile,
    genreMatches
  ) {
    if (
      genreMatches > 0
    ) {
      const itemGenres =
        getItemGenres(item)
          .map(genre => ({
            original: genre,
            normalized:
              normalizeGenre(genre)
          }));

      const matched =
        genreProfile
          .filter(profile =>
            itemGenres.some(
              genre =>
                genre.normalized ===
                profile.key
            )
          )
          .slice(0, 2)
          .map(
            profile =>
              profile.name
          );

      if (
        matched.length === 1
      ) {
        return `Porque você gosta de ${matched[0]}`;
      }

      if (
        matched.length >= 2
      ) {
        return `Porque você gosta de ${matched[0]} e ${matched[1]}`;
      }
    }

    if (
      getRating(item) >= 8
    ) {
      return "Título muito bem avaliado no TMDB";
    }

    return "Popular entre os títulos disponíveis";
  }

  /* ======================================================
     FALLBACK
  ====================================================== */

  function rankFallback(
    candidates,
    savedKeys,
    limit
  ) {
    return candidates
      .filter(item => {
        const key =
          getItemKey(item);

        return (
          key &&
          !savedKeys.has(key)
        );
      })
      .sort((a, b) => {
        const ratingDifference =
          getRating(b) -
          getRating(a);

        if (
          ratingDifference !== 0
        ) {
          return ratingDifference;
        }

        return (
          getPopularity(b) -
          getPopularity(a)
        );
      })
      .slice(0, limit)
      .map(item => ({
        ...item,

        recommendationScore:
          0,

        recommendationReason:
          "Entre os títulos mais bem avaliados"
      }));
  }

  /* ======================================================
     MOTOR PRINCIPAL
  ====================================================== */

  function recommend(options = {}) {
    const {
      savedList = [],
      localCatalog = [],
      tmdbMovies = [],
      tmdbSeries = [],
      limit =
        MAX_RECOMMENDATIONS
    } = options;

    const safeLocalCatalog =
      Array.isArray(
        localCatalog
      )
        ? localCatalog
        : [];

    const safeMovies =
      Array.isArray(
        tmdbMovies
      )
        ? tmdbMovies
        : [];

    const safeSeries =
      Array.isArray(
        tmdbSeries
      )
        ? tmdbSeries
        : [];

    const savedItems =
      resolveSavedItems(
        savedList,
        safeLocalCatalog,
        safeMovies,
        safeSeries
      );

    const savedKeys =
      new Set(
        savedList
          .map(
            getSavedItemKey
          )
          .filter(Boolean)
      );

    const candidates = [
      ...safeMovies,
      ...safeSeries
    ];

    const genreProfile =
      buildGenreProfile(
        savedItems
      );

    if (
      genreProfile.length ===
      0
    ) {
      return {
        recommendations:
          rankFallback(
            candidates,
            savedKeys,
            limit
          ),

        genreProfile:
          [],

        mode:
          "fallback"
      };
    }

    const popularityThreshold =
      calculatePopularityThreshold(
        candidates
      );

    const ranked =
      candidates
        .filter(item => {
          const key =
            getItemKey(item);

          return (
            key &&
            !savedKeys.has(key)
          );
        })
        .map(item => {
          const genreResult =
            calculateGenreScore(
              item,
              genreProfile
            );

          const ratingScore =
            calculateRatingScore(
              item
            );

          const popularityScore =
            calculatePopularityScore(
              item,
              popularityThreshold
            );

          const totalScore =
            genreResult.score +
            ratingScore +
            popularityScore;

          return {
            ...item,

            recommendationScore:
              totalScore,

            recommendationReason:
              createReason(
                item,
                genreProfile,
                genreResult.matches
              )
          };
        })
        .sort((a, b) => {
          if (
            b.recommendationScore !==
            a.recommendationScore
          ) {
            return (
              b.recommendationScore -
              a.recommendationScore
            );
          }

          if (
            getRating(b) !==
            getRating(a)
          ) {
            return (
              getRating(b) -
              getRating(a)
            );
          }

          return (
            getPopularity(b) -
            getPopularity(a)
          );
        })
        .slice(
          0,
          limit
        );

    return {
      recommendations:
        ranked,

      genreProfile,

      mode:
        "personalized"
    };
  }

  /* ======================================================
     API PÚBLICA
  ====================================================== */

  window.CineAIRecommendations = {
    recommend,
    buildGenreProfile,
    getItemGenres
  };
})();
