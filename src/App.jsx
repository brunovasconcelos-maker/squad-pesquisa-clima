import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import RespostaProvider from './pages/responder/RespostaProvider.jsx'
import TelaAbertura from './pages/responder/TelaAbertura.jsx'
import TelaPerguntaResposta from './pages/responder/TelaPergunta.jsx'
import TelaFim from './pages/responder/TelaFim.jsx'

/*
 * Rotas por hash, e não por caminho: o GitHub Pages serve arquivos estáticos
 * e não sabe reescrever /squad-pesquisa-clima/responder/x para o index, então
 * abrir uma rota direto — um link de resposta, um F5 no detalhe — dava 404.
 * Depois do # o servidor não olha, e o roteador resolve tudo no navegador.
 *
 * Sem `basename`: o caminho da publicação já vem antes do #, e o que o
 * roteador lê é só o que vem depois.
 *
 * O provider do fluxo é a rota-mãe: o estado nasce ao entrar em
 * /pesquisas/nova e morre ao sair, sem virar estado global.
 *
 * /responder é a vista de quem responde e não compartilha moldura nenhuma
 * com o app interno: quem abre o link não administra a pesquisa.
 */
/*
 * Os seis passos do fluxo, montados uma vez e usados nas duas entradas.
 *
 * A escolha do template é a porta de entrada: ela vem antes do nome, então é
 * ela que ocupa a rota índice. O nome e os participantes ganharam caminho
 * próprio — /nome —, que é onde o fluxo passa a ter algo a perder.
 */
const passosDoFluxo = (
  <>
    <Route index element={<TelaTemplate />} />
    <Route path="nome" element={<TelaNome />} />
    <Route path="perguntas" element={<TelaPerguntas />} />
    <Route path="prompt" element={<TelaPrompt />} />
    <Route path="carregando" element={<TelaCarregando />} />
    <Route path="revisao" element={<TelaRevisao />} />
    <Route path="configuracao" element={<TelaConfiguracao />} />
  </>
)

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pesquisas/:id" element={<TelaDetalhe />} />
        <Route path="/pesquisas/:id/ciclos/:cicloId" element={<TelaCiclo />} />
        <Route path="/pesquisas/nova" element={<PesquisaProvider />}>
          {passosDoFluxo}
        </Route>

        {/* Retomar um rascunho é o mesmo fluxo, só que semeado com o que já
            foi preenchido. Os passos são os mesmos objetos de rota, e a
            navegação entre eles é relativa, então funciona igual sob os dois
            caminhos. */}
        <Route path="/rascunhos/:id" element={<PesquisaProvider />}>
          {passosDoFluxo}
        </Route>

        {/* Vista de quem responde: fora do app interno, sem sidebar nem abas.
            O provider é a rota-mãe, como no fluxo de criação — é ele que
            segura a ordem das perguntas e o que já foi respondido enquanto
            se navega entre elas. */}
        <Route path="/responder/:id" element={<RespostaProvider />}>
          <Route index element={<TelaAbertura />} />
          <Route path="pergunta/:numero" element={<TelaPerguntaResposta />} />
          <Route path="fim" element={<TelaFim />} />
        </Route>

        {/* Qualquer caminho que não seja nenhum dos de cima vai para a home.
            Sem isto o roteador não casava nada e a tela ficava em branco —
            sem cabeçalho, sem conteúdo e sem caminho de volta. É o mesmo que
            já acontece com id de pesquisa ou de ciclo que não existe, e pelo
            mesmo motivo: um endereço que não leva a lugar nenhum leva à
            lista. `replace` para o endereço quebrado não ficar no histórico,
            senão o Voltar do navegador cairia nele de novo. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
