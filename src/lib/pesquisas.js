import { paraData, fimDoCiclo, proximoCiclo, formatarCurto } from './datas.js'

/*
 * Guarda e faz evoluir as pesquisas.
 *
 * Não há backend nem processo em segundo plano: tudo vive no localStorage e o
 * status só avança quando a página está aberta. Por isso `avaliar` não é um
 * relógio, e sim uma função que compara o que está guardado com o horário de
 * agora — chamada na carga e de tempos em tempos. Uma pesquisa que deveria ter
 * trocado de status ontem troca no próximo carregamento, de uma vez.
 */

const CHAVE = 'squad-pesquisa-clima:pesquisas'

export const INTERVALO_MS = 30000

/* Quanto a taxa de resposta sobe a cada checagem, enquanto o ciclo roda. */
const PASSO_TAXA_MIN = 1
const PASSO_TAXA_MAX = 5

export const STATUS = {
  rascunho: { texto: 'Rascunho', tom: 'padrao' },
  agendada: { texto: 'Agendada', tom: 'destaque' },
  rodando: { texto: 'Ativa | Rodando', tom: 'positivo' },
  aguardando: { texto: 'Ativa | Aguardando', tom: 'acao' },
  naoAtiva: { texto: 'Não ativa', tom: 'negativo' },
  encerrada: { texto: 'Encerrada', tom: 'padrao' },
}

export function ler() {
  try {
    const cru = localStorage.getItem(CHAVE)
    return cru ? JSON.parse(cru) : []
  } catch {
    // Storage bloqueado ou conteúdo corrompido: melhor lista vazia que travar.
    return []
  }
}

export function gravar(lista) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista))
  } catch {
    // Sem espaço ou sem permissão. A sessão continua com o que está em memória.
  }
}

const novoId = () =>
  `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`

export const ehRecorrente = (p) => p.configuracao?.recorrencia === 'Recorrente'

/* Início do ciclo: a data de envio, ou agora quando marcado "imediatamente". */
function inicioAgendado(configuracao, agora) {
  if (configuracao?.envio?.imediato) return agora
  return paraData(configuracao?.envio?.data, configuracao?.envio?.hora)
}

/*
 * Monta a pesquisa a partir do estado do fluxo. Uma pesquisa nasce agendada
 * quando dá para saber quando ela começa, e rascunho quando não dá.
 */
export function criarDoFluxo(pesquisa, agora = new Date()) {
  const inicio = inicioAgendado(pesquisa.configuracao, agora)
  const base = {
    id: novoId(),
    criadoEm: agora.toISOString(),
    atualizadoEm: agora.toISOString(),
    nome: pesquisa.nome || 'Nova Pesquisa',
    participantes: pesquisa.participantes,
    template: pesquisa.template,
    abertura: pesquisa.abertura,
    capa: pesquisa.capa,
    prompt: pesquisa.prompt,
    quantidade: pesquisa.quantidade,
    perguntas: pesquisa.perguntas,
    configuracao: pesquisa.configuracao,
    ciclos: 0,
    taxa: 0,
    cicloInicio: inicio ? inicio.toISOString() : null,
    cicloFim: null,
    status: inicio ? 'agendada' : 'rascunho',
  }
  // Já passou da hora de enviar? Entra rodando direto.
  return avaliar(base, agora)
}

export function duplicar(p, agora = new Date()) {
  return {
    ...p,
    id: novoId(),
    nome: `${p.nome} (cópia)`,
    criadoEm: agora.toISOString(),
    atualizadoEm: agora.toISOString(),
    status: 'rascunho',
    ciclos: 0,
    taxa: 0,
    anterior: undefined,
    cicloInicio: null,
    cicloFim: null,
  }
}

/*
 * Começa um ciclo agora mesmo — usado pelo Play e pela virada de recorrência.
 *
 * Guarda o ciclo que acabou em `anterior` antes de zerar a taxa. Sem isso a
 * participação do ciclo passado se perderia na virada, e o detalhe não teria
 * o que comparar. Só existe a partir do segundo ciclo, que é justamente
 * quando há um anterior.
 */
