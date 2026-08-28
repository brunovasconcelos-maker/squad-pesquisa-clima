import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import PesquisaProvider from './pages/nova-pesquisa/estado.jsx'
import TelaNome from './pages/nova-pesquisa/TelaNome.jsx'
import TelaTemplate from './pages/nova-pesquisa/TelaTemplate.jsx'
import TelaPerguntas from './pages/nova-pesquisa/TelaPerguntas.jsx'
import TelaPrompt from './pages/nova-pesquisa/TelaPrompt.jsx'
import TelaCarregando from './pages/nova-pesquisa/TelaCarregando.jsx'
import TelaRevisao from './pages/nova-pesquisa/TelaRevisao.jsx'
import TelaConfiguracao from './pages/nova-pesquisa/TelaConfiguracao.jsx'
import TelaDetalhe from './pages/detalhe/TelaDetalhe.jsx'
import TelaCiclo from './pages/detalhe/TelaCiclo.jsx'
import TelaAbertura from './pages/responder/TelaAbertura.jsx'
import TelaPerguntaResposta from './pages/responder/TelaPergunta.jsx'
import TelaFim from './pages/responder/TelaFim.jsx'

/*
 * O provider do fluxo é a rota-mãe: o estado nasce ao entrar em
 * /pesquisas/nova e morre ao sair, sem virar estado global.
 *
 * /responder é a vista de quem responde e não compartilha moldura nenhuma
 * com o app interno: quem abre o link não administra a pesquisa.
 */
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pesquisas/:id" element={<TelaDetalhe />} />
        <Route path="/pesquisas/:id/ciclos/:cicloId" element={<TelaCiclo />} />
        <Route path="/pesquisas/nova" element={<PesquisaProvider />}>
          <Route index element={<TelaNome />} />
          <Route path="template" element={<TelaTemplate />} />
          <Route path="perguntas" element={<TelaPerguntas />} />
          <Route path="prompt" element={<TelaPrompt />} />
          <Route path="carregando" element={<TelaCarregando />} />
          <Route path="revisao" element={<TelaRevisao />} />
          <Route path="configuracao" element={<TelaConfiguracao />} />
        </Route>

        {/* Vista de quem responde: fora do app interno, sem sidebar nem abas.
            Cada tela é uma rota porque é assim que dá para ver as três antes
            de a navegação entre perguntas existir. */}
        <Route path="/responder/:id" element={<TelaAbertura />} />
        <Route
          path="/responder/:id/pergunta/:numero"
          element={<TelaPerguntaResposta />}
        />
        <Route path="/responder/:id/fim" element={<TelaFim />} />
      </Routes>
    </BrowserRouter>
  )
}
