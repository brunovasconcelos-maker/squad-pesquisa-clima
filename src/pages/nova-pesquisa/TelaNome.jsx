import FluxoLayout from '../../components/fluxo/FluxoLayout.jsx'
import BlocoNome from './BlocoNome.jsx'

export default function TelaNome() {
  return (
    <FluxoLayout titulo="Nova Pesquisa" progresso={1 / 6}>
      <BlocoNome participantes="Toda a empresa" />
    </FluxoLayout>
  )
}