function iniciarCiclo(p, quando) {
  return {
    ...p,
    status: 'rodando',
    ciclos: p.ciclos + 1,
    taxa: 0,
    taxaEm: quando.toISOString(),
    ...(p.ciclos > 0
      ? { anterior: { taxa: p.taxa, inicio: p.cicloInicio, fim: p.cicloFim } }
      : {}),
    cicloInicio: quando.toISOString(),
    cicloFim: fimDoCiclo(quando, p.configuracao?.prazo)?.toISOString() ?? null,
    atualizadoEm: quando.toISOString(),
  }
}

export function forcarInicio(p, agora = new Date()) {
  return iniciarCiclo(p, agora)
}

/*
 * Tira a pesquisa do ar — o interruptor "Publicar formulário" desligado, e
 * só ele. Pausar não passa por aqui: quem pausa fecha o ciclo e continua no
 * ar, o que é `encerrarCiclo`.
 */
export function despublicar(p, agora = new Date()) {
  return { ...p, status: 'naoAtiva', atualizadoEm: agora.toISOString() }
}

/* No ar (o interruptor "Publicar formulário") e recebendo respostas (o
   "Aceitando respostas"). São dois estados derivados do mesmo status: o
   formulário publicado é o que tem ciclo, com ou sem ele correndo agora. */
const PUBLICADAS = ['agendada', 'rodando', 'aguardando']

export const estaPublicada = (p) => PUBLICADAS.includes(p.status)

export const aceitandoRespostas = (p) => p.status === 'rodando'

/*
 * Quem abre o link de resposta consegue responder? Precisa estar no ar e
 * ainda ter quem responda: a 100% todo mundo do público já respondeu, e o
 * formulário não tem mais o que coletar neste ciclo.
 */
export const aceitaResposta = (p) => estaPublicada(p) && (p.taxa ?? 0) < 100

/*
 * Republica uma pesquisa que estava fora do ar. Volta a existir, mas sem
 * receber respostas: quem quiser isso liga o outro interruptor.
 *
 * O relógio do ciclo é reancorado em `agora`. Com a âncora velha, o motor
 * veria o próximo ciclo já vencido e começaria a receber respostas sozinho —
 * exatamente o que republicar não deve fazer.
 */
export function publicar(p, agora = new Date()) {
  return {
    ...p,
    status: 'aguardando',
    cicloInicio: agora.toISOString(),
    cicloFim: null,
    atualizadoEm: agora.toISOString(),
  }
}

/*
 * Fecha o ciclo em curso sem tirar a pesquisa do ar — a mesma virada que o
 * motor faz quando o prazo vence, só que agora. O fim vai para `cicloFim`
 * porque é ele que diz quando o ciclo acabou de verdade, e não o prazo que
 * não chegou a vencer.
 *
 * É o que pausar faz, em todos os lugares onde pausar existe: o botão da
 * home, o portão da aba Perguntas e o "Aceitando respostas" desligado. Uma
 * pesquisa pausada continua ativa — está entre ciclos, não fora do ar —, e
 * por isso vai para "Ativa | Aguardando" e não para "Não ativa".
 */
export function encerrarCiclo(p, agora = new Date()) {
  return {
    ...p,
    status: 'aguardando',
    cicloFim: agora.toISOString(),
    atualizadoEm: agora.toISOString(),
  }
}

/* O link que a pessoa recebe para responder — a vista de quem responde, não
   o detalhe interno. */
export const linkDaPesquisa = (p) =>
  `${window.location.origin}${import.meta.env.BASE_URL}responder/${p.id}`

const sobeTaxa = (taxa) =>
  Math.min(
    100,
    taxa +
      PASSO_TAXA_MIN +
      Math.floor(Math.random() * (PASSO_TAXA_MAX - PASSO_TAXA_MIN + 1)),
  )

/*
 * Uma pesquisa por vez, comparando o guardado com `agora`. Roda em laço porque
 * a página pode ter ficado fechada tempo suficiente para vencer mais de um
 * ciclo — sem isso, uma recorrente mensal esquecida por um trimestre voltaria
 * atrasada em vez de acertar o ciclo atual.
 */
