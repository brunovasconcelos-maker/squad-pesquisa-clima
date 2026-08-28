import { useParams } from 'react-router-dom'
import { CorpoDaPergunta } from '../../components/perguntas/ListaDePerguntas.jsx'
import VistaResposta, { RodapeDaVista, usePesquisaDaVista } from './VistaResposta.jsx'
import { ehObrigatoria } from './obrigatorias.js'
import s from './Responder.module.css'
import p from '../../components/perguntas/ListaDePerguntas.module.css'

/*
 * Uma pergunta por tela (Figma 8073:7467).
 *
 * O corpo é o mesmo `CorpoDaPergunta` da lista do fluxo — alvos vazios,
 * campos com placeholder, estrelas —, que é exatamente o estado de uma
 * pergunta antes de alguém responder. O cartão também é o mesmo desenho, sem
 * os botões de editar e apagar, que aqui não existem.
 *
 * A divisória embaixo do enunciado não vem: o Figma desenha o bloco do
 * enunciado sem linha nesta vista, ao contrário da lista do administrador.
 *
 * Navegar entre perguntas ainda não é ligado — o número vem da URL.
 */
export default function TelaPergunta() {
  const pesquisa = usePesquisaDaVista()
  const { numero } = useParams()

  const perguntas = pesquisa.perguntas || []
  const indice = Math.min(Math.max(Number(numero) || 1, 1), perguntas.length) - 1
  const pergunta = perguntas[indice]
  const mostrarProgresso = Boolean(pesquisa.configuracao?.avancadas?.barraProgresso)

  if (!pergunta) return null

  const ultima = indice === perguntas.length - 1
  /* A trilha anda por pergunta respondida: a primeira tela já mostra um
     passo dado, e a última chega cheia no Finalizar. */
  const progresso = (indice + 1) / perguntas.length

  return (
    <VistaResposta
      pesquisa={pesquisa}
      rodape={
        <RodapeDaVista
          progresso={mostrarProgresso ? progresso : null}
          ultima={ultima}
        />
      }
    >
      <section className={p.cartao}>
        <div className={p.topoCartao}>
          <p className={p.rotuloPergunta}>Pergunta {indice + 1}:</p>
        </div>

        <div className={s.linhaEnunciado}>
          <p className={p.enunciado}>
            {pergunta.enunciado}
            {ehObrigatoria(pergunta, pesquisa) ? (
              <span className={s.asterisco}>*</span>
            ) : null}
          </p>
        </div>

        <CorpoDaPergunta pergunta={pergunta} />
      </section>
    </VistaResposta>
  )
}
