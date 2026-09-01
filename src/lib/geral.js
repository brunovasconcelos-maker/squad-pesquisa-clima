import {
  formatarMedio,
  diasAte,
  paraData,
  proximoCiclo,
} from './datas.js'
import { ehRecorrente } from './pesquisas.js'

/*
 * O que a aba Geral mostra, derivado da pesquisa guardada.
 *
 * Parte é real — status, tipo, ciclos, datas do ciclo e a taxa que o motor
 * vem subindo. Parte ainda é simulada, porque não existe backend que colete
 * respostas: tempo médio, desistências, as notas por pergunta e o texto do
 * Pipo. O que é simulado está marcado, e é sempre derivado do id da pesquisa,
 * nunca sorteado na hora — senão os números dançariam a cada render.
 */

/* Quantas pessoas o modal de participantes diz que cada grupo tem. É o mesmo
   56 que a tela de criação mostra; sai daqui para os dois lados falarem o
   mesmo número. */
export const MEMBROS_POR_GRUPO = 56

/* Pessoas escolhidas uma a uma contam uma cada: escolher duas pessoas é um
   público de duas, e não de um grupo inteiro. Sem nada escolhido cai no
   tamanho de um grupo, que é o que a lista mostrava antes de existir escolha
   avulsa. */
export function totalDeParticipantes({
  todaEmpresa,
  grupos = [],
  pessoas = [],
} = {}) {
  if (todaEmpresa) return MEMBROS_POR_GRUPO
  return grupos.length * MEMBROS_POR_GRUPO + pessoas.length || MEMBROS_POR_GRUPO
}

/*
 * Semente estável a partir de um texto (FNV-1a). Dá o mesmo número sempre
 * para a mesma pesquisa, que é o que segura os valores simulados no lugar
 * entre um render e outro, e entre uma sessão e outra.
 */
