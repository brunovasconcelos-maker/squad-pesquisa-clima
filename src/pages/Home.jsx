import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import CartaoPesquisa from '../components/lista/CartaoPesquisa.jsx'
import ModalConfirmar from '../components/fluxo/ModalConfirmar.jsx'
import Aviso from '../components/Aviso.jsx'
import { rotuloParticipantes } from './nova-pesquisa/estado.jsx'
import {
  ler,
  gravar,
  avaliarLista,
  duplicar,
  forcarInicio,
  encerrarCiclo,
  paraLinha,
  botaoDe,
  linkDaPesquisa,
  INTERVALO_MS,
} from '../lib/pesquisas.js'
import s from './Home.module.css'

import add from '../assets/icons/Add.svg'
import search from '../assets/icons/Search.svg'

/*
 * Home do módulo (Figma 8137:11498).
 *
 * As pesquisas vêm do localStorage. Como não há backend nem processo em
 * segundo plano, o motor de status só roda com a página aberta: uma vez na
 * carga e depois a cada 30s. Uma pesquisa que deveria ter virado ontem vira
 * na próxima carga, de uma vez só.
 *
 * A busca é decorativa por enquanto — não filtra nada.
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

const maisRecentePrimeiro = (a, b) =>
  new Date(b.atualizadoEm) - new Date(a.atualizadoEm)

export default function Home() {
  const navigate = useNavigate()
  const [pesquisas, setPesquisas] = useState([])
  const [confirmacao, setConfirmacao] = useState(null)
  const [aviso, setAviso] = useState('')
  const limparAviso = useCallback(() => setAviso(''), [])

  /* Grava junto com o setState: a lista em memória e a guardada não podem
     divergir, senão um F5 desfaz a última ação. */
  const aplicar = useCallback((proxima) => {
    setPesquisas(proxima)
    gravar(proxima)
  }, [])

  useEffect(() => {
    const rodar = () => {
      const { lista, mudou } = avaliarLista(ler())
      setPesquisas(lista)
      if (mudou) gravar(lista)
    }
    rodar()
    const id = setInterval(rodar, INTERVALO_MS)
    return () => clearInterval(id)
  }, [])

  const trocar = (id, transformar) =>
    aplicar(pesquisas.map((p) => (p.id === id ? transformar(p) : p)))

  const aoTransportar = (p) => {
    /* Pausar fecha o ciclo em curso e deixa a pesquisa em "Ativa |
       Aguardando": ela continua no ar, entre ciclos. Sair do ar é outra
       ação, e mora no interruptor "Publicar formulário". */
    if (botaoDe(p) === 'pausar') {
      trocar(p.id, (atual) => encerrarCiclo(atual))
      return
    }
    // Iniciar sobrescreve a data agendada, então pede confirmação.
    setConfirmacao({
      titulo: 'Iniciar agora?',
      texto: `"${p.nome}" começa imediatamente e passa a receber respostas, ignorando a data de envio agendada. Um novo ciclo é iniciado a partir de agora.`,
      rotulo: 'Iniciar',
      aoConfirmar: () => trocar(p.id, (atual) => forcarInicio(atual)),
    })
  }

  /*
   * Abrir uma pesquisa é ver o detalhe dela; abrir um rascunho é voltar para
   * o fluxo, na tela em que ele foi salvo.
   *
   * Um rascunho de antes de o passo ser guardado não tem onde cair, e aí vale
   * a regra antiga: com perguntas já geradas vai para a revisão, porque o
   * passo de template refaz a geração e apagaria o que estava lá.
   */
  const passoDoRascunho = (p) => {
    if (p.passo) return `/${p.passo}`
    return (p.perguntas?.length ?? 0) > 0 ? '/revisao' : ''
  }

  const aoAbrir = (p) => {
    if (p.status !== 'rascunho') {
      navigate(`/pesquisas/${p.id}`)
      return
    }
    navigate(`/rascunhos/${p.id}${passoDoRascunho(p)}`)
  }

  const aoDeletar = (p) =>
    setConfirmacao({
      titulo: 'Deletar pesquisa?',
      texto: `"${p.nome}" e tudo o que foi respondido nela serão removidos. Não dá para desfazer.`,
      rotulo: 'Deletar',
      aoConfirmar: () => aplicar(pesquisas.filter((q) => q.id !== p.id)),
    })

  const aoCopiarLink = async (p) => {
    try {
      await navigator.clipboard.writeText(linkDaPesquisa(p))
      setAviso('Link copiado')
    } catch {
      // Sem permissão de área de transferência (contexto inseguro, por ex.).
      setAviso('Não foi possível copiar o link')
    }
  }

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
          {[...pesquisas].sort(maisRecentePrimeiro).map((p) => (
            <CartaoPesquisa
              key={p.id}
              pesquisa={paraLinha(p, rotuloParticipantes)}
              onAbrir={() => aoAbrir(p)}
              onTransporte={() => aoTransportar(p)}
              onDuplicar={() => aplicar([...pesquisas, duplicar(p)])}
              onCopiarLink={() => aoCopiarLink(p)}
              onDeletar={() => aoDeletar(p)}
            />
          ))}
        </div>
      </div>

      <Aviso texto={aviso} onSumir={limparAviso} />

      {confirmacao ? (
        <ModalConfirmar
          titulo={confirmacao.titulo}
          texto={confirmacao.texto}
          rotuloConfirmar={confirmacao.rotulo}
          onConfirmar={() => {
            confirmacao.aoConfirmar()
            setConfirmacao(null)
          }}
          onCancelar={() => setConfirmacao(null)}
        />
      ) : null}
    </div>
  )
}
