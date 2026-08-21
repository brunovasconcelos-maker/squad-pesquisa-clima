import { useNavigate, useParams } from 'react-router-dom'
import s from './Configuracao.module.css'
import CabecalhoFluxo from '../../components/fluxo/CabecalhoFluxo.jsx'
import RodapeFluxo from '../../components/fluxo/RodapeFluxo.jsx'
import Botao from '../../components/fluxo/Botao.jsx'
import LinhaResumo from '../../components/fluxo/LinhaResumo.jsx'
import Interruptor from '../../components/fluxo/Interruptor.jsx'
import ModalParticipantes from './ModalParticipantes.jsx'
import {
  ModalDataEnvio,
  ModalRecorrencia,
  ModalFrequencia,
  ModalPrazo,
  ModalMensagemFinal,
  ModalAvancadas,
} from './ModaisConfiguracao.jsx'

const MENSAGEM_EXEMPLO =
  'Obrigado por dedicar esses minutos pra compartilhar sua visão. Cada resposta ajuda o time de design a crescer e trabalhar melhor, juntos. Até a próxima pesquisa.'

/*
 * Último passo do fluxo (Figma 8067:5498). Só o visual: nada marca, abre ou
 * salva ainda — cada modal tem rota própria para dar para olhar sem clicar.
 *
 * O Figma rotula a seção como "Configurações" e o link como "Ver settings
 * avançadas"; os textos aqui seguem o combinado: "Configuração" e "Ver
 * configurações avançadas". "Frequencia" também ganhou o acento.
 *
 * A linha de Frequência só existe quando a recorrência é "Recorrente" — é o
 * estado que o Figma desenha.
 */
const MODAIS = {
  participantes: ModalParticipantes,
  'data-envio': ModalDataEnvio,
  recorrencia: ModalRecorrencia,
  frequencia: ModalFrequencia,
  prazo: ModalPrazo,
  'mensagem-final': ModalMensagemFinal,
  avancadas: ModalAvancadas,
}

export default function TelaConfiguracao() {
  const navigate = useNavigate()
  const { modal } = useParams()
  const Modal = modal ? MODAIS[modal] : null
  const recorrencia = 'Recorrente'

  return (
    <div className={s.tela}>
      <CabecalhoFluxo titulo="Nova Pesquisa" onFechar={() => navigate('/')} />

      <div className={s.miolo}>
        <div className={s.coluna}>
          <div className={s.lista}>
            <p className={s.secao}>Configuração</p>

            <LinhaResumo rotulo="Participantes" valor="Time de Design" />
            <LinhaResumo
              rotulo="Respostas anônimas"
              controle={<Interruptor ligado rotulo="Respostas anônimas" />}
            />
            <LinhaResumo rotulo="Data de Envio" valor="Sex 14 Ago 2026, as 10h" />
            <LinhaResumo rotulo="Recorrência" valor={recorrencia} />
            {recorrencia === 'Recorrente' ? (
              <LinhaResumo rotulo="Frequência" valor="Mensal" />
            ) : null}
            <LinhaResumo rotulo="Prazo pra respostas" valor="1 semana" />
            <LinhaResumo rotulo="Mensagem final" valor={MENSAGEM_EXEMPLO} cortar />
          </div>

          <Botao>Ver configurações avançadas</Botao>
        </div>
      </div>

      <RodapeFluxo progresso={6 / 6} rotuloContinuar="Salvar Pesquisa" />

      {/* Nada fecha nem salva ainda; os handlers entram no próximo passo. */}
      {modal === 'participantes' ? (
        <ModalParticipantes
          selecao={{ todaEmpresa: false, grupos: ['Design'] }}
          onSalvar={() => {}}
          onFechar={() => {}}
        />
      ) : Modal ? (
        <Modal />
      ) : null}
    </div>
  )
}
