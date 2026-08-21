import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import CartaoPesquisa from '../components/lista/CartaoPesquisa.jsx'
import { PESQUISAS_EXEMPLO } from '../components/lista/pesquisasExemplo.js'
import s from './Home.module.css'

import add from '../assets/icons/Add.svg'
import search from '../assets/icons/Search.svg'

/*
 * Home do módulo (Figma 8137:11498).
 *
 * A busca é decorativa por enquanto — não filtra nada, e não há o que filtrar
 * até as pesquisas existirem.
 *
 * As linhas são exemplo fixo por enquanto; o cartão já recebe tudo por prop,
 * então trocar a fonte dos dados não mexe nele.
 *
 * O Figma tem um botão de settings à esquerda do "+", mas com opacity 0.
 * Ficou de fora: um botão invisível e clicável é pior que ausente.
 */
const COLUNAS = [
  { nome: 'Nome da Pesquisa', largura: 214 },
  { nome: 'Público', largura: 120 },
  { nome: 'Tipo', largura: 120 },
  { nome: 'Status', largura: 140 },
  { nome: 'Evento', largura: 140 },
  // 110px é o que quebra "Taxa de Resposta" em duas linhas, como no Figma.
  { nome: 'Taxa de Resposta', largura: 110 },
  { nome: 'Ciclos', largura: 60 },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className={s.layout}>
      <Sidebar />
      <div className={s.coluna}>
        <div className={s.cabecalho}>
          <div className={s.tituloLinha}>
            <h1 className={s.titulo}>Pesquisa de Clima</h1>
            <button
              type="button"
              className={s.novo}
              aria-label="Nova Pesquisa"
              onClick={() => navigate('/pesquisas/nova')}
            >
              <img className={s.icone} src={add} alt="" width={24} height={24} />
            </button>
          </div>

          <div className={s.busca}>
            <img className={s.icone} src={search} alt="" width={24} height={24} />
            <input
              className={s.buscaCampo}
              type="text"
              placeholder="Pesquisar por uma pesquisa..."
              aria-label="Pesquisar por uma pesquisa"
            />
          </div>
        </div>

        <div className={s.tabela}>
          {COLUNAS.map(({ nome, largura }) => (
            <span key={nome} className={s.coluna1} style={{ width: largura }}>
              {nome}
            </span>
          ))}
        </div>

        <div className={s.linhas}>
          {PESQUISAS_EXEMPLO.map((pesquisa) => (
            <CartaoPesquisa key={pesquisa.id} pesquisa={pesquisa} />
          ))}
        </div>
      </div>
    </div>
  )
}
