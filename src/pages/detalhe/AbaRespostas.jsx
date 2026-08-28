import { useEffect, useRef, useState } from 'react'
import CorpoDaResposta from '../../components/perguntas/CorpoDaResposta.jsx'
import ModalConfirmar from '../../components/fluxo/ModalConfirmar.jsx'
import {
  valorDe,
  removerResposta,
  limparRespostas,
  paraCsv,
  nomeDeArquivo,
  baixar,
} from '../../lib/respostas.js'
import s from './AbaRespostas.module.css'

import more from '../../assets/icons/More.svg'
import caretDown from '../../assets/icons/CaretDown.svg'
import trash from '../../assets/icons/Trash.svg'
import downloadSimple from '../../assets/icons/DownloadSimple.svg'

/*
 * Aba Respostas (Figma 8032:1809 e 8036:2383).
 *
 * As respostas vêm guardadas na pesquisa e são simuladas — quem as cria e
 * mantém em dia é lib/respostas.js. Aqui só se navega, deleta e baixa.
 *
 * Deletar mexe na lista e na taxa ao mesmo tempo, senão a rosca do Geral
 * passaria a contar diferente da contagem daqui.
 */
const SUBABAS = ['Por pergunta', 'Individual']

/* Anda pela lista sem sair dela: nas pontas o botão desliga. */
function Seta({ direcao, rotulo, onClick, desabilitado }) {
  return (
    <button
      type="button"
      className={s.seta}
      aria-label={rotulo}
      disabled={desabilitado}
      onClick={onClick}
    >
      <img
        className={`${s.icone20} ${direcao === 'anterior' ? s.paraEsquerda : s.paraDireita}`}
        src={caretDown}
        alt=""
        width={20}
        height={20}
      />
    </button>
  )
}

function CartaoResposta({ rotulo, pergunta, resposta, enunciado }) {
  return (
    <section className={s.cartao}>
      <div className={s.topoCartao}>
        <p className={s.rotuloCartao}>{rotulo}</p>
      </div>
      {enunciado ? <p className={s.enunciado}>{enunciado}</p> : null}
      <CorpoDaResposta pergunta={pergunta} resposta={valorDe(resposta, pergunta)} />
    </section>
  )
}

