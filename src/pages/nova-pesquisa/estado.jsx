import { createContext, useContext, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { gerarPerguntas } from './bancoDePerguntas.js'
import { ABERTURA_TEMPLATE, ABERTURA_BRANCO } from './perguntasExemplo.js'
import { formatarLongo, somarDias } from '../../lib/datas.js'
import {
  criarRascunho,
  gravar,
  guardar,
  ler,
  ERRO_AO_GRAVAR,
} from '../../lib/pesquisas.js'
import iguais from '../../lib/iguais.js'
import ModalSairDoFluxo from './ModalSairDoFluxo.jsx'
import TelaRascunhoSumido from './TelaRascunhoSumido.jsx'
import { CAPA_PADRAO } from '../../lib/capa.js'

/*
 * Estado do fluxo "Nova Pesquisa".
 *
 * Vive num layout de rota que envolve as telas, e não em cada uma: assim ele
 * sobrevive à navegação entre os passos e some quando o fluxo é abandonado.
 *
 * "Toda empresa" e os grupos são seleções independentes — dá para marcar os
 * dois. Quando isso acontece, o rótulo mostra "Toda a empresa", que é o
 * conjunto maior.
 */

/* Uma semana de antecedência: prazo para revisar e avisar o time antes de a
   pesquisa sair. */
const DIAS_ATE_O_ENVIO = 7

export const MENSAGEM_FINAL_PADRAO =
  'Obrigado por dedicar esses minutos pra compartilhar sua visão. Cada resposta ajuda o time de design a crescer e trabalhar melhor, juntos. Até a próxima pesquisa.'

/*
 * Configuração do último passo. Os padrões são o que o Figma desenha na tela
 * estática, incluindo os três interruptores do modal de avançadas.
 *
 * `envio` e `prazo` guardam data e hora como texto solto porque os campos são
 * de texto livre — não há date picker ainda.
 *
 * É função, e não constante, por causa das datas: a do Figma era fixa e já
 * tinha vencido, o que fazia toda pesquisa nova nascer com o envio no
 * passado. Calculadas na hora em que o fluxo começa, e não na carga do
 * módulo, para que uma aba deixada aberta a noite toda não ofereça ontem.
 */
export function configuracaoInicial(hoje = new Date()) {
  const envio = somarDias(hoje, DIAS_ATE_O_ENVIO)
  return {
    respostasAnonimas: true,
    envio: { data: formatarLongo(envio), hora: '10:30', imediato: false },
    recorrencia: 'Recorrente',
    frequencia: 'Mensal',
    // tipo: 'periodo' usa `periodo`; 'data' usa `data` e `hora`.
    prazo: {
      tipo: 'periodo',
      periodo: '1 semana',
      // Só aparece se o usuário trocar para data específica. Uma semana
      // depois do envio, que é o mesmo que o período padrão ao lado.
      data: formatarLongo(somarDias(envio, 7)),
      hora: '10:30',
    },
    /* Sem data de encerramento: a recorrente repete indefinidamente até
       alguém estipular um fim. É a única forma de ela chegar a "Encerrada". */
    encerramento: { data: '', hora: '18:00', semData: true },
    mensagemFinal: MENSAGEM_FINAL_PADRAO,
    avancadas: {
      lembrete: 'Diário',
      barraProgresso: true,
      embaralhar: false,
      obrigatorias: true,
    },
  }
}

const estadoInicial = () => ({
  nome: '',
  // Começa em "Toda a empresa" porque é o que a tela 1 do Figma mostra. Se o
  // usuário desmarcar tudo no modal, o Continuar volta a travar.
  participantes: { todaEmpresa: true, grupos: [], pessoas: [] },
  template: null,
  // Quantidade escolhida na tela 5; a lista gerada mora em `perguntas`.
  quantidade: 10,
  prompt: '',
  perguntas: [],
  // Parágrafo do card de Abertura. Fica no estado, e não como constante da
  // tela, porque agora é editável.
  abertura: ABERTURA_TEMPLATE,
  // A faixa da Revisão nasce com o gradiente do Figma e é editável ali
  // mesmo, pelo botão "Editar Capa".
  capa: CAPA_PADRAO,
  configuracao: configuracaoInicial(),
})

/*
 * O caminho de volta: um rascunho guardado vira o estado do fluxo outra vez.
 *
 * Só os campos do fluxo entram — status, ciclos e taxa são da pesquisa
 * guardada, não do que se está montando. O que faltar cai no inicial, que é o
 * caso de um rascunho gravado antes de o campo existir.
 */
export function doRascunho(guardada) {
  const inicial = estadoInicial()
  return {
    nome: guardada.nome ?? inicial.nome,
    participantes: guardada.participantes ?? inicial.participantes,
    template: guardada.template ?? inicial.template,
    quantidade: guardada.quantidade ?? inicial.quantidade,
    prompt: guardada.prompt ?? inicial.prompt,
    perguntas: guardada.perguntas ?? inicial.perguntas,
    abertura: guardada.abertura ?? inicial.abertura,
    capa: guardada.capa ?? inicial.capa,
    configuracao: guardada.configuracao ?? inicial.configuracao,
  }
}

/*
 * Os passos que o fluxo tem, na ordem. Serve para ler de volta em qual deles
 * a pessoa estava: o índice é o último pedaço do caminho, e não tem nome.
 */
export const PASSOS = [
  'template',
  'perguntas',
  'prompt',
  'carregando',
  'revisao',
  'configuracao',
]

/* O passo de um caminho do fluxo. Vazio na tela 1, que é a rota índice. */
export function passoDaRota(caminho) {
  const ultimo = caminho.split('/').filter(Boolean).pop()
  return PASSOS.includes(ultimo) ? ultimo : ''
}

export const GRUPOS = ['Atendimento', 'Vendas', 'Design']

/* Diretório de pessoas — fixo, do tamanho de um exemplo. A busca do modal de
   participantes procura tanto pelo nome quanto pelo e-mail inteiro. */
export const PESSOAS = [
  'bruno.vasconcelos@inner.ai',
  'gustavo.lima@inner.ai',
  'kaue.chamizo@inner.ai',
]

/* "bruno.vasconcelos@inner.ai" -> "Bruno Vasconcelos". */
export function nomeDaPessoa(email) {
  return (email.split('@')[0] || '')
    .split('.')
    .filter(Boolean)
    .map((parte) => parte[0].toUpperCase() + parte.slice(1))
    .join(' ')
}

export const PERGUNTAS_MIN = 1
export const PERGUNTAS_MAX = 20

/* 45 segundos por pergunta, arredondando para o minuto mais próximo. O .5
   sobe: 10 perguntas dão 7,5 minutos e viram 8. Nunca chega a zero, porque
   já a primeira pergunta arredonda 0,75 para 1. */
const SEGUNDOS_POR_PERGUNTA = 45

export function minutosEstimados(perguntas) {
  return Math.round((perguntas * SEGUNDOS_POR_PERGUNTA) / 60)
}

/* Os textos de exemplo da tela 6, um por template. */
const PROMPTS = {
  clima: (p) =>
    `Medir satisfação, carga de trabalho e clima de ${p}, incluindo percepção sobre prazos, colaboração e reconhecimento.`,
  feedback: (p) =>
    `Coletar feedback de ${p} sobre um evento, entrega ou período recente.`,
  solicitacao: (p) =>
    `Levantar solicitações e necessidades de ${p} em relação a processos ou recursos internos.`,
  desligamento: (p) =>
    `Entender os motivos de saída e a experiência de ${p} durante sua passagem pela empresa.`,
}

export function temParticipantes({ todaEmpresa, grupos, pessoas = [] }) {
  return todaEmpresa || grupos.length > 0 || pessoas.length > 0
}

/*
 * Como a seleção é escrita numa linha só. Grupos e pessoas podem estar
 * marcados juntos, então quando há dos dois o rótulo conta os dois.
 */
function descrever({ todaEmpresa, grupos = [], pessoas = [] }, empresa) {
  if (todaEmpresa) return empresa
  const partes = []
  if (grupos.length === 1) partes.push(grupos[0])
  else if (grupos.length > 1) partes.push(`${grupos.length} grupos`)
  if (pessoas.length === 1) partes.push(nomeDaPessoa(pessoas[0]))
  else if (pessoas.length > 1) partes.push(`${pessoas.length} pessoas`)
  return partes.join(' e ')
}

/* Rótulo da linha da tela 1: começa com maiúscula. */
export function rotuloParticipantes(selecao) {
  return descrever(selecao || {}, 'Toda a empresa')
}

/* Mesma seleção, mas no meio de uma frase — daí o minúsculo. */
export function fraseParticipantes(selecao) {
  return descrever(selecao || {}, 'toda a empresa')
}

export function montarPrompt(template, participantes) {
  const construir = PROMPTS[template]
  return construir ? construir(fraseParticipantes(participantes)) : ''
}

const Contexto = createContext(null)

export function usePesquisa() {
  const valor = useContext(Contexto)
  if (!valor) {
    throw new Error('usePesquisa precisa estar dentro de PesquisaProvider')
  }
  return valor
}

export default function PesquisaProvider() {
  const navigate = useNavigate()
  /* Com id na rota o fluxo está retomando um rascunho; sem id, começando do
     zero. É a única diferença entre os dois — daí a mesma moldura servir
     para /pesquisas/nova e /rascunhos/:id. */
  const { id: idDoRascunho } = useParams()
  const { pathname } = useLocation()
  /* Rascunho que não existe mais: apagado, link velho, id digitado errado.
     Abrir o fluxo em branco fazia o passo seguinte criar uma pesquisa nova
     sem ninguém pedir — quem clicou queria continuar uma que já existia. */
  const [rascunhoSumiu] = useState(
    () => Boolean(idDoRascunho) && !ler().some((p) => p.id === idDoRascunho),
  )

  const [pesquisa, setPesquisa] = useState(() => {
    if (!idDoRascunho) return estadoInicial()
    const guardada = ler().find((p) => p.id === idDoRascunho)
    return guardada ? doRascunho(guardada) : estadoInicial()
  })
  /* Como o fluxo estava ao abrir. É contra isto que se decide se há algo a
     perder: o estado inicial em branco de uma pesquisa nova, ou o rascunho
     como foi retomado. Guardado uma vez, no primeiro render — refazer o
     estado inicial na hora de comparar daria outras datas de envio. */
  const [original] = useState(pesquisa)
  /* O X de qualquer tela do fluxo pergunta antes de sair. A pergunta mora
     aqui, e não em cada tela, porque a resposta é a mesma nas seis e o que
     ela guarda é este estado. */
  const [saindo, setSaindo] = useState(false)
  const [erroAoSalvar, setErroAoSalvar] = useState('')

  const valor = useMemo(() => {
    const definir = (campos) => setPesquisa((atual) => ({ ...atual, ...campos }))

    return {
      pesquisa,
      definir,
      /* Quem está sendo retomado, para o salvar gravar por cima em vez de
         criar uma segunda linha. Vazio quando a pesquisa é nova. */
      idDoRascunho,
      /*
       * O que o X e o Voltar das telas chamam. Salvar acontece na
       * confirmação.
       *
       * Só pergunta se houver algo a perder. Num formulário recém-aberto,
       * onde nada foi digitado, a pergunta não tinha resposta boa: descartar
       * o nada, ou salvar um rascunho "Pesquisa sem nome" com zero
       * perguntas, que só sujava a lista. Sem alteração nenhuma, sair é sair.
       */
      sair: () => {
        if (iguais(pesquisa, original)) navigate('/')
        else setSaindo(true)
      },
      /* O prompt é montado aqui, na escolha do template, e não na tela 6:
         assim o texto é gerado uma vez e as edições do usuário sobrevivem a
         ir e voltar entre os passos. */
      escolherTemplate: (template) =>
        definir({
          template,
          prompt: montarPrompt(template, pesquisa.participantes),
          perguntas: [],
          abertura:
            template === 'blank' ? ABERTURA_BRANCO : ABERTURA_TEMPLATE,
        }),

      /*
       * Chamada pela tela de carregamento, no fim dos 3 segundos. Devolve
       * quantas perguntas saíram: template sem banco devolvia lista vazia e o
       * fluxo seguia para a revisão de uma pesquisa sem pergunta nenhuma,
       * como se fosse esse o resultado. Quem chama decide o que dizer.
       */
      gerar: () => {
        const geradas = gerarPerguntas(
          pesquisa.template,
          fraseParticipantes(pesquisa.participantes),
          pesquisa.quantidade,
        )
        definir({ perguntas: geradas })
        return geradas.length
      },

      /* Mescla um pedaço da configuração sem apagar o resto. */
      definirConfiguracao: (campos) =>
        definir({ configuracao: { ...pesquisa.configuracao, ...campos } }),

      removerPergunta: (id) =>
        definir({ perguntas: pesquisa.perguntas.filter((q) => q.id !== id) }),

      /* Serve para editar e para acrescentar: se o id já está na lista ele é
         substituído no lugar, senão entra no fim. */
      salvarPergunta: (pergunta) => {
        const existe = pesquisa.perguntas.some((q) => q.id === pergunta.id)
        definir({
          perguntas: existe
            ? pesquisa.perguntas.map((q) => (q.id === pergunta.id ? pergunta : q))
            : [...pesquisa.perguntas, pergunta],
        })
      },
    }
  }, [pesquisa, original, idDoRascunho, navigate])

  /* O rascunho não existe mais: a tela diz isso e oferece a volta, em vez de
     abrir o formulário em branco com cara de pesquisa nova — de onde o passo
     seguinte criaria uma pesquisa que ninguém pediu. */
  if (rascunhoSumiu) return <TelaRascunhoSumido />

  return (
    <Contexto.Provider value={valor}>
      <Outlet />

      {saindo ? (
        <ModalSairDoFluxo
          onCancelar={() => {
            setErroAoSalvar('')
            setSaindo(false)
          }}
          onDescartar={() => navigate('/')}
          erro={erroAoSalvar}
          onSalvar={() => {
            /* Gravação que não passou não pode sair do fluxo como se tivesse
               passado: o rascunho não estaria na lista, e o que foi
               preenchido teria ido embora sem aviso. */
            const deu = gravar(
              guardar(
                ler(),
                criarRascunho(pesquisa, new Date(), passoDaRota(pathname)),
                idDoRascunho,
              ),
            )
            if (deu) navigate('/')
            else setErroAoSalvar(ERRO_AO_GRAVAR)
          }}
        />
      ) : null}
    </Contexto.Provider>
  )
}
