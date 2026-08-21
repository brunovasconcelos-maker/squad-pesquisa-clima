import { useState } from 'react'
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
 * Nada clica: o play/pause e os itens do menu estão sem ação. O menu abre e
 * fecha porque, sem isso, não dá para vê-lo.
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

export default function CartaoPesquisa({ pesquisa }) {
  const [menuAberto, setMenuAberto] = useState(false)
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
          <button type="button" className={s.transporte} aria-label={`${botao.rotulo} ${nome}`}>
            <img className={s.icone} src={botao.icone} alt="" width={24} height={24} />
          </button>
        ) : (
          <span className={s.semTransporte} />
        )}

        <div className={s.envoltorioMenu}>
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
              <button type="button" className={s.itemSuspenso} role="menuitem">
                Duplicar
              </button>
              <button type="button" className={s.itemSuspenso} role="menuitem">
                Copiar link
              </button>
              <button
                type="button"
                className={`${s.itemSuspenso} ${s.destrutivo}`}
                role="menuitem"
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
