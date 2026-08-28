import { useState } from 'react'
import CorpoDaResposta from '../../components/perguntas/CorpoDaResposta.jsx'
import { totalDeRespostas } from '../../lib/geral.js'
import { respostaDe, respostasDaPessoa } from '../../lib/respostas.js'
import s from './AbaRespostas.module.css'

import more from '../../assets/icons/More.svg'
import caretDown from '../../assets/icons/CaretDown.svg'
import trash from '../../assets/icons/Trash.svg'
import downloadSimple from '../../assets/icons/DownloadSimple.svg'

/*
 * Aba Respostas (Figma 8032:1809 e 8036:2383).
 *
 * Visual apenas. As respostas são de exemplo — vêm de lib/respostas.js, presas
 * ao id da pesquisa —, e nada aqui navega: as setas, o seletor de pergunta, o
 * menu de três pontos, o baixar e o deletar estão no lugar e não fazem nada.
 * Isso é o passo seguinte.
 *
 * O total sai de `totalDeRespostas`, o mesmo número que a rosca da aba Geral
 * traduz em porcentagem, para as duas abas não discordarem sobre a mesma
 * pesquisa.
 */
const SUBABAS = ['Por pergunta', 'Individual']

function Seta({ direcao, rotulo }) {
  return (
    <button type="button" className={s.seta} aria-label={rotulo}>
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

/* Um card por resposta: o rótulo em cima, o que foi respondido embaixo. */
function CartaoResposta({ rotulo, pergunta, resposta, enunciado }) {
  return (
    <section className={s.cartao}>
      <div className={s.topoCartao}>
        <p className={s.rotuloCartao}>{rotulo}</p>
      </div>
      {enunciado ? <p className={s.enunciado}>{enunciado}</p> : null}
      <CorpoDaResposta pergunta={pergunta} resposta={resposta} />
    </section>
  )
}

export default function AbaRespostas({ pesquisa }) {
  const [subaba, setSubaba] = useState(SUBABAS[0])
  const [menuAberto, setMenuAberto] = useState(false)

  const perguntas = pesquisa.perguntas || []
  const total = totalDeRespostas(pesquisa)

  /* Sem navegação ainda: a tela mostra sempre a primeira pergunta e a
     primeira pessoa. */
  const pergunta = perguntas[0]
  const pessoas = Array.from({ length: total }, (_, i) => i)

  return (
    <div className={s.coluna}>
      <section className={s.cartao}>
        <div className={s.topoCartao}>
          <p className={s.total}>
            Total: {total} {total === 1 ? 'Resposta' : 'Respostas'}
          </p>
          <div className={s.envoltorioMenu}>
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
                <button type="button" className={s.itemSuspenso} role="menuitem">
                  Baixar tudo
                </button>
                <button
                  type="button"
                  className={`${s.itemSuspenso} ${s.destrutivo}`}
                  role="menuitem"
                >
                  Deletar
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Coladas no rodapé do card, como as abas do cabeçalho ficam na
            divisória: o sublinhado da ativa continua a borda. */}
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

      {subaba === 'Por pergunta' ? (
        <>
          <section className={s.cartao}>
            <div className={s.topoNavegador}>
              <p className={s.rotuloCartao}>
                Pergunta 1 de {perguntas.length}
              </p>
              <div className={s.setas}>
                <Seta direcao="anterior" rotulo="Pergunta anterior" />
                <Seta direcao="proxima" rotulo="Próxima pergunta" />
              </div>
            </div>
            <button type="button" className={s.seletor}>
              <span className={s.textoSeletor}>{pergunta?.enunciado}</span>
              <img className={s.icone20} src={caretDown} alt="" width={20} height={20} />
            </button>
          </section>

          {pessoas.map((indice) => (
            <CartaoResposta
              key={indice}
              rotulo={`Resposta ${indice + 1}`}
              pergunta={pergunta}
              resposta={pergunta ? respostaDe(pesquisa, indice, pergunta) : null}
            />
          ))}
        </>
      ) : (
        <>
          <section className={`${s.cartao} ${s.cartaoNavegador}`}>
            <div className={s.topoNavegador}>
              <p className={s.rotuloCartao}>Resposta 1 de {total}</p>
              <div className={s.setas}>
                <Seta direcao="anterior" rotulo="Resposta anterior" />
                <Seta direcao="proxima" rotulo="Próxima resposta" />
                <button type="button" className={s.acaoIcone} aria-label="Baixar resposta">
                  <img src={downloadSimple} alt="" width={24} height={24} />
                </button>
                <button type="button" className={s.acaoIcone} aria-label="Deletar resposta">
                  <img src={trash} alt="" width={24} height={24} />
                </button>
              </div>
            </div>
          </section>

          {respostasDaPessoa(pesquisa, 0).map(({ pergunta: q, resposta }, indice) => (
            <CartaoResposta
              key={q.id}
              rotulo={`Pergunta ${indice + 1}:`}
              enunciado={q.enunciado}
              pergunta={q}
              resposta={resposta}
            />
          ))}
        </>
      )}
    </div>
  )
}
