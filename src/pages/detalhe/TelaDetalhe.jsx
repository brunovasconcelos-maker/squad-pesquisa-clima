import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import {
  ler,
  gravar,
  avaliarLista,
  ehRecorrente,
  INTERVALO_MS,
} from '../../lib/pesquisas.js'
import { sincronizar } from '../../lib/respostas.js'
import { sincronizarHistorico } from '../../lib/historico.js'
import AbaGeral from './AbaGeral.jsx'
import AbaPerguntas from './AbaPerguntas.jsx'
import AbaRespostas from './AbaRespostas.jsx'
import AbaHistorico from './AbaHistorico.jsx'
import AbaConfiguracoes from './AbaConfiguracoes.jsx'
import s from './TelaDetalhe.module.css'

import close from '../../assets/icons/Close.svg'

/*
 * Detalhe de uma pesquisa (Figma 8151:11666).
 *
 * Cabeçalho, abas e o conteúdo da aba ativa.
 *
 * Roda o motor de status igual à home — na carga e a cada 30s — porque as
 * datas e a taxa que a Geral mostra são as mesmas que ele faz andar. Sem
 * isso, um ciclo que vencesse com a página aberta continuaria mostrando o
 * status velho até alguém voltar para a lista.
 *
 * A aba fica em estado local, e não na URL, porque trocar de aba não é um
 * passo de navegação: voltar no browser deve sair do detalhe, não desfazer o
 * clique na aba. Mesma decisão dos modais do fluxo.
 *
 * Chegar numa aba específica é outra coisa — é navegação —, e vem pelo state
 * da rota: é assim que a tela do ciclo devolve a pessoa ao Histórico. Num F5
 * o state se perde e a tela abre no Geral, como qualquer visita direta.
 *
 * "Histórico" é a lista de ciclos anteriores, e uma pesquisa Única só tem um:
 * a aba só existe para as recorrentes.
 */
const ABAS = ['Geral', 'Perguntas', 'Respostas', 'Histórico', 'Configurações']

const abasDe = (pesquisa) =>
  ehRecorrente(pesquisa) ? ABAS : ABAS.filter((aba) => aba !== 'Histórico')

export default function TelaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [ativa, setAtiva] = useState(
    ABAS.includes(state?.aba) ? state.aba : ABAS[0],
  )
  const [pesquisas, setPesquisas] = useState(null)

  /* O motor roda aqui como na home, e logo depois as respostas simuladas
     desta pesquisa acertam o passo com a taxa que ele acabou de subir — as
     duas abas contam a mesma coisa, então não podem sincronizar em momentos
     diferentes. Só esta pesquisa: as outras sincronizam quando forem abertas. */
  useEffect(() => {
    const rodar = () => {
      const { lista, mudou } = avaliarLista(ler())
      let proxima = lista
      let precisaGravar = mudou
      const antes = lista.find((p) => p.id === id)
      /* Respostas do ciclo em curso e histórico dos que fecharam: os dois
         acertam o passo com o motor que acabou de rodar. */
      const depois = antes && sincronizarHistorico(sincronizar(antes))
      if (depois && depois !== antes) {
        proxima = lista.map((p) => (p.id === id ? depois : p))
        precisaGravar = true
      }
      setPesquisas(proxima)
      if (precisaGravar) gravar(proxima)
    }
    rodar()
    const t = setInterval(rodar, INTERVALO_MS)
    return () => clearInterval(t)
  }, [id])

  const pesquisa = pesquisas?.find((p) => p.id === id)
  const abas = pesquisa ? abasDe(pesquisa) : ABAS

  /* Grava junto com o setState, como a home: a lista em memória e a guardada
     não podem divergir, senão um F5 desfaz a última edição. */
  const alterar = useCallback(
    (transformar) =>
      setPesquisas((lista) => {
        const proxima = lista.map((p) =>
          p.id === id
            ? { ...transformar(p), atualizadoEm: new Date().toISOString() }
            : p,
        )
        gravar(proxima)
        return proxima
      }),
    [id],
  )

  /* Link velho ou pesquisa deletada: volta para a lista em vez de mostrar um
     cabeçalho sem nome. `pesquisas` nulo é a primeira renderização, antes de
     ler o storage — aí ainda não dá para dizer que não existe. */
  useEffect(() => {
    if (pesquisas && !pesquisa) navigate('/', { replace: true })
  }, [pesquisas, pesquisa, navigate])

  if (!pesquisa) return null

  /* Trocar a frequência para "Não repete" com a aba de Histórico aberta some
     com ela; a Geral é o destino, como em qualquer visita direta. */
  const visivel = abas.includes(ativa) ? ativa : ABAS[0]

  return (
    <div className={s.tela}>
      <header className={s.cabecalho}>
        <p className={s.titulo}>{pesquisa.nome}</p>

        <div className={s.abas} role="tablist" aria-label="Seções da pesquisa">
          {abas.map((aba) => (
            <button
              type="button"
              key={aba}
              id={`aba-${aba}`}
              className={`${s.aba} ${aba === visivel ? s.ativa : ''}`}
              role="tab"
              aria-selected={aba === visivel}
              aria-controls={`painel-${aba}`}
              onClick={() => setAtiva(aba)}
            >
              {aba}
            </button>
          ))}
        </div>

        <div className={s.acoes}>
          <IconeBotao src={close} rotulo="Fechar" onClick={() => navigate('/')} />
        </div>
      </header>

      <div
        className={s.miolo}
        id={`painel-${visivel}`}
        role="tabpanel"
        aria-labelledby={`aba-${visivel}`}
      >
        {visivel === 'Geral' ? <AbaGeral pesquisa={pesquisa} /> : null}
        {visivel === 'Perguntas' ? (
          <AbaPerguntas pesquisa={pesquisa} onAlterar={alterar} />
        ) : null}
        {visivel === 'Respostas' ? (
          <AbaRespostas pesquisa={pesquisa} onAlterar={alterar} />
        ) : null}
        {visivel === 'Histórico' ? <AbaHistorico pesquisa={pesquisa} /> : null}
        {visivel === 'Configurações' ? (
          <AbaConfiguracoes pesquisa={pesquisa} onAlterar={alterar} />
        ) : null}
      </div>
    </div>
  )
}
