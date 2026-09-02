import { daTabela, avisarValorDesconhecido } from './desconhecido.js'

/*
 * Datas do fluxo. Os campos de data e hora da Configuração são texto livre —
 * não há date picker —, então aqui é onde esse texto vira Date de verdade.
 *
 * O que não der para ler vira null, e quem chama trata: uma pesquisa sem data
 * legível simplesmente não avança de status sozinha.
 */

const MESES = [
  ['janeiro', 'jan'],
  ['fevereiro', 'fev'],
  ['março', 'mar'],
  ['abril', 'abr'],
  ['maio', 'mai'],
  ['junho', 'jun'],
  ['julho', 'jul'],
  ['agosto', 'ago'],
  ['setembro', 'set'],
  ['outubro', 'out'],
  ['novembro', 'nov'],
  ['dezembro', 'dez'],
]

const MES_CURTO = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const MES_LONGO = MESES.map(([longo]) => longo[0].toUpperCase() + longo.slice(1))

const semAcento = (t) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function indiceDoMes(texto) {
  const alvo = semAcento(texto)
  return MESES.findIndex(([longo, curto]) =>
    alvo === semAcento(longo) || alvo === semAcento(curto) || alvo.startsWith(semAcento(curto)),
  )
}

/* Aceita "11 Agosto 2026", "11 Ago 2026" e a hora em "10:30". */
export function paraData(textoData, textoHora) {
  if (!textoData) return null
  const partes = String(textoData).trim().split(/\s+/)
  if (partes.length < 3) return null

  const dia = Number(partes[0])
  const mes = indiceDoMes(partes[1])
  const ano = Number(partes[2])
  if (!Number.isInteger(dia) || mes < 0 || !Number.isInteger(ano)) return null

  const [hora = 0, minuto = 0] = String(textoHora || '')
    .split(':')
    .map((n) => Number(n) || 0)

  const d = new Date(ano, mes, dia, hora, minuto, 0, 0)
  return Number.isNaN(d.getTime()) ? null : d
}

/* "18 Ago" — o formato curto que a coluna Evento usa. */
export function formatarCurto(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${MES_CURTO[d.getMonth()]}`
}

/* "18 Ago 2026" — o formato dos campos do cartão do detalhe. */
export function formatarMedio(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const dia = String(d.getDate()).padStart(2, '0')
  return `${dia} ${MES_CURTO[d.getMonth()]} ${d.getFullYear()}`
}

const DIA_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/* "Sex 14 Ago 2026" — o formato da lista de Datas nas Configurações, que põe
   o dia da semana antes da data para dar a noção de quando o envio cai. */
export function formatarComDia(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${DIA_CURTO[d.getDay()]} ${formatarMedio(iso)}`
}

