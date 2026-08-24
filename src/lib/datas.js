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

/* "31 Agosto 2026" — o formato que os campos de data da Configuração usam,
   e que `paraData` sabe ler de volta. */
export function formatarLongo(data) {
  const d = new Date(data)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getDate()} ${MES_LONGO[d.getMonth()]} ${d.getFullYear()}`
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

/* Fim do ciclo: um período depois do início, ou a data específica escolhida. */
export function fimDoCiclo(inicio, prazo) {
  if (prazo?.tipo === 'data') {
    return paraData(prazo.data, prazo.hora)
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
