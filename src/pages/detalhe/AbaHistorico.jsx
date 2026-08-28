import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Rosca from '../../components/detalhe/Rosca.jsx'
import { historicoDe, ordenar, COLUNAS } from '../../lib/historico.js'
import s from './AbaHistorico.module.css'

import caretRight from '../../assets/icons/CaretRight.svg'

/*
 * Aba Histórico (Figma 8032:1828).
 *
 * Uma linha por ciclo encerrado — o que está rodando não entra, porque a
 * lista é do que já fechou. Os dados vêm de lib/historico.js e são simulados,
 * menos a contagem e a numeração dos ciclos, que saem da pesquisa.
 *
 * Faltam dois ícones e os dois lugares ficam reservados, sem substituto:
 *  - ArrowsDownUp, o alternador das colunas ordenáveis. A ordenação funciona
 *    pelo próprio cabeçalho; a coluna ativa se distingue pela cor do rótulo,
 *    que é o que dá para fazer com o que existe.
 *  - Warning, ao lado da data de um ciclo encerrado antes do prazo.
 *
 * A seta da direita substitui o menu de três pontos do arquivo, a pedido: ela
 * só diz que a linha abre. É o CaretRight do projeto — não há uma seta reta
 * em src/assets/icons.
 */
export default function AbaHistorico({ pesquisa }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [ordem, setOrdem] = useState({ coluna: 'numero', crescente: false })

  const ciclos = ordenar(historicoDe(pesquisa), ordem.coluna, ordem.crescente)

  /* Clicar na mesma coluna inverte; em outra, começa decrescente — que é como
     a lista chega, do ciclo mais novo para o mais velho. */
  const alternar = (coluna) =>
    setOrdem((atual) =>
      atual.coluna === coluna
        ? { coluna, crescente: !atual.crescente }
        : { coluna, crescente: false },
    )

  const abrir = (ciclo) => navigate(`/pesquisas/${id}/ciclos/${ciclo.numero}`)

  if (!ciclos.length) {
    return (
      <div className={s.vazio}>
        <p className={s.textoVazio}>
          Nenhum ciclo encerrado ainda. Quando o ciclo atual fechar, ele
          aparece aqui.
        </p>
      </div>
    )
  }

  return (
    <div className={s.tela}>
      {/* O cabeçalho sangra até a borda; as colunas dele alinham com as
          células porque o recuo acompanha o da coluna das linhas mais os
          16px de padding do card. */}
      <div className={s.cabecalho} role="row">
        {COLUNAS.map((coluna) => {
          const ativa = ordem.coluna === coluna.id
          const conteudo = (
            <>
              <span className={s.rotuloColuna}>{coluna.nome}</span>
              {/* Reservado para o ArrowsDownUp, que ainda não está no projeto. */}
              {coluna.ordenavel ? <span className={s.espacoIcone} /> : null}
            </>
          )
          return coluna.ordenavel ? (
            <button
              type="button"
              key={coluna.id}
              className={`${s.coluna} ${s[coluna.id]} ${ativa ? s.colunaAtiva : ''}`}
              aria-sort={
                ativa ? (ordem.crescente ? 'ascending' : 'descending') : 'none'
              }
              onClick={() => alternar(coluna.id)}
            >
              {conteudo}
            </button>
          ) : (
            <span key={coluna.id} className={`${s.coluna} ${s[coluna.id]}`}>
              {conteudo}
            </span>
          )
        })}
        <span className={s.vaoDaSeta} />
      </div>

      <div className={s.linhas}>
        {ciclos.map((ciclo) => (
          <div
            key={ciclo.id}
            className={s.linha}
            role="button"
            tabIndex={0}
            aria-label={`Abrir ciclo ${ciclo.numero}`}
            onClick={() => abrir(ciclo)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return
              e.preventDefault()
              abrir(ciclo)
            }}
          >
            <span className={`${s.celula} ${s.numero}`}>Ciclo {ciclo.numero}</span>
            <span className={`${s.celula} ${s.inicio}`}>{ciclo.envio}</span>

            <span className={`${s.celula} ${s.fim}`}>
              {ciclo.encerrado}
              {ciclo.cedo ? (
                /* O aviso e a explicação andam juntos; sem o ícone, o que
                   sobra é o título nativo até o arquivo chegar. */
                <span
                  className={s.aviso}
                  title="Encerrado antes do prazo: a pesquisa foi pausada durante o ciclo."
                >
                  <span className={s.espacoIcone} />
                  <span className={s.balao} role="tooltip">
                    Encerrado antes do prazo: a pesquisa foi pausada durante o
                    ciclo.
                  </span>
                </span>
              ) : null}
            </span>

            <span className={`${s.celula} ${s.taxa}`}>
              <Rosca taxa={ciclo.taxa} tamanho={28} traco={6} rotulo={false} />
              <span className={s.textoTaxa}>{ciclo.taxa}% responderam</span>
            </span>

            <span className={`${s.celula} ${s.atividade}`}>
              {ciclo.alteracoes ? (
                <>
                  <span className={s.ponto} />
                  <span className={s.textoAtividade}>
                    Sofreu {ciclo.alteracoes}{' '}
                    {ciclo.alteracoes === 1 ? 'alteração' : 'alterações'}
                  </span>
                </>
              ) : null}
            </span>

            <span className={s.abrir}>
              <img src={caretRight} alt="" width={24} height={24} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
