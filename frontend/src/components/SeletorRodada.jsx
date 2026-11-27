import { TOTAL_RODADAS } from "../confrontos.js";

export default function SeletorRodada({
  rodada,
  aoMudarRodada,
  ocupado,
  anunciar,
}) {
  return (
    <fieldset aria-label="Rodada">
      <div className="seletor">
        <button
          type="button"
          aria-label="Rodada anterior"
          onClick={() => aoMudarRodada(rodada - 1)}
          disabled={ocupado || rodada === 1}
        >
          <span aria-hidden="true">←</span>
        </button>
        <span
          className="seletor-valor"
          aria-live={anunciar ? "polite" : undefined}
        >
          Rodada {rodada}
        </span>
        <button
          type="button"
          aria-label="Próxima rodada"
          onClick={() => aoMudarRodada(rodada + 1)}
          disabled={ocupado || rodada === TOTAL_RODADAS}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </fieldset>
  );
}
