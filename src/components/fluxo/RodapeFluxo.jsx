import s from './RodapeFluxo.module.css'
import Botao from './Botao.jsx'

/*
 * Barra de baixo do fluxo: Voltar, a trilha de progresso e Continuar.
 * Compartilhada por todas as telas do fluxo, inclusive a revisão, que tem
 * moldura própria e por isso não usa o FluxoLayout inteiro.
 *
 * `progresso` é a fração do passo atual — quem chama decide, porque o caminho
 * em branco pula dois passos e salta na trilha.
 */
export default function RodapeFluxo({
  progresso,
  rotuloProgresso,
  mostrarProgresso = true,
  mostrarContinuar = true,
  rotuloContinuar = 'Continuar',
  mostrarPular = false,
  continuarDesabilitado = false,
  onVoltar,
  onContinuar,
  onPular,
}) {
  return (
    <div className={s.rodape}>
      {/* Sem trilha à mostra o vão continua: são os 8px que, com os 72 dos
          botões, dão os 80px da barra. */}
      <div
        className={`${s.progresso} ${mostrarProgresso ? '' : s.progressoOculto}`}
        role={mostrarProgresso ? 'progressbar' : undefined}
        aria-label={mostrarProgresso ? 'Progresso' : undefined}
        aria-valuemin={mostrarProgresso ? 0 : undefined}
        aria-valuemax={mostrarProgresso ? 100 : undefined}
        aria-valuenow={mostrarProgresso ? Math.round(progresso * 100) : undefined}
        aria-valuetext={mostrarProgresso ? rotuloProgresso : undefined}
      >
        {mostrarProgresso ? (
          <div
            className={s.progressoPreenchido}
            style={{ width: `calc(${progresso * 100}% + 4px)` }}
          />
        ) : null}
      </div>
      <div className={s.acoes}>
        <Botao onClick={onVoltar}>Voltar</Botao>
        <div className={s.acoesDireita}>
          {mostrarPular ? <Botao onClick={onPular}>Pular</Botao> : null}
          {mostrarContinuar ? (
            <Botao
              variante="marca"
              desabilitado={continuarDesabilitado}
              onClick={onContinuar}
            >
              {rotuloContinuar}
            </Botao>
          ) : null}
        </div>
      </div>
    </div>
  )
}
