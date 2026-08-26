import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import { ler } from '../../lib/pesquisas.js'
import AbaGeral from './AbaGeral.jsx'
import { EXEMPLOS } from './exemplosGeral.js'
import s from './TelaDetalhe.module.css'

import close from '../../assets/icons/Close.svg'

/*
 * Detalhe de uma pesquisa (Figma 8151:11666).
 *
 * Por enquanto é só a moldura: cabeçalho, abas e um miolo vazio. O conteúdo
 * de cada aba entra depois, uma de cada vez.
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
  const [busca] = useSearchParams()

  /* A aba Geral ainda é desenho: `?exemplo=1..3` escolhe qual das três
     variações mostrar, para conferir os estados sem ter de fabricar a
     pesquisa correspondente. Sai quando ela passar a ler dados de verdade. */
  const escolhido = Number(busca.get('exemplo')) || 1
  const exemplo = EXEMPLOS[Math.min(Math.max(escolhido, 1), EXEMPLOS.length) - 1]

  const pesquisa = useMemo(() => ler().find((p) => p.id === id), [id])

  /* Link velho ou pesquisa deletada: volta para a lista em vez de mostrar um
     cabeçalho sem nome. */
  useEffect(() => {
    if (!pesquisa) navigate('/', { replace: true })
  }, [pesquisa, navigate])

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
        {ativa === 'Geral' ? <AbaGeral exemplo={exemplo} /> : null}
      </div>
    </div>
  )
}
