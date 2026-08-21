import s from './Editor.module.css'
import Botao from '../../components/fluxo/Botao.jsx'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'

import close from '../../assets/icons/Close.svg'

/*
 * Confirmação ao sair da revisão para trás, no caminho com template.
 *
 * Só aparece nesse caminho: voltar leva ao prompt, e mexer ali refaz a
 * geração — as perguntas revisadas até aqui, com edições e exclusões, se
 * perdem. No caminho em branco não há nada gerado, então o Voltar é direto.
 */
export default function ModalConfirmarVoltar({ onConfirmar, onCancelar }) {
  return (
    <div className={s.scrim}>
      <div
        className={`${s.modal} ${s.modalCompacto}`}
        role="dialog"
        aria-label="Voltar para o prompt"
      >
        <div className={s.cabecalho}>
          <p className={s.titulo}>Voltar para o prompt?</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={onCancelar} />
        </div>

        <p className={s.texto}>
          As perguntas desta pesquisa já foram geradas. Se você mudar o prompt,
          o número de perguntas ou os participantes, elas são geradas de novo e
          as edições e exclusões feitas aqui se perdem.
        </p>

        <div className={s.rodape}>
          <Botao onClick={onCancelar}>Cancelar</Botao>
          <Botao variante="marca" onClick={onConfirmar}>
            Voltar
          </Botao>
        </div>
      </div>
    </div>
  )
}
