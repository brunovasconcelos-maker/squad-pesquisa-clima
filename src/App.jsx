import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import PesquisaProvider from './pages/nova-pesquisa/estado.jsx'
import TelaNome from './pages/nova-pesquisa/TelaNome.jsx'
import TelaTemplate from './pages/nova-pesquisa/TelaTemplate.jsx'
import TelaPerguntas from './pages/nova-pesquisa/TelaPerguntas.jsx'
import TelaPrompt from './pages/nova-pesquisa/TelaPrompt.jsx'
import TelaCarregando from './pages/nova-pesquisa/TelaCarregando.jsx'
import TelaRevisao from './pages/nova-pesquisa/TelaRevisao.jsx'

/*
 * O provider do fluxo é a rota-mãe: o estado nasce ao entrar em
 * /pesquisas/nova e morre ao sair, sem virar estado global.
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pesquisas/nova" element={<PesquisaProvider />}>
          <Route index element={<TelaNome />} />
          <Route path="template" element={<TelaTemplate />} />
          <Route path="perguntas" element={<TelaPerguntas />} />
          <Route path="prompt" element={<TelaPrompt />} />
          <Route path="carregando" element={<TelaCarregando />} />
          <Route path="revisao" element={<TelaRevisao />} />
          <Route path="revisao-branco" element={<TelaRevisao vazia />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
