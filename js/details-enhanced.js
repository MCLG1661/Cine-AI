/* ======================================================
   CineAI — Detalhes Avançados
   Fase 8.12
====================================================== */

(function () {
  "use strict";

  function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return new Intl.NumberFormat(
      "pt-BR"
    ).format(number);
  }

  function formatRating(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "—";
    }

    return number.toFixed(1);
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const parts =
      String(value).split("-");

    if (parts.length !== 3) {
      return value;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function getMediaLabel(item) {
    return item?.mediaType === "tv"
      ? "Série"
      : "Filme";
  }

  function getGenres(item) {
    if (
      !Array.isArray(item?.genres) ||
      item.genres.length === 0
    ) {
      return "Não informado";
    }

    return item.genres.join(" • ");
  }

  function createExtraDetails() {
    const modal =
      document.getElementById(
        "detailsModal"
      );

    if (!modal) {
      return null;
    }

    let container =
      modal.querySelector(
        "#modalExtraDetails"
      );

    if (container) {
      return container;
    }

    const description =
      modal.querySelector(
        "#modalDescription"
      );

    if (!description) {
      return null;
    }

    container =
      document.createElement(
        "div"
      );

    container.id =
      "modalExtraDetails";

    container.className =
      "details-modal__extra";

    description.insertAdjacentElement(
      "afterend",
      container
    );

    return container;
  }

  function renderTmdbExtraDetails(item) {
    const container =
      createExtraDetails();

    if (!container) {
      return;
    }

    const originalTitle =
      item.originalTitle &&
      item.originalTitle !== item.title
        ? item.originalTitle
        : "—";

    container.innerHTML = `
      <div class="details-extra__grid">

        <div class="details-extra__item">
          <span>Tipo</span>
          <strong>
            ${getMediaLabel(item)}
          </strong>
        </div>

        <div class="details-extra__item">
          <span>Lançamento</span>
          <strong>
            ${formatDate(item.releaseDate)}
          </strong>
        </div>

        <div class="details-extra__item">
          <span>Nota TMDB</span>
          <strong>
            ⭐ ${formatRating(item.rating)}
          </strong>
        </div>

        <div class="details-extra__item">
          <span>Avaliações</span>
          <strong>
            ${formatNumber(item.voteCount)}
          </strong>
        </div>

        <div class="details-extra__item">
          <span>Popularidade</span>
          <strong>
            ${formatNumber(item.popularity)}
          </strong>
        </div>

        <div class="details-extra__item">
          <span>Gêneros</span>
          <strong>
            ${getGenres(item)}
          </strong>
        </div>

      </div>

      ${
        originalTitle !== "—"
          ? `
            <div class="details-extra__original">
              <span>
                Título original
              </span>

              <strong>
                ${originalTitle}
              </strong>
            </div>
          `
          : ""
      }

      ${
        item.trailerName
          ? `
            <div class="details-extra__trailer">
              <span>
                Trailer disponível
              </span>

              <strong>
                ${item.trailerName}
              </strong>

              ${
                item.trailerOfficial
                  ? `
                    <small>
                      ✓ Trailer oficial
                    </small>
                  `
                  : ""
              }
            </div>
          `
          : ""
      }
    `;
  }

  function renderLocalExtraDetails(item) {
    const container =
      createExtraDetails();

    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="details-extra__grid">

        <div class="details-extra__item">
          <span>Tipo</span>
          <strong>
            ${
              item.type === "series"
                ? "Série"
                : "Filme"
            }
          </strong>
        </div>

        <div class="details-extra__item">
          <span>Ano</span>
          <strong>
            ${item.year || "—"}
          </strong>
        </div>

        <div class="details-extra__item">
          <span>Avaliação</span>
          <strong>
            ⭐ ${item.rating || "—"}
          </strong>
        </div>

        <div class="details-extra__item">
          <span>Duração</span>
          <strong>
            ${item.duration || "—"}
          </strong>
        </div>

        <div class="details-extra__item details-extra__item--wide">
          <span>Gênero</span>
          <strong>
            ${item.genre || "—"}
          </strong>
        </div>

      </div>
    `;
  }

  const originalOpenTmdbDetails =
    window.openTmdbDetails;

  if (
    typeof originalOpenTmdbDetails ===
    "function"
  ) {
    window.openTmdbDetails =
      function (item) {
        originalOpenTmdbDetails(item);

        renderTmdbExtraDetails(
          item
        );
      };

    openTmdbDetails =
      window.openTmdbDetails;
  }

  const originalOpenLocalDetails =
    window.openLocalDetails;

  if (
    typeof originalOpenLocalDetails ===
    "function"
  ) {
    window.openLocalDetails =
      function (item) {
        originalOpenLocalDetails(item);

        renderLocalExtraDetails(
          item
        );
      };

    openLocalDetails =
      window.openLocalDetails;
  }

})();