export function semente(texto) {
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

export const entre = (texto, min, max) => min + (semente(texto) % (max - min + 1))

/* ---- campos do cartão de informações ---- */

/*
 * Os dois primeiros campos mudam com o status; Tipo e Ciclos são sempre os
 * mesmos. Um traço quando a data não dá para calcular — as datas de envio são
 * texto livre e nem toda pesquisa tem uma legível.
 */
export function camposDe(p) {
  const tipo = { rotulo: 'Tipo', valor: ehRecorrente(p) ? 'Recorrente' : 'Única' }
  const ciclos = { rotulo: 'Ciclos', valor: String(p.ciclos ?? 0) }

  const par = (() => {
    if (p.status === 'rodando') {
      return [
        { rotulo: 'Data de Envio', valor: formatarMedio(p.cicloInicio) },
        { rotulo: 'Encerra em', valor: formatarMedio(p.cicloFim) },
      ]
    }
    if (p.status === 'aguardando') {
      const proximo = p.cicloInicio
        ? proximoCiclo(new Date(p.cicloInicio), p.configuracao?.frequencia)
        : null
      return [
        { rotulo: 'Último envio', valor: formatarMedio(p.cicloInicio) },
        {
          rotulo: 'Próximo envio',
          valor: proximo ? formatarMedio(proximo.toISOString()) : '—',
        },
      ]
    }
    if (p.status === 'encerrada') {
      return [
        { rotulo: 'Último envio', valor: formatarMedio(p.cicloInicio) },
        { rotulo: 'Encerrada em', valor: formatarMedio(p.cicloFim) },
      ]
    }
    if (p.status === 'agendada') {
      // Ainda não saiu: não há segunda data para mostrar.
      return [
        { rotulo: 'Agendada para', valor: formatarMedio(p.cicloInicio) },
        { rotulo: '', valor: '—' },
      ]
    }
    // Rascunho e Não ativa não têm ciclo em curso.
    return [
      { rotulo: 'Data de Envio', valor: formatarMedio(p.cicloInicio) },
      { rotulo: '', valor: '—' },
    ]
  })()

  return [...par, tipo, ciclos]
}

/*
 * A data do próximo envio, que a lista de Datas das Configurações mostra.
 *
 * Depende do status, como os campos do cartão: agendada ainda não saiu, então
 * vale a data marcada; com ciclo em curso ou entre ciclos, vale o próximo
 * salto de frequência — e uma Única não tem próximo. Fora disso não há ciclo
 * nenhum, e o que resta é a data configurada, que é o que o modal edita.
 */
export function proximoEnvioDe(p) {
  if (p.status === 'agendada') return p.cicloInicio
  if (p.status === 'rodando' || p.status === 'aguardando') {
    if (!ehRecorrente(p) || !p.cicloInicio) return null
    return proximoCiclo(
      new Date(p.cicloInicio),
      p.configuracao?.frequencia,
    ).toISOString()
  }
  const marcada = paraData(p.configuracao?.envio?.data, p.configuracao?.envio?.hora)
  return marcada ? marcada.toISOString() : null
}

/* ---- cartões de taxa de resposta ---- */

const responderam = (taxa, total) => Math.round((taxa / 100) * total)

export function taxaAtualDe(p, agora = new Date()) {
  const total = totalDeParticipantes(p.participantes)
  const taxa = p.status === 'agendada' ? 0 : (p.taxa ?? 0)
  const quantos = responderam(taxa, total)

  if (p.status === 'rodando') {
    const dias = diasAte(p.cicloFim, agora)
    return {
      titulo: 'Taxa de resposta até agora',
      taxa,
      principal: `${quantos} de ${total} responderam até agora`,
      apoio:
        dias === null
          ? '—'
          : dias === 0
            ? 'Encerra hoje'
            : `${dias === 1 ? 'Falta' : 'Faltam'} ${dias} dia${dias === 1 ? '' : 's'}`,
    }
  }

  if (p.status === 'agendada') {
    const dias = diasAte(p.cicloInicio, agora)
    return {
      titulo: 'Taxa de resposta',
      taxa: 0,
      principal: `Nenhuma resposta ainda, de ${total} pessoas`,
      apoio:
        dias === null
          ? '—'
          : dias === 0
            ? 'Começa hoje'
            : `Começa em ${dias} dia${dias === 1 ? '' : 's'}`,
    }
  }

  return {
    titulo: 'Taxa de resposta',
    taxa,
    principal: `${quantos} de ${total} responderam essa pesquisa.`,
    apoio: p.cicloFim ? `Encerrada em ${formatarMedio(p.cicloFim)}` : '—',
  }
}

/* O cartão do ciclo anterior sai do histórico guardado: o seletor precisa de
   todos os ciclos fechados, não só do último. Ele mora em lib/historico.js,
   com os ciclos. O motor chegou a carregar um campo `anterior` com o último
   deles; ficou sem leitor e foi aposentado. */

/* ---- cartões de número (simulados) ---- */

export function tempoMedioDe(p) {
  return { valor: String(entre(`${p.id}:tempo`, 2, 15)), unidade: 'minutos' }
}

export function desistenciaDe(p) {
  // Ninguém desiste do que ainda não começou.
  const quantos = p.status === 'agendada' ? 0 : entre(`${p.id}:desistencia`, 0, 4)
  return {
    valor: String(quantos),
    unidade: quantos === 1 ? 'pessoa desistiu' : 'pessoas desistiram',
  }
}

/*
 * A nota mais baixa entre as perguntas do tipo Nota. Sem pergunta de nota não
 * há o que mostrar, e o cartão não aparece — melhor faltar do que inventar um
 * número. As notas em si são simuladas, uma por pergunta, presas ao id.
 */
export function piorAvaliacaoDe(p) {
  const notas = (p.perguntas || []).filter((q) => q.tipo === 'nota')
  if (!notas.length) return null

  const avaliadas = notas.map((q) => ({
    pergunta: q,
    // 1,0 a 4,9 em décimos: uma "pior nota" que encoste em 5 não seria pior.
    nota: entre(`${p.id}:${q.id}:nota`, 10, 49) / 10,
  }))
  const pior = avaliadas.reduce((a, b) => (b.nota < a.nota ? b : a))

  return {
    valor: pior.nota.toFixed(1).replace('.', ','),
    pergunta: rotuloCurto(pior.pergunta),
  }
}

/* O banco traz um tópico curto por pergunta; quem foi escrita à mão no editor
   não tem, e aí o enunciado mesmo serve de rótulo. */
function rotuloCurto(q) {
  return q.topico || q.enunciado || 'Pergunta sem enunciado'
}

/* ---- resumo do Pipo (texto simulado) ---- */

/*
 * Não há motor de análise: as leituras qualitativas saem de um punhado de
 * frases plausíveis, escolhidas pelo id, e entram num molde junto com as
 * porcentagens reais. O molde muda conforme a comparação com o ciclo anterior.
 */
const LEITURAS = [
  'a colaboração entre os times segue como o ponto mais bem avaliado',
  'as menções à carga de trabalho continuam sendo o tema mais recorrente nos comentários abertos',
  'a clareza dos prazos aparece como o ponto que mais divide as respostas',
  'o reconhecimento pela liderança direta puxa a média para cima',
  'a autonomia no dia a dia é o que mais se destaca entre os comentários positivos',
  'a previsibilidade das prioridades aparece como o incômodo mais citado',
]

const ACOMPANHAMENTOS = [
  'Vale acompanhar se isso se confirma conforme mais respostas chegam.',
  'Vale olhar isso junto com o time antes do próximo ciclo.',
  'Vale comparar com o próximo ciclo antes de tirar conclusões.',
  'Vale abrir a conversa com as lideranças diretas sobre esse ponto.',
]

const escolher = (lista, chave) => lista[semente(chave) % lista.length]

export function resumoDe(p, atual, anterior) {
  const total = totalDeParticipantes(p.participantes)
  const quantos = responderam(atual.taxa, total)
  const leitura = escolher(LEITURAS, `${p.id}:leitura`)
  const acompanhar = escolher(ACOMPANHAMENTOS, `${p.id}:acompanhar`)

  if (p.status === 'agendada') {
    return `A pesquisa ainda não saiu, então não há respostas para ler. Assim que o primeiro ciclo começar, o resumo aparece aqui com a leitura das ${total} pessoas convidadas.`
  }

  if (anterior) {
    const diferenca = atual.taxa - anterior.taxa
    if (diferenca > 0) {
      return `${quantos} das ${total} pessoas responderam, ${atual.taxa}% contra ${anterior.taxa}% do ciclo anterior — a maior participação até aqui. Entre as respostas, ${leitura}. ${acompanhar}`
    }
    if (diferenca < 0) {
      return `A participação está em ${atual.taxa}%, abaixo dos ${anterior.taxa}% do ciclo anterior, com ${quantos} das ${total} pessoas respondendo até agora. É cedo para ler isso como desinteresse: nas respostas já recebidas, ${leitura}. ${acompanhar}`
    }
    return `${quantos} das ${total} pessoas responderam, os mesmos ${atual.taxa}% do ciclo anterior — participação estável de um ciclo para o outro. Entre as respostas, ${leitura}. ${acompanhar}`
  }

  return `${quantos} das ${total} pessoas responderam, ${atual.taxa}% no total. Sem um ciclo anterior para comparar, esta é a primeira leitura da pesquisa: ${leitura}. ${acompanhar}`
}
