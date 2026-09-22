import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaretLeft, GraduationCap, Plus, SlidersHorizontal, Square, CheckSquare } from '@phosphor-icons/react'
import arrowsDownUpIcon from '../assets/icons/ArrowsDownUp.svg'
import caretDownIcon from '../assets/icons/CaretDown.svg'
import Sidebar from '../components/Sidebar.jsx'
import BottomSearchBar from '../components/BottomSearchBar.jsx'
import BarraSelecao from '../components/lista/BarraSelecao.jsx'
import CartaoPesquisa from '../components/lista/CartaoPesquisa.jsx'
import ModalConfirmar from '../components/fluxo/ModalConfirmar.jsx'
import Aviso from '../components/Aviso.jsx'
import Botao from '../components/fluxo/Botao.jsx'
import { rotuloParticipantes, PASSOS } from './nova-pesquisa/estado.jsx'
import { taxaDe } from '../lib/participacao.js'
import {
  ler,
  gravar,
  erroDeLeitura,
  TEXTO_DE_LEITURA,
  ERRO_AO_GRAVAR,
  atualizarGuardadas,
  trocarGuardada,
  acrescentarGuardada,
  removerGuardada,
  avaliarLista,
  avisoDeInicio,
  duplicar,
  forcarInicio,
  encerrarCiclo,
  paraLinha,
  botaoDe,
  INTERVALO_MS,
} from '../lib/pesquisas.js'
import s from './Home.module.css'


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
 * "Organização". Mora na barra flutuante de baixo agora, porte do mesmo
 * componente do Gestão de Pessoas — o campo que ficava presa no topo saiu.
 *
 * Cabeçalho e sidebar também são o mesmo porte: "Voltar" e "Tutorial" ainda
 * não fazem nada, e a sidebar são só os cinco espaços reservados — os dois
 * marcam o lugar de uma navegação de produto compartilhada que ainda não
 * existe, para os dois módulos já nascerem parecidos.
 *
 * A tabela é outro porte do mesmo padrão (CollaboratorsTable de lá): a
 * caixa de seleção e a ordenação por Nome/% Resposta/Ciclos funcionam de
 * verdade agora, com a barra de seleção em massa entrando no lugar da busca
 * flutuante enquanto há linhas marcadas. Os filtros de coluna (Público,
 * Tipo, Status, Evento) e o botão "Filtros" continuam só visuais — essa
 * parte ainda não tem regra nenhuma por trás.
 */
/* Mesma ordem das células de `CartaoPesquisa`, para as larguras baterem com
   as da linha. `tipo` diz só qual ícone entra — nenhuma das duas abre nada
   ainda. */
const COLUNAS = [
  { chave: 'nome', rotulo: 'Nome da Pesquisa', classe: 'nomeCabecalho', tipo: 'ordenar' },
  { chave: 'publico', rotulo: 'Público', classe: 'publicoCabecalho', tipo: 'filtrar' },
  { chave: 'tipo', rotulo: 'Tipo', classe: 'tipoCabecalho', tipo: 'filtrar' },
  { chave: 'status', rotulo: 'Status', classe: 'statusCabecalho', tipo: 'filtrar' },
  { chave: 'evento', rotulo: 'Evento', classe: 'eventoCabecalho', tipo: 'filtrar' },
  { chave: 'taxa', rotulo: '% Resposta', classe: 'taxaCabecalho', tipo: 'ordenar' },
  { chave: 'ciclos', rotulo: 'Ciclos', classe: 'ciclosCabecalho', tipo: 'ordenar' },
]

const maisRecentePrimeiro = (a, b) =>
  new Date(b.atualizadoEm) - new Date(a.atualizadoEm)

/*
 * Comparações das três colunas ordenáveis, cada uma com sua própria noção de
 * "sem valor" — rascunho não tem taxa nem ciclos ainda, e agendada não tem
 * taxa. Essas linhas vão sempre para o fim, ordem crescente ou não, em vez
 * de competir como zero contra pesquisas que de fato respondem por zero.
 */
const ordenarPorNome = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR')

const semValorPara = (final) => (a, b) => {
  const va = final(a)
  const vb = final(b)
  if (va === null && vb === null) return 0
  if (va === null) return 1
  if (vb === null) return -1
  return va - vb
}

const ordenarPorTaxa = semValorPara((p) =>
  p.status === 'rascunho' || p.status === 'agendada' ? null : taxaDe(p),
)

const ordenarPorCiclos = semValorPara((p) => (p.status === 'rascunho' ? null : p.ciclos ?? 0))

