import s from './LinhaResumo.module.css'
import IconeBotao from './IconeBotao.jsx'

import caretRight from '../../assets/icons/CaretRight.svg'

/*
 * Uma linha da lista de configuração. Duas formas:
 * - com `valor`: mostra o valor e a seta que abre um modal;
 * - com `controle`: põe o que vier no lugar da seta (o interruptor).
 *
 * `cortar` é para a mensagem final, que é longa e precisa de reticências.
 */
export default function LinhaResumo({
  rotulo,
  valor,
  controle,
  cortar = false,
  onAbrir,
}) {
  const conteudo = (
    <>
      <span className={`${s.rotulo} ${cortar ? s.rotuloFixo : ''}`}>{rotulo}</span>
      {valor !== undefined ? (
        <span className={`${s.valor} ${cortar ? s.valorCortado : ''}`}>{valor}</span>
      ) : null}
    </>
  )

  return (
    <div className={s.linha}>
      {controle ? (
        <div className={`${s.conteudo} ${cortar ? s.conteudoLargo : ''}`}>
          {conteudo}
        </div>
      ) : (
        <button
          type="button"
          className={`${s.botao} ${s.conteudo} ${cortar ? s.conteudoLargo : ''}`}
          onClick={onAbrir}
        >
          {conteudo}
        </button>
      )}
      {controle ?? (
        <IconeBotao src={caretRight} rotulo={`Abrir ${rotulo}`} onClick={onAbrir} />
      )}
    </div>
  )
}
