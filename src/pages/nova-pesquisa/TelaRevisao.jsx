import { useNavigate } from 'react-router-dom'
import s from './Revisao.module.css'
import CabecalhoFluxo from '../../components/fluxo/CabecalhoFluxo.jsx'
import {
  PERGUNTAS_EXEMPLO,
  ABERTURA_TEMPLATE,
  ABERTURA_BRANCO,
} from './perguntasExemplo.js'

import pencilSimpleLine from '../../assets/icons/PencilSimpleLine.svg'
import trash from '../../assets/icons/Trash.svg'
import circle from '../../assets/icons/Circle.svg'
import square from '../../assets/icons/Square.svg'
import star from '../../assets/icons/Star.svg'
import plus from '../../assets/icons/Plus.svg'

const NOTAS = [0, 1, 2, 3, 4, 5]
const ESTRELAS = [1, 2, 3, 4, 5]

function Icone({ src, rotulo }) {
  return (
    <button type="button" className={s.acao} aria-label={rotulo}>
      <img className={s.icone} src={src} alt="" width={24} height={24} />
    </button>
  )
}

/* Coluna de um degrau: o número em cima, o alvo embaixo. Serve tanto para a
   escala de nota quanto para as estrelas — muda só o ícone. */
function Degrau({ numero, icone }) {
  return (
    <div className={s.degrau}>
      <p className={s.numeroDegrau}>{numero}</p>
      <img className={s.icone} src={icone} alt="" width={24} height={24} />
    </div>
  )
}

function ListaDeOpcoes({ opcoes, icone }) {
  return (
    <div className={s.opcoes}>
      {opcoes.map((opcao) => (
        <div key={opcao} className={s.opcao}>
          <img className={s.icone} src={icone} alt="" width={24} height={24} />
          <p className={s.textoOpcao}>{opcao}</p>
        </div>
      ))}
    </div>
  )
}

/* O corpo muda com o tipo; o cabeçalho e o enunciado são iguais em todos. */
function CorpoDaPergunta({ pergunta }) {
  switch (pergunta.tipo) {
    case 'nota':
      return (
        <div className={s.escala}>
          <p className={s.pontaEscala}>{pergunta.pontaEsquerda}</p>
          <div className={s.degraus}>
            {NOTAS.map((n) => (
              <Degrau key={n} numero={n} icone={circle} />
            ))}
          </div>
          <p className={s.pontaEscala}>{pergunta.pontaDireita}</p>
        </div>
      )
    case 'escolhaUnica':
      return <ListaDeOpcoes opcoes={pergunta.opcoes} icone={circle} />
    case 'escolhaMultipla':
      return <ListaDeOpcoes opcoes={pergunta.opcoes} icone={square} />
    case 'respostaCurta':
      return (
        <div className={s.linha}>
          <input
            className={s.campo}
            type="text"
            placeholder="Resposta curta..."
            aria-label="Resposta curta"
          />
        </div>
      )
    case 'respostaLonga':
      return (
        <div className={s.linha}>
          <textarea
            className={s.campo}
            rows={1}
            placeholder="Resposta longa..."
            aria-label="Resposta longa"
          />
        </div>
      )
    case 'estrelas':
      return (
        <div className={`${s.escala} ${s.escalaCentrada}`}>
          <div className={s.degraus}>
            {ESTRELAS.map((n) => (
              <Degrau key={n} numero={n} icone={star} />
            ))}
          </div>
        </div>
      )
    default:
      return null
  }
}

/*
 * Tela de revisão das perguntas geradas (Figma 8065:4915). Só o visual: nada
 * gera, edita ou apaga.
 *
 * A prop `vazia` cobre o caminho em branco, que chega aqui sem perguntas. As
 * duas variantes têm rota própria só para dar para olhar as duas sem navegar
 * o fluxo; quando a navegação for ligada elas viram uma tela só.
 *
 * O vermelho do Trash vem do próprio SVG (#FF2633), não de CSS.
 */
export default function TelaRevisao({ vazia = false }) {
  const navigate = useNavigate()
  const perguntas = vazia ? [] : PERGUNTAS_EXEMPLO

  return (
    <div className={s.tela}>
      <CabecalhoFluxo
        titulo="Feedback time de Design"
        onFechar={() => navigate('/')}
      />

      <div className={s.faixa}>
        <button type="button" className={s.editarCapa}>
          Editar Capa
        </button>
      </div>

      <div className={s.coluna}>
        <section className={s.cartao}>
          <div className={s.topoCartao}>
            <p className={s.rotuloAbertura}>Abertura</p>
            <Icone src={pencilSimpleLine} rotulo="Editar abertura" />
          </div>
          <div className={s.linha}>
            <p className={s.nomePesquisa}>Feedback time de Design</p>
          </div>
          <div className={s.linha}>
            <p className={s.introducao}>
              {vazia ? ABERTURA_BRANCO : ABERTURA_TEMPLATE}
            </p>
          </div>
        </section>

        {perguntas.map((pergunta, indice) => (
          <section key={pergunta.tipo} className={s.cartao}>
            <div className={s.topoCartao}>
              <p className={s.rotuloPergunta}>Pergunta {indice + 1}:</p>
              <div className={s.acoes}>
                <Icone src={pencilSimpleLine} rotulo="Editar pergunta" />
                <Icone src={trash} rotulo="Excluir pergunta" />
              </div>
            </div>
            <div className={s.linha}>
              <p className={s.enunciado}>{pergunta.enunciado}</p>
            </div>
            <CorpoDaPergunta pergunta={pergunta} />
          </section>
        ))}

        <button type="button" className={s.adicionar}>
          <span className={s.textoAdicionar}>Adicionar pergunta</span>
          <img className={s.icone} src={plus} alt="" width={24} height={24} />
        </button>
      </div>
    </div>
  )
}
