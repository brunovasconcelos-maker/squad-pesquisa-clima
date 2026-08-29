import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { avaliarLista, estaPublicada, gravar, ler } from '../../lib/pesquisas.js'
import { adicionarResposta, sincronizar } from '../../lib/respostas.js'
import { sincronizarHistorico } from '../../lib/historico.js'
import { ehObrigatoria } from './obrigatorias.js'
import { PESQUISA_EXEMPLO } from './exemplo.js'
import TelaForaDoAr from './TelaForaDoAr.jsx'

/*
 * O estado de uma sessão de resposta.
 *
 * Vive na rota-mãe de /responder/:id, como o provider do fluxo de criação:
 * nasce ao abrir o link e morre ao sair. É o que faz "Voltar" não perder o
 * que já foi respondido e o embaralhamento acontecer uma vez só — sortear a
 * cada navegação embaralharia a pesquisa no meio de quem está respondendo.
 *
 * A pesquisa é lida uma vez, no começo: quem está respondendo não deve ver o
 * questionário mudar debaixo do dedo se alguém editar do outro lado. Na hora
 * de enviar, aí sim, o que está guardado é lido de novo — é nele que a
 * resposta entra.
 */
const Contexto = createContext(null)

/* Fisher-Yates. Só quando "Embaralhar perguntas" está ligada. */
function ordemDe(pesquisa) {
  const ids = (pesquisa.perguntas || []).map((q) => q.id)
  if (!pesquisa.configuracao?.avancadas?.embaralhar) return ids
  const baralho = [...ids]
  for (let i = baralho.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const troca = baralho[i]
    baralho[i] = baralho[j]
    baralho[j] = troca
  }
  return baralho
}

/* Vazio é vazio: 0 e uma lista com um item marcado contam como resposta; ''
   e uma lista vazia, não. */
export function temResposta(valor) {
  if (valor === undefined || valor === null) return false
  if (Array.isArray(valor)) return valor.length > 0
  if (typeof valor === 'string') return valor.trim().length > 0
  return true
}

export default function RespostaProvider() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [sessao] = useState(() => {
    const guardada = ler().find((p) => p.id === id)
    /* Sem pesquisa com esse id, a vista mostra o exemplo do Figma em vez de
       uma tela vazia — e o envio não grava nada, porque não há onde. */
    return { pesquisa: guardada || PESQUISA_EXEMPLO, guardada: Boolean(guardada) }
  })
  const [ordem] = useState(() => ordemDe(sessao.pesquisa))
  const [valores, setValores] = useState({})

  const { pesquisa } = sessao

  /* As perguntas na ordem desta sessão. Uma pergunta apagada da pesquisa
     depois do sorteio simplesmente não aparece. */
  const perguntas = useMemo(
    () =>
      ordem
        .map((idPergunta) => (pesquisa.perguntas || []).find((q) => q.id === idPergunta))
        .filter(Boolean),
    [ordem, pesquisa],
  )

  const responder = useCallback(
    (idPergunta, valor) => setValores((v) => ({ ...v, [idPergunta]: valor })),
    [],
  )

  /*
   * Envia. Lê o que está guardado agora — e não o retrato do começo da
   * sessão — porque entre abrir o link e clicar em Finalizar o motor pode ter
   * andado. Passa pelo motor e pela sincronização antes de acrescentar, que é
   * o que faz esta resposta somar à simulação em vez de concorrer com ela.
   */
  const enviar = useCallback(() => {
    if (sessao.guardada) {
      const { lista } = avaliarLista(ler())
      const alvo = lista.find((p) => p.id === id)
      if (alvo) {
        const comResposta = adicionarResposta(sincronizar(alvo), valores)
        gravar(
          lista.map((p) =>
            p.id === id
              ? { ...sincronizarHistorico(comResposta), atualizadoEm: new Date().toISOString() }
              : p,
          ),
        )
      }
    }
    navigate(`/responder/${id}/fim`)
  }, [id, navigate, sessao.guardada, valores])

  const valor = useMemo(
    () => ({
      pesquisa,
      perguntas,
      valores,
      responder,
      enviar,
      mostrarProgresso: Boolean(pesquisa.configuracao?.avancadas?.barraProgresso),
      obrigatoria: (pergunta) => ehObrigatoria(pergunta, pesquisa),
    }),
    [pesquisa, perguntas, valores, responder, enviar],
  )

  /* Fora do ar, nenhuma das três telas abre: o link inteiro para de
     funcionar, que é o que despublicar quer dizer. Vale o retrato do começo
     da sessão, como o resto — quem já estava respondendo termina. */
  const foraDoAr = sessao.guardada && !estaPublicada(pesquisa)

  return (
    <Contexto.Provider value={valor}>
      {foraDoAr ? <TelaForaDoAr pesquisa={pesquisa} /> : <Outlet />}
    </Contexto.Provider>
  )
}

export function useResposta() {
  return useContext(Contexto)
}
