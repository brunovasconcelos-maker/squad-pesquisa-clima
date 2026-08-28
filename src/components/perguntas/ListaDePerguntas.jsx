import s from './ListaDePerguntas.module.css'
import { LIMITE_CURTA, LIMITE_LONGA } from '../../pages/nova-pesquisa/bancoDePerguntas.js'

import pencilSimpleLine from '../../assets/icons/PencilSimpleLine.svg'
import trash from '../../assets/icons/Trash.svg'
import circle from '../../assets/icons/Circle.svg'
import square from '../../assets/icons/Square.svg'
import star from '../../assets/icons/Star.svg'
import plus from '../../assets/icons/Plus.svg'

/*
 * Card de abertura, cards de pergunta e a linha de adicionar (Figma 8065:4915).
 *
 * Nasceu dentro da tela de revisão do fluxo e saiu de lá quando a aba
 * Perguntas do detalhe passou a mostrar exatamente a mesma lista. Não sabe de
 * onde vêm os dados nem o que os botões fazem: tudo entra por prop, o que é o
 * que permite ao detalhe interceptar os cliques quando a pesquisa está
 * rodando sem duplicar nada disto.
 *
 * O vermelho do Trash vem do próprio SVG (#FF2633), não de CSS.
 */
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

export default function ListaDePerguntas({
  nome,
  abertura,
  perguntas,
  onEditarAbertura,
  onEditarPergunta,
  onRemoverPergunta,
  onAdicionar,
}) {
  return (
    <>
      <section className={s.cartao}>
        <div className={s.topoCartao}>
          <p className={s.rotuloAbertura}>Abertura</p>
          <Icone
            src={pencilSimpleLine}
            rotulo="Editar abertura"
            onClick={onEditarAbertura}
          />
        </div>
        <div className={s.linha}>
          <p className={s.nomePesquisa}>{nome || 'Nova Pesquisa'}</p>
        </div>
        <div className={s.linha}>
          <p className={s.introducao}>{abertura}</p>
        </div>
      </section>

      {perguntas.map((pergunta, indice) => (
        <section key={pergunta.id} className={s.cartao}>
          <div className={s.topoCartao}>
            <p className={s.rotuloPergunta}>Pergunta {indice + 1}:</p>
            <div className={s.acoes}>
              <Icone
                src={pencilSimpleLine}
                rotulo={`Editar pergunta ${indice + 1}`}
                onClick={() => onEditarPergunta(pergunta)}
              />
              <Icone
                src={trash}
                rotulo={`Excluir pergunta ${indice + 1}`}
                onClick={() => onRemoverPergunta(pergunta)}
              />
            </div>
          </div>
          <div className={s.linha}>
            <p className={s.enunciado}>{pergunta.enunciado}</p>
          </div>
          <CorpoDaPergunta pergunta={pergunta} />
        </section>
      ))}

      <button type="button" className={s.adicionar} onClick={onAdicionar}>
        <span className={s.textoAdicionar}>Adicionar pergunta</span>
        <img className={s.icone} src={plus} alt="" width={24} height={24} />
      </button>
    </>
  )
}
