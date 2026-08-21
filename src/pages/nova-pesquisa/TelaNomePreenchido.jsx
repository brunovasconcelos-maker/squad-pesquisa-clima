import FluxoLayout from '../../components/fluxo/FluxoLayout.jsx'
import BlocoNome from './BlocoNome.jsx'

export default function TelaNomePreenchido() {
  return (
    <FluxoLayout titulo="Nova Pesquisa" progresso={3 / 6}>
      <BlocoNome nome="Feedback time de Design" participantes="Design" />
    </FluxoLayout>
  )
}
