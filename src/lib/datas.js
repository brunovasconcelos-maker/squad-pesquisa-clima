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

/* Fim do ciclo: um período depois do início, um número de dias, ou a data
   específica escolhida. */
export function fimDoCiclo(inicio, prazo) {
  if (prazo?.tipo === 'data') {
    return paraData(prazo.data, prazo.hora)
  }
  if (prazo?.tipo === 'dias') {
    const dias = Number(prazo.dias)
    return dias > 0 ? somarDias(inicio, dias) : somarDias(inicio, 7)
  }
  const somar = PRAZOS[prazo?.periodo]
  return somar ? somar(inicio) : somarDias(inicio, 7)
}

const FREQUENCIAS = {
  Semanal: (d) => somarDias(d, 7),
  Mensal: (d) => somarMeses(d, 1),
  'A cada três meses': (d) => somarMeses(d, 3),
  'A cada seis meses': (d) => somarMeses(d, 6),
  Anual: (d) => somarMeses(d, 12),
}

export function proximoCiclo(inicio, frequencia) {
  const somar = FREQUENCIAS[frequencia] ?? FREQUENCIAS.Mensal
  return somar(inicio)
}
