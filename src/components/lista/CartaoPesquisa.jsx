import { useEffect, useRef, useState } from 'react'
import s from './CartaoPesquisa.module.css'
import Selo from '../Selo.jsx'

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
const TRANSPORTE = {
  pausar: { icone: pauseCircle, rotulo: 'Pausar' },
  iniciar: { icone: play, rotulo: 'Iniciar' },
}

export default function CartaoPesquisa({
  pesquisa,
  onAbrir,
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

  /*
   * O nome acessível da linha carrega o que está em cada coluna.
   *
   * Os cabeçalhos são `<span>` visuais soltos, e a linha é um botão: para
   * quem usa leitor de tela, "Ativa | Rodando" e "16%" eram palavras avulsas,
   * sem ligação com a pesquisa a que pertencem. Dobrar o conteúdo da linha no
   * rótulo resolve isso sem inventar navegação de tabela que o aplicativo não
   * tem — a linha continua sendo o que é, um botão que abre a pesquisa.
   */
  const rotuloDaLinha = [
    nome,
    `público ${publico}`,
    `tipo ${tipo}`,
    `status ${status?.texto ?? '—'}`,
    `evento ${evento}`,
    `taxa de resposta ${taxa}`,
    `ciclos ${ciclos}`,
  ].join(', ')

  /* A linha inteira abre a pesquisa. Como é uma div, e não um link, o papel
     e o teclado entram na mão; os botões de ação ficam numa ilha que não
     deixa o clique subir. */
  const aoTeclar = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    onAbrir?.()
  }

  return (
    <div
      className={s.cartao}
      role="button"
      tabIndex={0}
      aria-label={`Abrir ${rotuloDaLinha}`}
      onClick={onAbrir}
      onKeyDown={aoTeclar}
    >
      <span className={`${s.celula} ${s.nome}`} title={nome}>
        {nome}
      </span>
      <span className={`${s.celula} ${s.publico}`}>{publico}</span>
      <span className={`${s.celula} ${s.tipo}`}>{tipo}</span>
      <span className={s.status}>
        <Selo status={status} />
      </span>
      <span className={`${s.celula} ${s.evento}`}>{evento}</span>
      <span className={`${s.celula} ${s.taxa}`}>{taxa}</span>
      <span className={`${s.celula} ${s.ciclos}`}>{ciclos}</span>

      <div
        className={s.acoes}
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
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
