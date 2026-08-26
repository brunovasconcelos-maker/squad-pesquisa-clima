import Selo from '../../components/Selo.jsx'
import Rosca from '../../components/detalhe/Rosca.jsx'
import { STATUS } from '../../lib/pesquisas.js'
import {
  camposDe,
  taxaAtualDe,
  taxaAnteriorDe,
  tempoMedioDe,
  desistenciaDe,
  piorAvaliacaoDe,
  resumoDe,
} from '../../lib/geral.js'
import s from './AbaGeral.module.css'

import more from '../../assets/icons/More.svg'
import caretDown from '../../assets/icons/CaretDown.svg'

/*
 * Conteúdo da aba Geral (Figma 8032:1573).
 *
 * A pesquisa vem inteira por prop; o que cada bloco mostra sai de `lib/geral.js`.
 * Datas, status, tipo, ciclos e a taxa que o motor sobe são reais; tempo médio,
 * desistências, as notas por pergunta e o texto do Pipo continuam simulados,
 * porque não há backend coletando resposta nenhuma.
 *
 * Os botões — o de três pontos e o seletor de período — estão no lugar mas
 * ainda não fazem nada.
 */
function Campo({ rotulo, valor }) {
  return (
    <div className={s.campo}>
      <span className={s.rotulo}>{rotulo}</span>
      <span className={s.valor}>{valor}</span>
    </div>
  )
}

function CartaoTaxa({ dados }) {
  return (
    <section className={s.cartao}>
      <div className={s.topoTaxa}>
        <p className={s.tituloCartao}>{dados.titulo}</p>
        {dados.periodo ? (
          <button type="button" className={s.periodo}>
            {dados.periodo}
            <img src={caretDown} alt="" width={16} height={16} />
          </button>
        ) : null}
      </div>
      <div className={s.linhaRosca}>
        <Rosca taxa={dados.taxa} />
        <div className={s.textosRosca}>
          <p className={s.textoPrincipal}>{dados.principal}</p>
          <p className={s.textoApoio}>{dados.apoio}</p>
        </div>
      </div>
    </section>
  )
}

/* Os dois primeiros cartões da faixa de baixo: número e unidade na mesma
   linha de base. */
function CartaoNumero({ titulo, valor, unidade }) {
  return (
    <section className={s.cartao}>
      <p className={s.tituloCartao}>{titulo}</p>
      <div className={s.numeroLinha}>
        <span className={s.numeroGrande}>{valor}</span>
        <span className={s.unidade}>{unidade}</span>
      </div>
    </section>
  )
}

export default function AbaGeral({ pesquisa }) {
  const campos = camposDe(pesquisa)
  const atual = taxaAtualDe(pesquisa)
  const anterior = taxaAnteriorDe(pesquisa)
  const piorAvaliacao = piorAvaliacaoDe(pesquisa)
  const tempoMedio = tempoMedioDe(pesquisa)
  const desistencia = desistenciaDe(pesquisa)

  return (
    <div className={s.coluna}>
      <section className={`${s.cartao} ${s.cartaoInfo}`}>
        <div className={s.topoInfo}>
          <h2 className={s.nome}>{pesquisa.nome}</h2>
          <button type="button" className={s.maisOpcoes} aria-label="Mais opções">
            <img src={more} alt="" width={24} height={24} />
          </button>
        </div>

        <Selo status={STATUS[pesquisa.status]} />

        {/* Quatro campos em duas linhas de dois: os dois primeiros mudam de
            rótulo conforme o status, "Tipo" e "Ciclos" aparecem sempre. */}
        <div className={s.linhaCampos}>
          <Campo {...campos[0]} />
          <Campo {...campos[1]} />
        </div>
        <div className={s.linhaCampos}>
          <Campo {...campos[2]} />
          <Campo {...campos[3]} />
        </div>
      </section>

      <div className={s.faixa}>
        <CartaoTaxa dados={atual} />
        {anterior ? <CartaoTaxa dados={anterior} /> : null}
      </div>

      <section className={s.pipo}>
        <p>Resumo do Pipo</p>
        <p className={s.resumo}>{resumoDe(pesquisa, atual, anterior)}</p>
      </section>

      <div className={`${s.faixa} ${s.faixaNumeros}`}>
        <CartaoNumero
          titulo="Tempo médio de resposta"
          valor={tempoMedio.valor}
          unidade={tempoMedio.unidade}
        />
        <CartaoNumero
          titulo="Taxa de desistência"
          valor={desistencia.valor}
          unidade={desistencia.unidade}
        />
        {/* Sem pergunta de nota não há pior nota, e o cartão some em vez de
            mostrar um número inventado.

            O terceiro empilha número e pergunta, e usa um corpo menor: o
            Figma desenha 50px aqui contra os 80px dos vizinhos, que é o que
            deixa um "2,5" caber sem espremer o cartão. */}
        {piorAvaliacao ? (
          <section className={`${s.cartao} ${s.cartaoAvaliacao}`}>
            <p className={s.tituloCartao}>Pior avaliação</p>
            <div className={s.blocoAvaliacao}>
              <span className={s.numeroMedio}>{piorAvaliacao.valor}</span>
              <span className={s.unidade}>{piorAvaliacao.pergunta}</span>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
