import s from './ModalFluxo.module.css'
import Botao from './Botao.jsx'
import IconeBotao from './IconeBotao.jsx'

import close from '../../assets/icons/Close.svg'

/*
 * Casca dos modais do fluxo: scrim, card, título com X e rodapé
 * Voltar / Salvar. O miolo vem por children.
 */
export default function ModalFluxo({
  titulo,
  espacamento = 40,
  onVoltar,
  onSalvar,
  onFechar,
  children,
}) {
  return (
    <div className={s.scrim}>
      <div
        className={s.modal}
        role="dialog"
        aria-label={titulo}
        style={{ gap: `${espacamento}px` }}
      >
        <div className={s.cabecalho}>
          <p className={s.titulo}>{titulo}</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={onFechar} />
        </div>

        <div className={s.corpo}>{children}</div>

        <div className={s.rodape}>
          <Botao onClick={onVoltar}>Voltar</Botao>
          <Botao variante="marca" onClick={onSalvar}>
            Salvar
          </Botao>
        </div>
      </div>
    </div>
  )
}
