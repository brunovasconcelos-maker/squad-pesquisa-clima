import { createContext, useContext, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'

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

const ESTADO_INICIAL = {
  nome: '',
  // Começa em "Toda a empresa" porque é o que a tela 1 do Figma mostra. Se o
  // usuário desmarcar tudo no modal, o Continuar volta a travar.
  participantes: { todaEmpresa: true, grupos: [] },
  template: null,
  perguntas: 10,
  prompt: '',
}

export const GRUPOS = ['Atendimento', 'Vendas', 'Design']

export const PERGUNTAS_MIN = 1
export const PERGUNTAS_MAX = 20

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

export function temParticipantes({ todaEmpresa, grupos }) {
  return todaEmpresa || grupos.length > 0
}

/* Rótulo da linha da tela 1: começa com maiúscula. */
export function rotuloParticipantes({ todaEmpresa, grupos }) {
  if (todaEmpresa) return 'Toda a empresa'
  if (grupos.length === 1) return grupos[0]
  if (grupos.length > 1) return `${grupos.length} grupos`
  return ''
}

/* Mesma seleção, mas no meio de uma frase — daí o minúsculo. */
export function fraseParticipantes({ todaEmpresa, grupos }) {
  if (todaEmpresa) return 'toda a empresa'
  if (grupos.length === 1) return grupos[0]
  if (grupos.length > 1) return `${grupos.length} grupos`
  return ''
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
  const [pesquisa, setPesquisa] = useState(ESTADO_INICIAL)

  const valor = useMemo(() => {
    const definir = (campos) => setPesquisa((atual) => ({ ...atual, ...campos }))

    return {
      pesquisa,
      definir,
      /* O prompt é montado aqui, na escolha do template, e não na tela 6:
         assim o texto é gerado uma vez e as edições do usuário sobrevivem a
         ir e voltar entre os passos. */
      escolherTemplate: (template) =>
        definir({
          template,
          prompt: montarPrompt(template, pesquisa.participantes),
        }),
    }
  }, [pesquisa])

  return (
    <Contexto.Provider value={valor}>
      <Outlet />
    </Contexto.Provider>
  )
}