const ORDENACOES = { nome: ordenarPorNome, taxa: ordenarPorTaxa, ciclos: ordenarPorCiclos }

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
  const [sortColuna, setSortColuna] = useState(null)
  const [selecionados, setSelecionados] = useState(() => new Set())
  /* Leitura que falhou fica na tela até ser resolvida, e não some sozinha
     como um aviso passageiro: a lista vazia embaixo dela é justamente o que
     precisa de explicação. */
  const [falhaDeLeitura, setFalhaDeLeitura] = useState(null)
  const limparAviso = useCallback(() => setAviso(''), [])

  /*
   * Toda ação da lista passa por aqui: a escrita relê antes de mudar, e o
   * que volta dela — a lista guardada de verdade — é o que a tela passa a
   * mostrar. Antes a tela mostrava a lista de memória e gravava por cima, o
   * que apagava o que outra aba tivesse acrescentado no meio-tempo.
   *
   * Escrita recusada não muda a tela: mostrar a alteração e avisar que ela
   * não foi salva deixa a tela dizendo uma coisa e o armazenamento outra.
   */
  const aplicar = useCallback((resultado) => {
    if (resultado.ok) setPesquisas(resultado.lista)
    else setAviso(resultado.erro)
  }, [])

  useEffect(() => {
    const rodar = () => {
      const { lista, mudou } = avaliarLista(ler())
      const falha = erroDeLeitura()
      setFalhaDeLeitura(falha)
      setPesquisas(lista)
      /* Sem ter conseguido ler, o que o motor calculou saiu de uma lista
         vazia: gravar isso trocaria tudo o que existe por nada. */
      if (mudou && !falha && !gravar(lista)) setAviso(ERRO_AO_GRAVAR)
    }
    rodar()
    const id = setInterval(rodar, INTERVALO_MS)
    return () => clearInterval(id)
  }, [])

  const trocar = (id, transformar) => aplicar(trocarGuardada(id, transformar))

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
   * a regra antiga: com perguntas já geradas vai para a revisão, porque
   * escolher o template de novo refaz a geração e apagaria o que estava lá.
   * Sem perguntas, cai no nome — que é onde o fluxo começa a ter o que
   * guardar, e onde estes rascunhos foram salvos quando essa era a primeira
   * tela.
   *
   * A mesma regra vale para um `passo` que não é mais um dos passos do fluxo
   * — "template", de antes de a escolha do template virar a rota índice.
   * Sem isto o rascunho caía numa rota que não existe mais e o catch-all
   * mandava de volta para a home sem dizer por quê, como se o clique não
   * tivesse feito nada.
   */
  const passoDoRascunho = (p) => {
    if (p.passo && PASSOS.includes(p.passo)) return `/${p.passo}`
    return (p.perguntas?.length ?? 0) > 0 ? '/revisao' : '/nome'
  }

  const aoAbrir = (p) => {
    if (p.status !== 'rascunho') {
      navigate(`/pesquisas/${p.id}`)
      return
    }
    navigate(`/rascunhos/${p.id}${passoDoRascunho(p)}`)
  }

  /* Sem confirmação, igual à deleção em massa: as duas são o mesmo tanto de
     irreversível, e pedir "tem certeza?" só de uma delas seria inconsistente
     sem deixá-la mais segura de verdade. */
  const aoDeletar = (p) => aplicar(removerGuardada(p.id))

  /*
   * Seleção e ordenação vivem só na tela: nada disso é gravado, e recarregar
   * a página zera as duas. Marcar uma linha muda o que aparece pintado e o
   * conteúdo da barra flutuante de baixo, nunca o que está no armazenamento.
   */
  const aoOrdenar = (coluna) =>
    setSortColuna((atual) => (atual === coluna ? null : coluna))

  const aoSelecionar = (id) =>
    setSelecionados((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })

  const aoDuplicarSelecionados = () => {
    aplicar(
      atualizarGuardadas((lista) => [
        ...lista,
        ...lista.filter((p) => selecionados.has(p.id)).map((p) => duplicar(p)),
      ]),
    )
    setSelecionados(new Set())
  }

  const aoDeletarSelecionados = () => {
    aplicar(atualizarGuardadas((lista) => lista.filter((p) => !selecionados.has(p.id))))
    setSelecionados(new Set())
  }

  const procurado = normalizar(busca)
  let encontradas = [...pesquisas]
    .filter((p) => !procurado || normalizar(p.nome).includes(procurado))
    .sort(maisRecentePrimeiro)
  if (sortColuna) encontradas = [...encontradas].sort(ORDENACOES[sortColuna])

  const idsVisiveis = encontradas.map((p) => p.id)
  const todosSelecionados =
    idsVisiveis.length > 0 && idsVisiveis.every((id) => selecionados.has(id))
  const aoSelecionarTodos = () =>
    setSelecionados(todosSelecionados ? new Set() : new Set(idsVisiveis))

  return (
    <div className={s.layout}>
      <Sidebar />
      {/* Marco principal da página: sem ele, quem navega por marcos não tem
          como pular a sidebar e cair no conteúdo. */}
      <main className={s.coluna}>
        <div className={s.cabecalho}>
          <div className={s.tituloLinha}>
            <div className={s.tituloGrupo}>
              {/* Ainda não recua para lugar nenhum — só marca onde a volta
                  vai entrar quando este módulo tiver de onde voltar. */}
              <button type="button" className={s.iconeCirculo} aria-label="Voltar">
                <CaretLeft size={24} />
              </button>
              <h1 className={s.titulo}>Pesquisa de Clima</h1>
            </div>
            <div className={s.acoesGrupo}>
              {/* Também só visual por enquanto — sem tutorial escrito ainda.
                  Cinza, e não preto como o "Voltar": o Figma diferencia os
                  dois. */}
              <button type="button" className={s.iconeCirculo} aria-label="Tutorial">
                <GraduationCap size={24} color="var(--cor-texto-secundario)" />
              </button>
              {/* Pílula "Novo" (Figma 8222:2410); o clique continua o mesmo
                  de sempre, só o ícone virou Phosphor. */}
              <Botao variante="marca" onClick={() => navigate('/pesquisas/nova')}>
                Novo
                <Plus size={24} />
              </Botao>
            </div>
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

        <div className={s.ferramentas}>
          <span className={s.total}>Total: {pesquisas.length} pesquisas</span>
          {/* Mesmo tratamento do "Voltar"/"Tutorial": só o visual do botão
              chegou, filtro de verdade fica para depois. */}
          <Botao variante="contorno">
            Filtros
            <SlidersHorizontal size={24} />
          </Botao>
        </div>

        {/* Só os três cabeçalhos ordenáveis são de verdade — os de filtro
            continuam decorativos, então ficam fora do alcance do teclado.
            O rótulo de cada coluna também vai junto do rótulo de cada linha
            (ver `rotuloDaLinha` em CartaoPesquisa): quem usa leitor de tela
            ouve a coluna duas vezes só nas ordenáveis, e isso é o preço de
            elas terem função de verdade agora. */}
        <div className={s.tabela}>
          <button
            type="button"
            className={s.checkboxCabecalho}
            aria-label={todosSelecionados ? 'Desmarcar todas' : 'Selecionar todas'}
            aria-pressed={todosSelecionados}
            onClick={aoSelecionarTodos}
          >
            {todosSelecionados ? (
              <CheckSquare size={24} color="var(--cor-texto)" />
            ) : (
              <Square size={24} color="#c2c8c8" />
            )}
          </button>
          {COLUNAS.map(({ chave, rotulo, classe, tipo }) => {
            const ordenavel = tipo === 'ordenar'
            return (
              <button
                type="button"
                key={chave}
                className={`${s.celulaCabecalho} ${s[classe]}`}
                tabIndex={ordenavel ? 0 : -1}
                aria-pressed={ordenavel ? sortColuna === chave : undefined}
                onClick={ordenavel ? () => aoOrdenar(chave) : undefined}
              >
                <span>{rotulo}</span>
                {ordenavel ? (
                  <img src={arrowsDownUpIcon} width={16} height={16} alt="" />
                ) : (
                  <img src={caretDownIcon} width={16} height={16} alt="" />
                )}
              </button>
            )
          })}
          <span className={s.acoesCabecalho} />
        </div>

        {/* `group` e não `list`: as linhas são botões, e uma lista cujos
            itens não são `listitem` é ARIA inválida — o leitor de tela
            ignoraria a lista ou anunciaria errado. O grupo dá o nome sem
            mentir sobre a estrutura. */}
        <div className={s.linhas} role="group" aria-label="Pesquisas">
          {encontradas.map((p) => (
            <CartaoPesquisa
              key={p.id}
              pesquisa={paraLinha(p, rotuloParticipantes)}
              selecionado={selecionados.has(p.id)}
              onSelecionar={() => aoSelecionar(p.id)}
              onAbrir={() => aoAbrir(p)}
              onTransporte={() => aoTransportar(p)}
              onDuplicar={() => aplicar(acrescentarGuardada(duplicar(p)))}
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
      </main>

      {/* Mesmo lugar na tela, uma coisa de cada vez: selecionar alguma linha
          troca a busca flutuante pela barra de ações em massa, e fechá-la
          devolve a busca — nunca as duas ao mesmo tempo. */}
      {selecionados.size > 0 ? (
        <BarraSelecao
          quantidade={selecionados.size}
          onDuplicar={aoDuplicarSelecionados}
          onDeletar={aoDeletarSelecionados}
          onFechar={() => setSelecionados(new Set())}
        />
      ) : (
        <BottomSearchBar onBuscar={setBusca} />
      )}

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
