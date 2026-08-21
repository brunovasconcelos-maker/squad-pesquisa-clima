import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './Revisao.module.css'
import CabecalhoFluxo from '../../components/fluxo/CabecalhoFluxo.jsx'
import EditorPergunta from './EditorPergunta.jsx'
import { usePesquisa } from './estado.jsx'
import { LIMITE_CURTA, LIMITE_LONGA } from './bancoDePerguntas.js'
import { ABERTURA_TEMPLATE, ABERTURA_BRANCO } from './perguntasExemplo.js'

import pencilSimpleLine from '../../assets/icons/PencilSimpleLine.svg'
import trash from '../../assets/icons/Trash.svg'
import circle from '../../assets/icons/Circle.svg'
import square from '../../assets/icons/Square.svg'
import star from '../../assets/icons/Star.svg'
import plus from '../../assets/icons/Plus.svg'

const ESTRELAS = [1, 2, 3, 4, 5]

function Icone({ src, rotulo, onClick }) {
  return (
    <button type="button" className={s.acao} aria-label={rotulo} onClick={onClick}>
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

function ListaDeOpcoes({ opcoes, temOutro, icone }) {
  const linhas = temOutro ? [...opcoes, 'Outro'] : opcoes
  return (
    <div className={s.opcoes}>
      {linhas.map((opcao, indice) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={`${opcao}-${indice}`} className={s.opcao}>
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
    case 'nota': {
      const degraus = Array.from({ length: pergunta.maximo + 1 }, (_, i) => i)
      return (
        <div className={s.escala}>
          <p className={s.pontaEscala}>{pergunta.pontaEsquerda}</p>
          <div className={s.degraus}>
            {degraus.map((n) => (
              <Degrau key={n} numero={n} icone={circle} />
            ))}
          </div>
          <p className={s.pontaEscala}>{pergunta.pontaDireita}</p>
        </div>
      )
    }
    case 'escolhaUnica':
      return (
        <ListaDeOpcoes
          opcoes={pergunta.opcoes}
          temOutro={pergunta.temOutro}
          icone={circle}
        />
      )
    case 'escolhaMultipla':
      return (
        <ListaDeOpcoes
          opcoes={pergunta.opcoes}
          temOutro={pergunta.temOutro}
          icone={square}
        />
      )
    case 'respostaCurta':
      return (
        <div className={s.linha}>
          <input
            className={s.campo}
            type="text"
            maxLength={LIMITE_CURTA}
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
            maxLength={LIMITE_LONGA}
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
 * Revisão das perguntas (Figma 8065:4915).
 *
 * A lista vem do estado do fluxo: cheia quando veio pelo carregamento de um
 * template, vazia quando veio do "Criar pesquisa em Branco".
 *
 * `emEdicao` guarda o que o editor está mexendo: um objeto quando é uma
 * pergunta existente, null quando é uma nova (aí o editor começa pela escolha
 * do tipo). O `false` é "editor fechado" — precisa ser diferente de null.
 *
 * O vermelho do Trash vem do próprio SVG (#FF2633), não de CSS.
 */
export default function TelaRevisao() {
  const navigate = useNavigate()
  const { pesquisa, removerPergunta, salvarPergunta } = usePesquisa()
  const [emEdicao, setEmEdicao] = useState(false)

  const ehBranco = pesquisa.template === 'blank'

  return (
    <div className={s.tela}>
      <CabecalhoFluxo
        titulo={pesquisa.nome || 'Nova Pesquisa'}
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
            <p className={s.nomePesquisa}>{pesquisa.nome || 'Nova Pesquisa'}</p>
          </div>
          <div className={s.linha}>
            <p className={s.introducao}>
              {ehBranco ? ABERTURA_BRANCO : ABERTURA_TEMPLATE}
            </p>
          </div>
        </section>

        {pesquisa.perguntas.map((pergunta, indice) => (
          <section key={pergunta.id} className={s.cartao}>
            <div className={s.topoCartao}>
              <p className={s.rotuloPergunta}>Pergunta {indice + 1}:</p>
              <div className={s.acoes}>
                <Icone
                  src={pencilSimpleLine}
                  rotulo={`Editar pergunta ${indice + 1}`}
                  onClick={() => setEmEdicao(pergunta)}
                />
                <Icone
                  src={trash}
                  rotulo={`Excluir pergunta ${indice + 1}`}
                  onClick={() => removerPergunta(pergunta.id)}
                />
              </div>
            </div>
            <div className={s.linha}>
              <p className={s.enunciado}>{pergunta.enunciado}</p>
            </div>
            <CorpoDaPergunta pergunta={pergunta} />
          </section>
        ))}

        <button
          type="button"
          className={s.adicionar}
          onClick={() => setEmEdicao(null)}
        >
          <span className={s.textoAdicionar}>Adicionar pergunta</span>
          <img className={s.icone} src={plus} alt="" width={24} height={24} />
        </button>
      </div>

      {emEdicao !== false ? (
        <EditorPergunta
          pergunta={emEdicao}
          onSalvar={(pergunta) => {
            salvarPergunta(pergunta)
            setEmEdicao(false)
          }}
          onFechar={() => setEmEdicao(false)}
        />
      ) : null}
    </div>
  )
}
