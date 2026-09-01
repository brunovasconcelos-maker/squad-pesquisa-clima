import { useState } from 'react'
import s from './Editor.module.css'
import Botao from '../../components/fluxo/Botao.jsx'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import ModalConfirmar from '../../components/fluxo/ModalConfirmar.jsx'
import iguais from '../../lib/iguais.js'
import {
  TIPOS,
  converterPergunta,
  perguntaVazia,
  LIMITE_CURTA,
  LIMITE_LONGA,
} from './bancoDePerguntas.js'

import close from '../../assets/icons/Close.svg'
import trash from '../../assets/icons/Trash.svg'
import checkSquare from '../../assets/icons/CheckSquare.svg'
import square from '../../assets/icons/Square.svg'

const NOTA_MIN = 3
const NOTA_MAX = 10
const MIN_OPCOES = 2

/* A escala de nota sempre começa em zero; só o teto é configurável. */
const TETOS = Array.from(
  { length: NOTA_MAX - NOTA_MIN + 1 },
  (_, i) => NOTA_MIN + i,
)

const NOME_DO_TIPO = Object.fromEntries(TIPOS.map((t) => [t.id, t.nome]))

/*
 * Editor de pergunta. Serve para os dois casos: editar uma existente e criar
 * uma nova — a diferença é só a pergunta que entra.
 *
 * Não há Figma para estas telas. O desenho segue a convenção de construtor de
 * formulário (Typeform, Google Forms): modal, campos rotulados, opções em
 * lista com remover ao lado, e o tipo escolhido antes de tudo quando é nova.
 *
 * A edição acontece numa cópia: só o "Salvar" devolve, então fechar descarta.
 *
 * Fechar pergunta antes, e é a exceção do projeto — nos outros modais o
 * fechar descarta calado, de propósito, porque o que se perde ali é um campo
 * ou dois. Aqui é uma pergunta inteira: enunciado, opções, rótulos. Só
 * pergunta se houver o que perder; sem nada alterado desde que abriu, fecha
 * direto.
 */
