import { useNavigate } from 'react-router-dom'
import s from './Perguntas.module.css'
import FluxoLayout from '../../components/fluxo/FluxoLayout.jsx'
import {
  usePesquisa,
  minutosEstimados,
  PERGUNTAS_MIN,
  PERGUNTAS_MAX,
} from './estado.jsx'

import minus from '../../assets/icons/Minus.svg'
import plus from '../../assets/icons/Plus.svg'

/*
 * Tela 5 (Figma 8063:4769).
 *
 * Os minutos estimados acompanham o contador: 45 segundos por pergunta.
 *
 * Só o caminho com template passa por aqui — o branco vai da escolha direto
 * para a revisão.
 */
export default function TelaPerguntas() {
  const navigate = useNavigate()
  const { pesquisa, definir } = usePesquisa()

  const minutos = minutosEstimados(pesquisa.quantidade)
  const somar = (passo) =>
    definir({
      quantidade: Math.min(
        PERGUNTAS_MAX,
        Math.max(PERGUNTAS_MIN, pesquisa.quantidade + passo),
      ),
    })

  return (
    <FluxoLayout
      titulo="Feedback time de Design"
      progresso={3 / 6}
      centrada
      onFechar={() => navigate('/')}
      onVoltar={() => navigate('../template')}
      onContinuar={() => navigate('../prompt')}
    >
      <div className={s.conteudo}>
        <p className={s.rotulo}>Quantas perguntas serão feitas?</p>

        <div className={s.contador}>
          <button
            type="button"
            className={s.passo}
            aria-label="Menos uma pergunta"
            disabled={pesquisa.quantidade <= PERGUNTAS_MIN}
            onClick={() => somar(-1)}
          >
            <img className={s.icone} src={minus} alt="" width={24} height={24} />
          </button>
          <p className={s.numero}>{pesquisa.quantidade}</p>
          <button
            type="button"
            className={s.passo}
            aria-label="Mais uma pergunta"
            disabled={pesquisa.quantidade >= PERGUNTAS_MAX}
            onClick={() => somar(1)}
          >
            <img className={s.icone} src={plus} alt="" width={24} height={24} />
          </button>
        </div>

        <div className={s.estimativa}>
          <p className={s.estimativaTexto}>Em média</p>
          <p className={s.estimativaValor}>
            {minutos} {minutos === 1 ? 'minuto' : 'minutos'}
          </p>
          <p className={s.estimativaTexto}>para responder</p>
        </div>
      </div>
    </FluxoLayout>
  )
}
