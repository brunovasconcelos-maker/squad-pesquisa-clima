import { useEffect, useRef, useState } from 'react'
import s from './CartaoPesquisa.module.css'

import pauseCircle from '../../assets/icons/PauseCircle.svg'
import play from '../../assets/icons/Play.svg'
import more from '../../assets/icons/More.svg'

/*
 * Uma linha da lista de pesquisas (Figma 8015:432).
 *
 * Recebe os dados por prop e não sabe de onde vêm — hoje é exemplo fixo,
 * depois vira a pesquisa de verdade.
 *
 * As ações chegam por prop; o cartão só decide quando chamá-las.
 */
const TONS = {
  positivo: s.positivo,
  destaque: s.destaque,
  acao: s.acao,
  negativo: s.negativo,
  padrao: s.padrao,
}

const TRANSPORTE = {
  pausar: { icone: pauseCircle, rotulo: 'Pausar' },
  iniciar: { icone: play, rotulo: 'Iniciar' },
}

export default function CartaoPesquisa({
  pesquisa,
  onTransporte,
  onDuplicar,
  onCopiarLink,
  onDeletar,
}) {
  const [menuAberto, setMenuAberto] = useState(false)
  const envoltorio = useRef(null)

  /* Clicar fora fecha o menu — senão ele ficaria aberto atrás de tudo. */
  useEffect(() => {
    if (!menuAberto) return undefined
    const aoClicar = (e) => {
      if (!envoltorio.current?.contains(e.target)) setMenuAberto(false)
    }
    document.addEventListener('mousedown', aoClicar)
    return () => document.removeEventListener('mousedown', aoClicar)
  }, [menuAberto])

  const executar = (acao) => () => {
    setMenuAberto(false)
    acao?.()
  }
  const { nome, publico, tipo, status, evento, taxa, ciclos, transporte } =
    pesquisa
  const botao = transporte ? TRANSPORTE[transporte] : null

  return (
    <div className={s.cartao}>
      <span className={`${s.celula} ${s.nome}`} title={nome}>
        {nome}
      </span>
      <span className={`${s.celula} ${s.publico}`}>{publico}</span>
      <span className={`${s.celula} ${s.tipo}`}>{tipo}</span>
      <span className={s.status}>
        <span className={`${s.selo} ${TONS[status.tom]}`}>{status.texto}</span>
      </span>
      <span className={`${s.celula} ${s.evento}`}>{evento}</span>
      <span className={`${s.celula} ${s.taxa}`}>{taxa}</span>
      <span className={`${s.celula} ${s.ciclos}`}>{ciclos}</span>

      <div className={s.acoes}>
        {botao ? (
          <button
            type="button"
            className={s.transporte}
            aria-label={`${botao.rotulo} ${nome}`}
            onClick={onTransporte}
          >
            <img className={s.icone} src={botao.icone} alt="" width={24} height={24} />
          </button>
        ) : (
          <span className={s.semTransporte} />
        )}

        <div className={s.envoltorioMenu} ref={envoltorio}>
          <button
            type="button"
            className={s.menu}
            aria-label={`Mais opções de ${nome}`}
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            <img className={s.icone} src={more} alt="" width={24} height={24} />
          </button>

          {menuAberto ? (
            <div className={s.suspenso} role="menu">
              <button
                type="button"
                className={s.itemSuspenso}
                role="menuitem"
                onClick={executar(onDuplicar)}
              >
                Duplicar
              </button>
              <button
                type="button"
                className={s.itemSuspenso}
                role="menuitem"
                onClick={executar(onCopiarLink)}
              >
                Copiar link
              </button>
              <button
                type="button"
                className={`${s.itemSuspenso} ${s.destrutivo}`}
                role="menuitem"
                onClick={executar(onDeletar)}
              >
                Deletar
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