export default function EditorPergunta({ pergunta, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState(pergunta)
  /* A pergunta como estava ao abrir o editor — é com ela que o rascunho se
     compara para saber se há alterações. Numa pergunta nova ela nasce junto
     com o tipo escolhido, e é por isso que é estado e não a prop. */
  const [original, setOriginal] = useState(pergunta)
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false)

  const alterada = !iguais(rascunho, original)
  const fechar = () => {
    if (alterada) setConfirmandoDescarte(true)
    else onFechar()
  }

  /* Sem pergunta ainda: primeiro passo é escolher o tipo. */
  if (!rascunho) {
    return (
      <div className={s.scrim}>
        <div className={s.modal} role="dialog" aria-label="Nova pergunta">
          <div className={s.cabecalho}>
            <p className={s.titulo}>Nova pergunta</p>
            {/* Ainda não há nada para descartar: só se escolheu o tipo. */}
            <IconeBotao src={close} rotulo="Fechar" onClick={onFechar} />
          </div>
          <p className={s.dica}>Escolha o tipo da pergunta.</p>
          <div className={s.tipos}>
            {TIPOS.map(({ id, nome }) => (
              <button
                key={id}
                type="button"
                className={s.tipo}
                onClick={() => {
                  const nova = perguntaVazia(id)
                  setRascunho(nova)
                  setOriginal(nova)
                }}
              >
                {nome}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const alterar = (campos) => setRascunho((r) => ({ ...r, ...campos }))

  /*
   * Trocar o tipo troca os campos abaixo, levando junto o que ainda faz
   * sentido para o tipo novo.
   *
   * Numa pergunta nova em que ainda não se digitou nada, a base acompanha a
   * troca: escolher "Texto longo", mudar de ideia e fechar não é alteração
   * nenhuma. Numa pergunta que já existia a base fica como estava — aí a
   * troca de tipo é justamente o que se perderia ao fechar.
   */
  const trocarTipo = (tipo) => {
    const intocada = !alterada
    setRascunho((r) => converterPergunta(r, tipo))
    if (!pergunta && intocada) setOriginal((o) => converterPergunta(o, tipo))
  }

  const alterarOpcao = (indice, texto) =>
    alterar({
      opcoes: rascunho.opcoes.map((o, i) => (i === indice ? texto : o)),
    })

  const removerOpcao = (indice) =>
    alterar({ opcoes: rascunho.opcoes.filter((_, i) => i !== indice) })

  const temOpcoes =
    rascunho.tipo === 'escolhaUnica' || rascunho.tipo === 'escolhaMultipla'

  /* Só o enunciado é obrigatório; opções em branco travam o salvar porque
     virariam linhas vazias no cartão. */
  const podeSalvar =
    rascunho.enunciado.trim() !== '' &&
    (!temOpcoes || rascunho.opcoes.every((o) => o.trim() !== ''))

  return (
    <div className={s.scrim}>
      <div className={s.modal} role="dialog" aria-label="Editar pergunta">
        <div className={s.cabecalho}>
          <p className={s.titulo}>{NOME_DO_TIPO[rascunho.tipo]}</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={fechar} />
        </div>

        <div className={s.corpo}>
          {/* Trocar o tipo aqui troca os campos abaixo: o que não vale mais
              para o tipo novo sai do rascunho junto. */}
          <label className={s.campo}>
            <span className={s.rotulo}>Tipo</span>
            <select
              className={s.entrada}
              value={rascunho.tipo}
              onChange={(e) => trocarTipo(e.target.value)}
            >
              {TIPOS.map(({ id, nome }) => (
                <option key={id} value={id}>
                  {nome}
                </option>
              ))}
            </select>
          </label>

          <label className={s.campo}>
            <span className={s.rotulo}>Pergunta</span>
            <textarea
              className={s.entrada}
              rows={2}
              value={rascunho.enunciado}
              placeholder="Escreva a pergunta"
              onChange={(e) => alterar({ enunciado: e.target.value })}
            />
          </label>

          {rascunho.tipo === 'nota' ? (
            <>
              <label className={s.campo}>
                <span className={s.rotulo}>Escala</span>
                <select
                  className={s.entrada}
                  value={rascunho.maximo}
                  onChange={(e) => alterar({ maximo: Number(e.target.value) })}
                >
                  {TETOS.map((teto) => (
                    <option key={teto} value={teto}>
                      0 a {teto}
                    </option>
                  ))}
                </select>
              </label>
              <div className={s.duasColunas}>
                <label className={s.campo}>
                  <span className={s.rotulo}>Rótulo da esquerda</span>
                  <input
                    className={s.entrada}
                    type="text"
                    value={rascunho.pontaEsquerda}
                    placeholder="Não recomendaria"
                    onChange={(e) => alterar({ pontaEsquerda: e.target.value })}
                  />
                </label>
                <label className={s.campo}>
                  <span className={s.rotulo}>Rótulo da direita</span>
                  <input
                    className={s.entrada}
                    type="text"
                    value={rascunho.pontaDireita}
                    placeholder="Recomendaria"
                    onChange={(e) => alterar({ pontaDireita: e.target.value })}
                  />
                </label>
              </div>
            </>
          ) : null}

          {temOpcoes ? (
            <div className={s.campo}>
              <span className={s.rotulo}>Opções</span>
              <div className={s.opcoes}>
                {rascunho.opcoes.map((opcao, indice) => (
                  // As opções não têm id próprio; a posição é o que as
                  // distingue enquanto se edita a lista.
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={indice} className={s.linhaOpcao}>
                    <input
                      className={s.entrada}
                      type="text"
                      value={opcao}
                      placeholder={`Opção ${indice + 1}`}
                      onChange={(e) => alterarOpcao(indice, e.target.value)}
                    />
                    <button
                      type="button"
                      className={s.remover}
                      aria-label={`Remover opção ${indice + 1}`}
                      disabled={rascunho.opcoes.length <= MIN_OPCOES}
                      onClick={() => removerOpcao(indice)}
                    >
                      <img className={s.icone} src={trash} alt="" width={24} height={24} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className={s.secundario}
                onClick={() => alterar({ opcoes: [...rascunho.opcoes, ''] })}
              >
                Adicionar opção
              </button>
              <button
                type="button"
                className={s.alternador}
                onClick={() => alterar({ temOutro: !rascunho.temOutro })}
              >
                <img
                  className={s.icone}
                  src={rascunho.temOutro ? checkSquare : square}
                  alt=""
                  width={24}
                  height={24}
                />
                Incluir opção &quot;Outro&quot;
              </button>
            </div>
          ) : null}

          {rascunho.tipo === 'respostaCurta' ? (
            <p className={s.dica}>
              A resposta aceita até {LIMITE_CURTA} caracteres.
            </p>
          ) : null}
          {rascunho.tipo === 'respostaLonga' ? (
            <p className={s.dica}>
              A resposta aceita até {LIMITE_LONGA} caracteres.
            </p>
          ) : null}
          {rascunho.tipo === 'estrelas' ? (
            <p className={s.dica}>A escala é sempre de 5 estrelas.</p>
          ) : null}
        </div>

        <div className={s.rodape}>
          <Botao onClick={fechar}>Cancelar</Botao>
          <Botao
            variante="marca"
            desabilitado={!podeSalvar}
            onClick={() => onSalvar(rascunho)}
          >
            Salvar
          </Botao>
        </div>
      </div>

      {confirmandoDescarte ? (
        <ModalConfirmar
          titulo="Descartar alterações?"
          texto="Você perderá o que foi editado nesta pergunta."
          rotuloConfirmar="Descartar"
          onConfirmar={onFechar}
          onCancelar={() => setConfirmandoDescarte(false)}
        />
      ) : null}
    </div>
  )
}
