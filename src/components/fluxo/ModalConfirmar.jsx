import s from '../../pages/nova-pesquisa/Editor.module.css'
import Botao from './Botao.jsx'
import IconeBotao from './IconeBotao.jsx'
import useModal from './useModal.js'

import close from '../../assets/icons/Close.svg'

/*
 * Confirmação genérica: título, um parágrafo e o par cancelar / confirmar.
 * Mesmo desenho dos outros modais do projeto.
 */
export default function ModalConfirmar({
  titulo,
  texto,
  rotuloConfirmar = 'Confirmar',
  /* Sem escolha a fazer — o modal só explica por que a ação não acontece.
     Aí o par "Cancelar / Confirmar" viraria dois botões com o mesmo efeito, e
     fica só o de fechar. */
  soAviso = false,
  onConfirmar,
  onCancelar,
}) {
  const caixa = useModal(onCancelar)

  return (
    <div className={s.scrim}>
      <div
        className={`${s.modal} ${s.modalCompacto}`}
        ref={caixa}
        role="dialog"
        aria-label={titulo}
      >
        <div className={s.cabecalho}>
          <p className={s.titulo}>{titulo}</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={onCancelar} />
        </div>

        <p className={s.texto}>{texto}</p>

        <div className={s.rodape}>
          {soAviso ? <span /> : <Botao onClick={onCancelar}>Cancelar</Botao>}
          <Botao variante="marca" onClick={onConfirmar}>
            {rotuloConfirmar}
          </Botao>
        </div>
      </div>
    </div>
  )
}
