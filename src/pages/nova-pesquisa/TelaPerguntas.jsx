import { useNavigate } from 'react-router-dom'
import s from './Perguntas.module.css'
import FluxoLayout from '../../components/fluxo/FluxoLayout.jsx'
import { usePesquisa, PERGUNTAS_MIN, PERGUNTAS_MAX } from './estado.jsx'

import minus from '../../assets/icons/Minus.svg'
import plus from '../../assets/icons/Plus.svg'

/*
 * Tela 5 (Figma 8063:4769).
 *
 * Os minutos estimados são fixos em 12, como no Figma — não há regra de
 * cálculo definida, e inventar uma seria chutar.
 *
 * O "Pular" só aparece no caminho em branco. Hoje o branco não passa por
 * aqui (a tela 4 manda direto para o stub), então na prática ele não aparece;
 * a condição fica pronta para quando as telas do branco existirem.
 */
export default function TelaPerguntas() {
  const navigate = useNavigate()
  const { pesquisa, definir } = usePesquisa()

  const ehBranco = pesquisa.template === 'blank'
  const somar = (passo) =>
    definir({
      perguntas: Math.min(
        PERGUNTAS_MAX,
        Math.max(PERGUNTAS_MIN, pesquisa.perguntas + passo),
      ),
    })

  return (
    <FluxoLayout
      titulo="Feedback time de Design"
      progresso={3 / 4}
      centrada
      mostrarPular={ehBranco}
      onFechar={() => navigate('/')}
      onVoltar={() => navigate('../template')}
      onContinuar={() => navigate('../prompt')}
      onPular={() => navigate('../prompt')}
    >
      <div className={s.conteudo}>
        <p className={s.rotulo}>Quantas perguntas serão feitas?</p>

        <div className={s.contador}>
          <button
            type="button"
            className={s.passo}
            aria-label="Menos uma pergunta"
            disabled={pesquisa.perguntas <= PERGUNTAS_MIN}
            onClick={() => somar(-1)}
          >
            <img className={s.icone} src={minus} alt="" width={24} height={24} />
          </button>
          <p className={s.numero}>{pesquisa.perguntas}</p>
          <button
            type="button"
            className={s.passo}
            aria-label="Mais uma pergunta"
            disabled={pesquisa.perguntas >= PERGUNTAS_MAX}
            onClick={() => somar(1)}
          >
            <img className={s.icone} src={plus} alt="" width={24} height={24} />
          </button>
        </div>

        <div className={s.estimativa}>
          <p className={s.estimativaTexto}>Em média</p>
          <p className={s.estimativaValor}>12 minutos</p>
          <p className={s.estimativaTexto}>para responder</p>
        </div>
      </div>
    </FluxoLayout>
  )
}
