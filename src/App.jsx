import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import TelaNome from './pages/nova-pesquisa/TelaNome.jsx'
import TelaParticipantes from './pages/nova-pesquisa/TelaParticipantes.jsx'
import TelaNomePreenchido from './pages/nova-pesquisa/TelaNomePreenchido.jsx'
import TelaTemplate from './pages/nova-pesquisa/TelaTemplate.jsx'
import TelaPerguntas from './pages/nova-pesquisa/TelaPerguntas.jsx'
import TelaPrompt from './pages/nova-pesquisa/TelaPrompt.jsx'

/*
 * As seis telas do fluxo têm rota própria e nenhuma leva à outra: a navegação
 * entra depois. Por enquanto cada uma é um endereço para abrir e olhar.
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pesquisas/nova" element={<TelaNome />} />
        <Route path="/pesquisas/nova/participantes" element={<TelaParticipantes />} />
        <Route path="/pesquisas/nova/preenchido" element={<TelaNomePreenchido />} />
        <Route path="/pesquisas/nova/template" element={<TelaTemplate />} />
        <Route path="/pesquisas/nova/perguntas" element={<TelaPerguntas />} />
        <Route path="/pesquisas/nova/prompt" element={<TelaPrompt />} />
      </Routes>
    </BrowserRouter>
  )
}
