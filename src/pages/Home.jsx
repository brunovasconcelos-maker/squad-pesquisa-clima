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
  erroDeLeitura,
  TEXTO_DE_LEITURA,
  ERRO_AO_GRAVAR,
  avaliarLista,
  avisoDeInicio,
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
 * A busca filtra pelo nome, sem acento e sem caixa: quem procura "clima" tem
 * de achar "Clima Geral" e "CLIMA", e quem digita "organizacao" tem de achar
 * "Organização".
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

/* Comparação frouxa de propósito: acento e caixa não deveriam esconder uma
   pesquisa de quem está procurando por ela. */
const normalizar = (t) =>
  (t || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export default function Home() {
  const navigate = useNavigate()
  const [pesquisas, setPesquisas] = useState([])
  const [confirmacao, setConfirmacao] = useState(null)
  const [aviso, setAviso] = useState('')
  const [busca, setBusca] = useState('')
  /* Leitura que falhou fica na tela até ser resolvida, e não some sozinha
     como um aviso passageiro: a lista vazia embaixo dela é justamente o que
     precisa de explicação. */
  const [falhaDeLeitura, setFalhaDeLeitura] = useState(null)
  const limparAviso = useCallback(() => setAviso(''), [])

  /* Grava junto com o setState: a lista em memória e a guardada não podem
     divergir, senão um F5 desfaz a última ação. Gravação que não passou é
     dita na hora — a tela mostraria a mudança e o F5 seguinte a desfaria. */
  const aplicar = useCallback((proxima) => {
    setPesquisas(proxima)
    if (!gravar(proxima)) setAviso(ERRO_AO_GRAVAR)
  }, [])

  useEffect(() => {
    const rodar = () => {
      const { lista, mudou } = avaliarLista(ler())
      setFalhaDeLeitura(erroDeLeitura())
      setPesquisas(lista)
      if (mudou && !gravar(lista)) setAviso(ERRO_AO_GRAVAR)
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
      ...avisoDeInicio(p),
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

  const procurado = normalizar(busca)
  const encontradas = [...pesquisas]
    .filter((p) => !procurado || normalizar(p.nome).includes(procurado))
    .sort(maisRecentePrimeiro)

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
              value={busca}
              placeholder="Pesquisar por uma pesquisa..."
              aria-label="Pesquisar por uma pesquisa"
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        {/* Leitura que falhou: sem isto a tabela vazia logo abaixo diria que
            nunca houve pesquisa nenhuma. */}
        {falhaDeLeitura ? (
          <div className={s.falha} role="alert">
            <p className={s.falhaTitulo}>
              {TEXTO_DE_LEITURA[falhaDeLeitura] ?? TEXTO_DE_LEITURA.ilegivel}
            </p>
            <p className={s.falhaApoio}>
              A lista abaixo está vazia porque nada pôde ser lido, e não porque
              não existam pesquisas. Nada foi apagado: criar ou editar algo
              agora é que sobrescreve o que está guardado.
            </p>
          </div>
        ) : null}

        <div className={s.tabela}>
          {COLUNAS.map(({ nome, largura }) => (
            <span key={nome} className={s.coluna1} style={{ width: largura }}>
              {nome}
            </span>
          ))}
        </div>

        <div className={s.linhas}>
          {encontradas.map((p) => (
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

          {/* A lista some quando nada bate; dizer isso é melhor do que deixar
              a tabela vazia parecendo que a busca travou. */}
          {procurado && encontradas.length === 0 ? (
            <p className={s.vazio}>
              Nenhuma pesquisa com &quot;{busca.trim()}&quot; no nome.
            </p>
          ) : null}
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
