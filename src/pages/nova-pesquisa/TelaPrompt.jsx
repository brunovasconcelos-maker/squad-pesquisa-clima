import { useNavigate } from 'react-router-dom'
import s from './Prompt.module.css'
import FluxoLayout from '../../components/fluxo/FluxoLayout.jsx'
import { usePesquisa } from './estado.jsx'

/*
 * Tela 6 (Figma 8064:4871).
 *
 * O texto já vem montado no estado desde a escolha do template, então aqui a
 * textarea só lê e escreve — sem efeito de preenchimento no mount, que
 * atropelaria o que o usuário digitou ao ir e voltar.
 *
 * No caminho em branco o campo começa vazio e o Continuar só libera quando
 * houver texto; com template escolhido ele fica sempre liberado.
 */
const EXEMPLO =
  'Medir satisfação, carga de trabalho e clima do time de design, incluindo percepção sobre prazos, colaboração e reconhecimento.'

export default function TelaPrompt() {
  const navigate = useNavigate()
  const { pesquisa, definir } = usePesquisa()

  const ehBranco = pesquisa.template === 'blank'
  const continuarDesabilitado = ehBranco && pesquisa.prompt.trim() === ''

  return (
    <FluxoLayout
      titulo="Feedback time de Design"
      progresso={4 / 4}
      centrada
      mostrarPular={ehBranco}
      continuarDesabilitado={continuarDesabilitado}
      onFechar={() => navigate('/')}
      onVoltar={() => navigate('../perguntas')}
      onContinuar={() => navigate('../carregando')}
      onPular={() => navigate('../carregando')}
    >
      <div className={s.conteudo}>
        <p className={s.rotulo}>O que você quer coletar com esse pesquisa?</p>
        <textarea
          className={s.campo}
          placeholder={EXEMPLO}
          value={pesquisa.prompt}
          onChange={(e) => definir({ prompt: e.target.value })}
          aria-label="O que você quer coletar com esse pesquisa?"
        />
      </div>
    </FluxoLayout>
  )
}
