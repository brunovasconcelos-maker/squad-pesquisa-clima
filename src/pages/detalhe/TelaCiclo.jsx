import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import Rosca from '../../components/detalhe/Rosca.jsx'
import GraficoBarras from '../../components/detalhe/GraficoBarras.jsx'
import {
  PorPergunta,
  Individual,
} from '../../components/respostas/LeituraDeRespostas.jsx'
import { ler } from '../../lib/pesquisas.js'
import {
  cicloDe,
  respostasDoCiclo,
  distribuicaoDe,
  ehDeEscolha,
  trechosDe,
  resumoDaPergunta,
  LIMITE_TRECHOS,
} from '../../lib/ciclo.js'
import s from './TelaCiclo.module.css'

import close from '../../assets/icons/Close.svg'
import caretRight from '../../assets/icons/CaretRight.svg'
import more from '../../assets/icons/More.svg'
import downloadSimple from '../../assets/icons/DownloadSimple.svg'
import trash from '../../assets/icons/Trash.svg'
import eye from '../../assets/icons/Eye.svg'

/*
 * Detalhe de um ciclo encerrado (Figma 8115:9814, 8115:9995 e 8115:10143).
 *
 * Visual apenas. As respostas são simuladas e presas ao id da pesquisa mais o
 * número do ciclo; o menu do topo, o baixar e o deletar do navegador e o
 * "Ver mais" estão no lugar e não fazem nada. As setas e o seletor da leitura
 * andam, porque vêm prontos do componente que a aba Respostas já usa.
 *
 * A seta de voltar é o CaretRight girado meia volta — o mesmo desenho que o
 * arquivo usa como CaretLeft, que o projeto não tem separado.
 */
const SUBABAS = ['Geral', 'Por pergunta', 'Individual']

/* Uma pergunta na leitura Geral: gráfico quando é de escolha, resumo do Pipo
   mais os trechos quando é aberta. */
function CartaoDaPergunta({ pesquisa, ciclo, pergunta, respostas }) {
  const deEscolha = ehDeEscolha(pergunta)
  const trechos = deEscolha ? [] : trechosDe(pergunta, respostas)

  return (
    <section className={s.cartao}>
      <div className={s.topoCartao}>
        <p className={s.enunciado}>{pergunta.enunciado}</p>
      </div>

      {deEscolha ? (
        <GraficoBarras fatias={distribuicaoDe(pergunta, respostas)} />
      ) : (
        <>
          <div className={s.pipo}>
            <p>Resumo do Pipo</p>
            <p className={s.resumo}>
              {resumoDaPergunta(pesquisa, ciclo, pergunta)}
            </p>
          </div>

          <div className={s.trechos}>
            {trechos.slice(0, LIMITE_TRECHOS).map((texto, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <p key={i} className={s.trecho}>
                {texto}
              </p>
            ))}
            {trechos.length > LIMITE_TRECHOS ? (
              <button type="button" className={s.verMais}>
                Ver mais
              </button>
            ) : null}
          </div>
        </>
      )}
    </section>
  )
}

export default function TelaCiclo() {
  const { id, cicloId } = useParams()
  const navigate = useNavigate()
  const [pesquisas, setPesquisas] = useState(null)
  const [subaba, setSubaba] = useState(SUBABAS[0])
  const [menuAberto, setMenuAberto] = useState(false)
  const envoltorioMenu = useRef(null)

  useEffect(() => setPesquisas(ler()), [])

  useEffect(() => {
    if (!menuAberto) return undefined
    const aoClicar = (e) => {
      if (!envoltorioMenu.current?.contains(e.target)) setMenuAberto(false)
    }
    document.addEventListener('mousedown', aoClicar)
    return () => document.removeEventListener('mousedown', aoClicar)
  }, [menuAberto])

  const pesquisa = pesquisas?.find((p) => p.id === id)
  const ciclo = pesquisa && cicloDe(pesquisa, cicloId)

  /* Pesquisa apagada, ou um ciclo que não existe: volta para o Histórico em
     vez de mostrar uma tela sem conteúdo. */
  useEffect(() => {
    if (!pesquisas) return
    if (!pesquisa) navigate('/', { replace: true })
    else if (!ciclo) navigate(`/pesquisas/${id}`, { replace: true })
  }, [pesquisas, pesquisa, ciclo, id, navigate])

  if (!pesquisa || !ciclo) return null

  const perguntas = pesquisa.perguntas || []
  const respostas = respostasDoCiclo(pesquisa, ciclo)
  const voltar = () => navigate(`/pesquisas/${id}`)

  return (
    <div className={s.tela}>
      <header className={s.cabecalho}>
        <button type="button" className={s.voltar} aria-label="Voltar" onClick={voltar}>
          <img className={s.paraTras} src={caretRight} alt="" width={24} height={24} />
        </button>
        <p className={s.titulo}>{pesquisa.nome}</p>
        <div className={s.acoes}>
          <IconeBotao src={close} rotulo="Fechar" onClick={voltar} />
        </div>
      </header>

      <div className={s.coluna}>
        <section className={`${s.cartao} ${s.cartaoTopo}`}>
          <div className={s.topoCartao}>
            <p className={s.nomeCiclo}>Ciclo {ciclo.numero}</p>
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
                  <button type="button" className={s.itemSuspenso} role="menuitem">
                    <img src={downloadSimple} alt="" width={24} height={24} />
                    Baixar Respostas
                  </button>
                  <button type="button" className={s.itemSuspenso} role="menuitem">
                    <img src={eye} alt="" width={24} height={24} />
                    Ver perguntas completas
                  </button>
                  <button
                    type="button"
                    className={`${s.itemSuspenso} ${s.destrutivo}`}
                    role="menuitem"
                  >
                    <img src={trash} alt="" width={24} height={24} />
                    Deletar Respostas
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className={s.linhaTaxa}>
            <span className={s.taxa}>
              <Rosca taxa={ciclo.taxa} tamanho={28} traco={6} rotulo={false} />
              <span className={s.textoTaxa}>{ciclo.taxa}% responderam</span>
            </span>
            <p className={s.totalRespostas}>
              Total: {ciclo.responderam}|{ciclo.convidados} Respostas
            </p>
          </div>

          <div className={s.linhaCampos}>
            <span className={s.campo}>
              <span className={s.rotulo}>Data de Envio</span>
              <span className={s.valor}>{ciclo.envio}</span>
            </span>
            <span className={s.campo}>
              <span className={s.rotulo}>Encerrada em</span>
              <span className={s.valor}>{ciclo.encerrado}</span>
            </span>
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

        {subaba === 'Geral' ? (
          perguntas.map((pergunta) => (
            <CartaoDaPergunta
              key={pergunta.id}
              pesquisa={pesquisa}
              ciclo={ciclo}
              pergunta={pergunta}
              respostas={respostas}
            />
          ))
        ) : subaba === 'Por pergunta' ? (
          <PorPergunta perguntas={perguntas} respostas={respostas} />
        ) : (
          <Individual perguntas={perguntas} respostas={respostas} />
        )}
      </div>
    </div>
  )
}
