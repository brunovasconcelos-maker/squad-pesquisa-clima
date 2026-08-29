import { fimDoCiclo } from './datas.js'

/*
 * Registro de alterações nas perguntas.
 *
 * A coluna "Atividade" do Histórico dizia "Sofreu N alterações" a partir de um
 * hash. Agora vem daqui: cada edição, exclusão ou inclusão de pergunta — e
 * cada mudança na abertura — entra num registro, guardado junto da pesquisa e
 * separado por ciclo.
 *
 * A que ciclo uma alteração pertence:
 *
 *  - Rodando, o ciclo `ciclos` está aberto e a alteração é dele.
 *  - Pausada, também: a aba Perguntas exige pausar antes de editar, então
 *    quem edita interrompeu o ciclo em curso, e é esse que sofreu a
 *    alteração. É a mesma linha que o Histórico marca com o aviso de
 *    "encerrado antes do prazo".
 *  - Entre ciclos por conta do prazo, encerrada, fora do ar, agendada ou
 *    rascunho, não há ciclo interrompido: o que se edita agora vale para o
 *    próximo, `ciclos + 1`.
 *
 * Pausar e o prazo vencer deixam a pesquisa no mesmo status — "Ativa |
 * Aguardando" —, então o que separa os dois é a data: pausar fecha o ciclo
 * antes do prazo que ele teria, e é isso que `cicloInterrompido` compara.
 *
 * O registro fica no formato { "3": [...], "4": [...] } para uma alteração
 * nunca migrar de ciclo depois de anotada.
 */

function cicloInterrompido(p) {
  if (p.status !== 'aguardando' || !p.cicloInicio || !p.cicloFim) return false
  const prazo = fimDoCiclo(new Date(p.cicloInicio), p.configuracao?.prazo)
  return Boolean(prazo) && new Date(p.cicloFim) < prazo
}

export function cicloEmAberto(p) {
  const atual = p.ciclos ?? 0
  if (atual < 1) return atual + 1
  if (p.status === 'rodando' || cicloInterrompido(p)) return atual
  return atual + 1
}

/* Anota uma alteração e devolve a pesquisa. `alvo` é o enunciado da pergunta,
   ou o rótulo do que mudou quando não há uma. */
export function registrar(p, tipo, alvo) {
  const numero = String(cicloEmAberto(p))
  const registro = p.alteracoes || {}
  const doCiclo = registro[numero] || []
  return {
    ...p,
    alteracoes: {
      ...registro,
      [numero]: [...doCiclo, { em: new Date().toISOString(), tipo, alvo }],
    },
  }
}

export const alteracoesDoCiclo = (p, numero) =>
  (p.alteracoes || {})[String(numero)] || []

/* Frase da coluna Atividade. Vazia quando o ciclo passou sem mexerem nele —
   o Figma deixa a célula em branco nesse caso. */
export function fraseDeAtividade(quantas) {
  if (!quantas) return ''
  return `Sofreu ${quantas} ${quantas === 1 ? 'alteração' : 'alterações'}`
}
