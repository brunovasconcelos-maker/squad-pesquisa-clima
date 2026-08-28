import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import { ler, gravar, avaliarLista, INTERVALO_MS } from '../../lib/pesquisas.js'
import { sincronizar } from '../../lib/respostas.js'
import AbaGeral from './AbaGeral.jsx'
import AbaPerguntas from './AbaPerguntas.jsx'
import AbaRespostas from './AbaRespostas.jsx'
import s from './TelaDetalhe.module.css'

import close from '../../assets/icons/Close.svg'

/*
 * Detalhe de uma pesquisa (Figma 8151:11666).
 *
 * Cabeçalho, abas e o conteúdo da aba ativa. Só a Geral existe por enquanto.
 *
 * Roda o motor de status igual à home — na carga e a cada 30s — porque as
 * datas e a taxa que a Geral mostra são as mesmas que ele faz andar. Sem
 * isso, um ciclo que vencesse com a página aberta continuaria mostrando o
 * status velho até alguém voltar para a lista.
 *
 * A aba fica em estado local, e não na URL, porque trocar de aba não é um
 * passo de navegação: voltar no browser deve sair do detalhe, não desfazer o
 * clique na aba. Mesma decisão dos modais do fluxo.
 */
const ABAS = ['Geral', 'Perguntas', 'Respostas', 'Histórico', 'Configurações']

export default function TelaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ativa, setAtiva] = useState(ABAS[0])
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
      const depois = antes && sincronizar(antes)
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

  return (
    <div className={s.tela}>
      <header className={s.cabecalho}>
        <p className={s.titulo}>{pesquisa.nome}</p>

        <div className={s.abas} role="tablist" aria-label="Seções da pesquisa">
          {ABAS.map((aba) => (
            <button
              type="button"
              key={aba}
              id={`aba-${aba}`}
              className={`${s.aba} ${aba === ativa ? s.ativa : ''}`}
              role="tab"
              aria-selected={aba === ativa}
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
        id={`painel-${ativa}`}
        role="tabpanel"
        aria-labelledby={`aba-${ativa}`}
      >
        {ativa === 'Geral' ? <AbaGeral pesquisa={pesquisa} /> : null}
        {ativa === 'Perguntas' ? (
          <AbaPerguntas pesquisa={pesquisa} onAlterar={alterar} />
        ) : null}
        {ativa === 'Respostas' ? (
          <AbaRespostas pesquisa={pesquisa} onAlterar={alterar} />
        ) : null}
      </div>
    </div>
  )
}