export function avaliar(p, agora = new Date()) {
  if (p.status === 'rascunho' || p.status === 'encerrada' || p.status === 'naoAtiva') {
    return p
  }

  let atual = p
  for (let volta = 0; volta < 240; volta += 1) {
    const inicio = atual.cicloInicio ? new Date(atual.cicloInicio) : null
    const fim = atual.cicloFim ? new Date(atual.cicloFim) : null

    if (atual.status === 'agendada') {
      if (!inicio || agora < inicio) return atual
      atual = iniciarCiclo(atual, inicio)
      continue
    }

    if (atual.status === 'rodando') {
      if (!fim || agora < fim) return atual
      atual = ehRecorrente(atual)
        ? { ...atual, status: 'aguardando', atualizadoEm: fim.toISOString() }
        : { ...atual, status: 'encerrada', atualizadoEm: fim.toISOString() }
      continue
    }

    if (atual.status === 'aguardando') {
      /* Só recorrente volta a rodar sozinha. O motor nunca põe uma Única em
         "aguardando" — ela vai de rodando para encerrada —, mas o
         interruptor "Aceitando respostas" põe, e aí ela não pode reabrir um
         ciclo sozinha um mês depois. */
      if (!inicio || !ehRecorrente(atual)) return atual
      const proximo = proximoCiclo(inicio, atual.configuracao?.frequencia)
      if (agora < proximo) return atual
      atual = iniciarCiclo(atual, proximo)
      continue
    }

    return atual
  }
  return atual
}

/*
 * Passa a lista pelo motor e sobe a taxa de quem está rodando.
 *
 * A subida é presa ao relógio, não à quantidade de vezes que alguém chamou:
 * `taxaEm` guarda quando subiu pela última vez e só passa de novo depois de um
 * intervalo cheio. Sem isso a taxa andaria a cada montagem, e ir e voltar
 * entre a lista e o detalhe — que rodam o mesmo motor — inflaria a simulação
 * a cada clique.
 */
export function avaliarLista(lista, agora = new Date()) {
  let mudou = false
  const nova = lista.map((p) => {
    let atualizada = avaliar(p, agora)
    if (atualizada.status === 'rodando' && atualizada.taxa < 100) {
      const ultima = atualizada.taxaEm ? new Date(atualizada.taxaEm) : null
      if (!ultima || agora - ultima >= INTERVALO_MS) {
        atualizada = {
          ...atualizada,
          taxa: sobeTaxa(atualizada.taxa),
          taxaEm: agora.toISOString(),
        }
      }
    }
    if (atualizada !== p) mudou = true
    return atualizada
  })
  return { lista: nova, mudou }
}

/* ---- o que a linha da tabela mostra ---- */

export function botaoDe(p) {
  if (p.status === 'rascunho' || p.status === 'encerrada') return null
  if (p.status === 'rodando') return ehRecorrente(p) ? 'pausar' : null
  return 'iniciar'
}

function eventoDe(p) {
  if (p.status === 'agendada') return `Começa: ${formatarCurto(p.cicloInicio)}`
  if (p.status === 'rodando') return `Encerra: ${formatarCurto(p.cicloFim)}`
  if (p.status === 'encerrada') return `Encerrada: ${formatarCurto(p.cicloFim)}`
  if (p.status === 'aguardando') {
    const proximo = proximoCiclo(
      new Date(p.cicloInicio),
      p.configuracao?.frequencia,
    )
    return `Próxima: ${formatarCurto(proximo.toISOString())}`
  }
  return '—'
}

export function paraLinha(p, rotuloDoPublico) {
  const rascunho = p.status === 'rascunho'
  return {
    id: p.id,
    nome: p.nome,
    publico: rascunho ? '—' : rotuloDoPublico(p.participantes) || '—',
    tipo: rascunho ? '—' : ehRecorrente(p) ? 'Recorrente' : 'Única',
    status: STATUS[p.status],
    evento: eventoDe(p),
    taxa: rascunho || p.status === 'agendada' ? '—' : `${p.taxa}%`,
    ciclos: rascunho ? '—' : String(p.ciclos),
    transporte: botaoDe(p),
  }
}