export default function AbaRespostas({ pesquisa, onAlterar }) {
  const [subaba, setSubaba] = useState(SUBABAS[0])
  const [menuAberto, setMenuAberto] = useState(false)
  const [listaAberta, setListaAberta] = useState(false)
  const [indicePergunta, setIndicePergunta] = useState(0)
  const [indicePessoa, setIndicePessoa] = useState(0)
  const [confirmacao, setConfirmacao] = useState(null)
  const envoltorioMenu = useRef(null)
  const envoltorioLista = useRef(null)

  const perguntas = pesquisa.perguntas || []
  const respostas = pesquisa.respostas || []
  const total = respostas.length

  /* Deletar encurta a lista: sem isso o índice ficaria apontando para fora
     dela e a tela mostraria um vazio. */
  useEffect(() => {
    if (indicePessoa > 0 && indicePessoa >= total) setIndicePessoa(total - 1)
  }, [indicePessoa, total])

  /* Clicar fora fecha o que estiver aberto — senão o suspenso fica atrás de
     tudo, como acontecia na linha da lista. */
  useEffect(() => {
    if (!menuAberto && !listaAberta) return undefined
    const aoClicar = (e) => {
      if (!envoltorioMenu.current?.contains(e.target)) setMenuAberto(false)
      if (!envoltorioLista.current?.contains(e.target)) setListaAberta(false)
    }
    document.addEventListener('mousedown', aoClicar)
    return () => document.removeEventListener('mousedown', aoClicar)
  }, [menuAberto, listaAberta])

  const pergunta = perguntas[indicePergunta]
  const pessoa = respostas[indicePessoa]

  const baixarUma = () => {
    if (!pessoa) return
    baixar(
      nomeDeArquivo(pesquisa, `resposta-${indicePessoa + 1}`),
      paraCsv(pesquisa, [pessoa]),
    )
  }

  const baixarTudo = () => {
    setMenuAberto(false)
    baixar(nomeDeArquivo(pesquisa, 'respostas'), paraCsv(pesquisa, respostas))
  }

  const pedirExclusaoDeUma = () =>
    setConfirmacao({
      titulo: 'Deletar esta resposta?',
      texto: `A resposta ${indicePessoa + 1} sai da pesquisa e o total cai para ${total - 1}. Não dá para desfazer.`,
      rotulo: 'Deletar',
      aoConfirmar: () => onAlterar((p) => removerResposta(p, pessoa.id)),
    })

  const pedirExclusaoDeTudo = () => {
    setMenuAberto(false)
    setConfirmacao({
      titulo: 'Deletar todas as respostas?',
      texto: `As ${total} respostas desta pesquisa são apagadas e a taxa volta a zero. Não dá para desfazer.`,
      rotulo: 'Deletar tudo',
      aoConfirmar: () => {
        onAlterar((p) => limparRespostas(p))
        setIndicePessoa(0)
      },
    })
  }

  return (
    <div className={s.coluna}>
      <section className={s.cartao}>
        <div className={s.topoCartao}>
          <p className={s.total}>
            Total: {total} {total === 1 ? 'Resposta' : 'Respostas'}
          </p>
          <div className={s.envoltorioMenu} ref={envoltorioMenu}>
            <button
              type="button"
              className={s.maisOpcoes}
              aria-label="Mais opções"
              aria-expanded={menuAberto}
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              <img src={more} alt="" width={24} height={24} />
            </button>
            {menuAberto ? (
              <div className={s.suspenso} role="menu">
                <button
                  type="button"
                  className={s.itemSuspenso}
                  role="menuitem"
                  disabled={!total}
                  onClick={baixarTudo}
                >
                  Baixar tudo
                </button>
                <button
                  type="button"
                  className={`${s.itemSuspenso} ${s.destrutivo}`}
                  role="menuitem"
                  disabled={!total}
                  onClick={pedirExclusaoDeTudo}
                >
                  Deletar
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className={s.subabas} role="tablist" aria-label="Modo de leitura">
          {SUBABAS.map((nome) => (
            <button
              type="button"
              key={nome}
              className={`${s.subaba} ${nome === subaba ? s.ativa : ''}`}
              role="tab"
              aria-selected={nome === subaba}
              onClick={() => setSubaba(nome)}
            >
              {nome}
            </button>
          ))}
        </div>
      </section>

      {!total ? (
        <section className={s.cartao}>
          <p className={s.vazio}>
            Nenhuma resposta ainda. Elas aparecem aqui conforme as pessoas
            respondem.
          </p>
        </section>
      ) : subaba === 'Por pergunta' ? (
        <>
          <section className={s.cartao}>
            <div className={s.topoNavegador}>
              <p className={s.rotuloCartao}>
                Pergunta {indicePergunta + 1} de {perguntas.length}
              </p>
              <div className={s.setas}>
                <Seta
                  direcao="anterior"
                  rotulo="Pergunta anterior"
                  desabilitado={indicePergunta === 0}
                  onClick={() => setIndicePergunta((i) => i - 1)}
                />
                <Seta
                  direcao="proxima"
                  rotulo="Próxima pergunta"
                  desabilitado={indicePergunta >= perguntas.length - 1}
                  onClick={() => setIndicePergunta((i) => i + 1)}
                />
              </div>
            </div>

            <div className={s.envoltorioLista} ref={envoltorioLista}>
              <button
                type="button"
                className={s.seletor}
                aria-expanded={listaAberta}
                aria-label="Escolher pergunta"
                onClick={() => setListaAberta((aberta) => !aberta)}
              >
                <span className={s.textoSeletor}>{pergunta?.enunciado}</span>
                <img
                  className={s.icone20}
                  src={caretDown}
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
              {listaAberta ? (
                <div className={s.listaPerguntas} role="listbox">
                  {perguntas.map((q, i) => (
                    <button
                      type="button"
                      key={q.id}
                      className={`${s.itemLista} ${i === indicePergunta ? s.itemAtual : ''}`}
                      role="option"
                      aria-selected={i === indicePergunta}
                      onClick={() => {
                        setIndicePergunta(i)
                        setListaAberta(false)
                      }}
                    >
                      {i + 1}. {q.enunciado}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {respostas.map((resposta, indice) => (
            <CartaoResposta
              key={resposta.id}
              rotulo={`Resposta ${indice + 1}`}
              pergunta={pergunta}
              resposta={resposta}
            />
          ))}
        </>
      ) : (
        <>
          <section className={`${s.cartao} ${s.cartaoNavegador}`}>
            <div className={s.topoNavegador}>
              <p className={s.rotuloCartao}>
                Resposta {indicePessoa + 1} de {total}
              </p>
              <div className={s.setas}>
                <Seta
                  direcao="anterior"
                  rotulo="Resposta anterior"
                  desabilitado={indicePessoa === 0}
                  onClick={() => setIndicePessoa((i) => i - 1)}
                />
                <Seta
                  direcao="proxima"
                  rotulo="Próxima resposta"
                  desabilitado={indicePessoa >= total - 1}
                  onClick={() => setIndicePessoa((i) => i + 1)}
                />
                <button
                  type="button"
                  className={s.acaoIcone}
                  aria-label="Baixar resposta"
                  onClick={baixarUma}
                >
                  <img src={downloadSimple} alt="" width={24} height={24} />
                </button>
                <button
                  type="button"
                  className={s.acaoIcone}
                  aria-label="Deletar resposta"
                  onClick={pedirExclusaoDeUma}
                >
                  <img src={trash} alt="" width={24} height={24} />
                </button>
              </div>
            </div>
          </section>

          {perguntas.map((q, indice) => (
            <CartaoResposta
              key={q.id}
              rotulo={`Pergunta ${indice + 1}:`}
              enunciado={q.enunciado}
              pergunta={q}
              resposta={pessoa}
            />
          ))}
        </>
      )}

      {confirmacao ? (
        <ModalConfirmar
          titulo={confirmacao.titulo}
          texto={confirmacao.texto}
          rotuloConfirmar={confirmacao.rotulo}
          onConfirmar={() => {
            confirmacao.aoConfirmar()
            setConfirmacao(null)
          }}
          onCancelar={() => setConfirmacao(null)}
        />
      ) : null}
    </div>
  )
}
