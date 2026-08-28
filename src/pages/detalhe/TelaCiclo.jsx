import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import { ler } from '../../lib/pesquisas.js'
import s from './TelaCiclo.module.css'

import close from '../../assets/icons/Close.svg'

/*
 * Detalhe de um ciclo — por enquanto só a moldura e o X.
 *
 * A tela de verdade vem no passo seguinte; esta existe para a linha do
 * Histórico ter para onde levar. Fechar volta para o Histórico da pesquisa,
 * não para a lista, que é de onde a pessoa veio.
 */
export default function TelaCiclo() {
  const { id, cicloId } = useParams()
  const navigate = useNavigate()
  const [pesquisas, setPesquisas] = useState(null)

  useEffect(() => setPesquisas(ler()), [])

  const pesquisa = pesquisas?.find((p) => p.id === id)

  useEffect(() => {
    if (pesquisas && !pesquisa) navigate('/', { replace: true })
  }, [pesquisas, pesquisa, navigate])

  if (!pesquisa) return null

  return (
    <div className={s.tela}>
      <header className={s.cabecalho}>
        <p className={s.titulo}>
          {pesquisa.nome} — Ciclo {cicloId}
        </p>
        <div className={s.acoes}>
          <IconeBotao
            src={close}
            rotulo="Fechar"
            onClick={() => navigate(`/pesquisas/${id}`)}
          />
        </div>
      </header>
      <div className={s.miolo} />
    </div>
  )
}