/* "Jul 26" — o rótulo do seletor de período da taxa anterior. */
export function formatarPeriodo(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${MES_CURTO[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
}

/* Dias inteiros que faltam de `agora` até `iso`, nunca negativo. */
export function diasAte(iso, agora = new Date()) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return Math.max(0, Math.ceil((d - agora) / 864e5))
}

/* "31 Agosto 2026" — o formato que os campos de data da Configuração usam,
   e que `paraData` sabe ler de volta. */
export function formatarLongo(data) {
  const d = new Date(data)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getDate()} ${MES_LONGO[d.getMonth()]} ${d.getFullYear()}`
}

/* ---- campos nativos de data ----
 *
 * O <input type="date"> fala ISO curto (2026-08-14) e o <input type="time">
 * fala HH:MM, que já é o formato da hora aqui. A data guardada continua no
 * formato longo que `paraData` sabe ler, então a conversão fica nesta dupla e
 * não vaza para o resto.
 */
export function paraCampoDeData(textoLongo) {
  const d = paraData(textoLongo, '00:00')
  if (!d) return ''
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function deCampoDeData(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-').map(Number)
  if (!ano || !mes || !dia) return ''
  return formatarLongo(new Date(ano, mes - 1, dia))
}

export function somarDias(data, dias) {
  const d = new Date(data)
  d.setDate(d.getDate() + dias)
  return d
}

export function somarMeses(data, meses) {
  const d = new Date(data)
  const diaOriginal = d.getDate()
  d.setMonth(d.getMonth() + meses)
  // 31 de janeiro + 1 mês cairia em 2 ou 3 de março; prende no fim do mês.
  if (d.getDate() !== diaOriginal) d.setDate(0)
  return d
}

const PRAZOS = {
  '1 dia': (d) => somarDias(d, 1),
  '1 semana': (d) => somarDias(d, 7),
  '1 mês': (d) => somarMeses(d, 1),
}

/* Os limites do prazo em dias: um dia é o menor ciclo que faz sentido, e um
   ano é o maior. Ficam aqui porque o campo, o texto da linha e o motor têm de
   concordar sobre o que vale. */
export const DIAS_MIN = 1
export const DIAS_MAX = 365

export const diasValidos = (dias) => {
  const n = Number(dias)
  return Number.isInteger(n) && n >= DIAS_MIN && n <= DIAS_MAX
}

/*
 * Quantos dias o prazo vale de fato.
 *
 * O campo não deixa mais gravar fora da faixa, mas pesquisas guardadas antes
 * disso podem ter "-5" ou "9999". O número volta para dentro da faixa aqui, e
 * é este mesmo número que a linha das Configurações mostra: antes o motor
 * trocava qualquer valor ≤ 0 por sete dias enquanto a tela seguia exibindo
 * "-5 dias" — a tela dizia uma coisa e o ciclo durava outra.
 */
export function diasDoPrazo(prazo) {
  const n = Math.round(Number(prazo?.dias))
  if (!Number.isFinite(n)) {
    avisarValorDesconhecido('prazo em dias', prazo?.dias)
    return null
  }
  const dentro = Math.min(DIAS_MAX, Math.max(DIAS_MIN, n))
  /* O campo não deixa mais gravar fora da faixa, então um valor de fora
     chegar aqui é dado antigo ou mexido por fora — e aparar calado esconderia
     justamente isso. A tela mostra o número aparado; o console diz qual era. */
  if (dentro !== n) avisarValorDesconhecido('prazo em dias', prazo?.dias)
  return dentro
}

/* Fim do ciclo: um período depois do início, um número de dias, ou a data
   específica escolhida. */
export function fimDoCiclo(inicio, prazo) {
  if (prazo?.tipo === 'data') {
    return paraData(prazo.data, prazo.hora)
  }
  if (prazo?.tipo === 'dias') {
    const dias = diasDoPrazo(prazo)
    return dias === null ? null : somarDias(inicio, dias)
  }
  /* Período que não é nenhum dos conhecidos: o ciclo não tem fim que se possa
     calcular. Devolver uma semana por conta própria dava um prazo que ninguém
     escolheu, com cara de escolhido. */
  const somar = daTabela(PRAZOS, prazo?.periodo, 'período do prazo')
  return somar ? somar(inicio) : null
}

const FREQUENCIAS = {
  Semanal: (d) => somarDias(d, 7),
  Mensal: (d) => somarMeses(d, 1),
  'A cada três meses': (d) => somarMeses(d, 3),
  'A cada seis meses': (d) => somarMeses(d, 6),
  Anual: (d) => somarMeses(d, 12),
}

/* O que a linha "Data de Encerramento" mostra. Sem data estipulada, dizer
   "Não definida" é mais honesto do que um traço: a escolha existe e está
   vazia, não é um campo que não se aplica. */
export const TEXTO_DATA_INVALIDA = 'Data inválida — reconfigure'

/*
 * Como uma data guardada aparece numa linha de configuração.
 *
 * `paraData` só entende o formato que os seletores de data gravam
 * ("10 janeiro 2020"). Qualquer outro — dado antigo, editado à mão,
 * corrompido — devolve `null`, e o motor trata como "sem data": a pesquisa
 * roda para sempre, o ciclo não tem fim. A tela, enquanto isso, ecoava o
 * texto guardado como se fosse uma data em vigor.
 *
 * Era o mesmo descompasso do "-5 dias": a tela dizia uma coisa e o motor
 * fazia outra. Data que não se lê é dita como inválida, que é o que ela é
 * para quem precisa consertá-la.
 */
export function textoDeDataHora(data, hora) {
  if (!data) return '—'
  if (!paraData(data, hora)) {
    avisarValorDesconhecido('data guardada', data)
    return TEXTO_DATA_INVALIDA
  }
  return hora ? `${data}, as ${hora}` : String(data)
}

/*
 * Quando a próxima volta começa. `null` quando a frequência guardada não é
 * nenhuma das conhecidas — mensal por baixo do pano anunciava uma data que
 * não saía de escolha nenhuma.
 */
export function proximoCiclo(inicio, frequencia) {
  const somar = daTabela(FREQUENCIAS, frequencia, 'frequência da recorrência')
  return somar ? somar(inicio) : null
}
