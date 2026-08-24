import { createContext, useContext, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { gerarPerguntas } from './bancoDePerguntas.js'
import { ABERTURA_TEMPLATE, ABERTURA_BRANCO } from './perguntasExemplo.js'
import { formatarLongo, somarDias } from '../../lib/datas.js'

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
  participantes: { todaEmpresa: true, grupos: [] },
  template: null,
  // Quantidade escolhida na tela 5; a lista gerada mora em `perguntas`.
  quantidade: 10,
  prompt: '',
  perguntas: [],
  // Parágrafo do card de Abertura. Fica no estado, e não como constante da
  // tela, porque agora é editável.
  abertura: ABERTURA_TEMPLATE,
  configuracao: configuracaoInicial(),
})

export const GRUPOS = ['Atendimento', 'Vendas', 'Design']

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
  const [pesquisa, setPesquisa] = useState(estadoInicial)

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
          perguntas: [],
          abertura:
            template === 'blank' ? ABERTURA_BRANCO : ABERTURA_TEMPLATE,
        }),

      /* Chamada pela tela de carregamento, no fim dos 3 segundos. */
      gerar: () =>
        definir({
          perguntas: gerarPerguntas(
            pesquisa.template,
            fraseParticipantes(pesquisa.participantes),
            pesquisa.quantidade,
          ),
        }),

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
  }, [pesquisa])

  return (
    <Contexto.Provider value={valor}>
      <Outlet />
    </Contexto.Provider>
  )
}
