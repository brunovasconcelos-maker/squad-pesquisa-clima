import s from './Prompt.module.css'
import FluxoLayout from '../../components/fluxo/FluxoLayout.jsx'

/*
 * Tela 6 (Figma 8064:4871).
 *
 * No Figma o texto do exemplo aparece preenchido, mas em cinza de placeholder
 * (#798282) — foi lido como placeholder e entra pelo atributo, não como valor.
 */
const EXEMPLO =
  'Medir satisfação, carga de trabalho e clima do time de design, incluindo percepção sobre prazos, colaboração e reconhecimento.'

export default function TelaPrompt() {
  return (
    <FluxoLayout titulo="Feedback time de Design" progresso={6 / 6} centrada>
      <div className={s.conteudo}>
        <p className={s.rotulo}>O que você quer coletar com esse pesquisa?</p>
        <textarea
          className={s.campo}
          placeholder={EXEMPLO}
          aria-label="O que você quer coletar com esse pesquisa?"
        />
      </div>
    </FluxoLayout>
  )
}
