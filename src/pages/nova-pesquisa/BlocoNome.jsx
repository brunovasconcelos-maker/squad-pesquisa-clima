import s from './Nome.module.css'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'

import caretRight from '../../assets/icons/CaretRight.svg'

/*
 * Miolo compartilhado pelas telas 1 e 3 (Figma 8057:3447 e 8067:5268): o
 * desenho é o mesmo, muda só o campo estar vazio ou preenchido e o valor de
 * participantes.
 *
 * O input é não controlado de propósito — o fluxo ainda não tem estado.
 */
export default function BlocoNome({ nome, participantes }) {
  return (
    <div className={s.conteudo}>
      <input
        className={s.campoGrande}
        type="text"
        placeholder="Nome da Pesquisa"
        defaultValue={nome}
        aria-label="Nome da Pesquisa"
      />

      <div className={s.bloco}>
        <p className={s.rotulo}>Para quem é esse Pesquisa?</p>
        <div className={s.linha}>
          <div className={s.linhaTexto}>
            <p className={s.linhaChave}>Participantes</p>
            <p className={s.linhaValor}>{participantes}</p>
          </div>
          <IconeBotao src={caretRight} rotulo="Escolher participantes" />
        </div>
      </div>
    </div>
  )
}
