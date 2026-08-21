import s from './Configuracao.module.css'
import ModalFluxo from '../../components/fluxo/ModalFluxo.jsx'
import LinhaResumo from '../../components/fluxo/LinhaResumo.jsx'
import Interruptor from '../../components/fluxo/Interruptor.jsx'

import circle from '../../assets/icons/Circle.svg'
import radioButton from '../../assets/icons/RadioButton.svg'
import square from '../../assets/icons/Square.svg'

/*
 * Os seis modais da tela de Configuração. Só o visual: nada marca, salva ou
 * fecha ainda.
 *
 * São duas artes de rádio, como no Figma: Circle para a opção solta e
 * RadioButton para a marcada. Qual fica marcada é fixo por enquanto e segue o
 * que o arquivo desenha — e bate com os valores mostrados na lista da tela.
 */

function Opcao({ texto, marcada = false, rotulo }) {
  return (
    <button
      type="button"
      className={s.opcao}
      role="radio"
      aria-checked={marcada}
      aria-label={rotulo}
    >
      <img
        className={s.icone}
        src={marcada ? radioButton : circle}
        alt=""
        width={24}
        height={24}
      />
      {texto ? <span className={s.textoOpcao}>{texto}</span> : null}
    </button>
  )
}

/* `marcada` é o índice da opção selecionada no Figma. */
function ListaDeOpcoes({ opcoes, marcada }) {
  return (
    <div className={s.opcoes} role="radiogroup">
      {opcoes.map((texto, i) => (
        <Opcao key={texto} texto={texto} marcada={i === marcada} />
      ))}
    </div>
  )
}

function ParDeCampos({ data = '11 Agosto 2026', hora = '10:30' }) {
  return (
    <div className={s.parDeCampos}>
      <input
        className={s.campoData}
        type="text"
        defaultValue={data}
        aria-label="Data"
      />
      <input
        className={s.campoData}
        type="text"
        defaultValue={hora}
        aria-label="Hora"
      />
    </div>
  )
}

export function ModalDataEnvio(props) {
  return (
    <ModalFluxo titulo="Data e Hora de Envio" {...props}>
      <div className={s.blocoEnvio}>
        <ParDeCampos />
        <button type="button" className={s.linhaCheck}>
          <img className={s.icone} src={square} alt="" width={24} height={24} />
          <span className={s.textoCheck}>Enviar imediatamente</span>
        </button>
      </div>
    </ModalFluxo>
  )
}

export function ModalRecorrencia(props) {
  return (
    <ModalFluxo titulo="Recorrência" {...props}>
      <ListaDeOpcoes opcoes={['Recorrente', 'Única']} marcada={0} />
    </ModalFluxo>
  )
}

export function ModalFrequencia(props) {
  return (
    <ModalFluxo titulo="Frequência" {...props}>
      <ListaDeOpcoes
        opcoes={[
          'Semanal',
          'Mensal',
          'A cada três meses',
          'A cada seis meses',
          'Anual',
        ]}
        marcada={1}
      />
    </ModalFluxo>
  )
}

export function ModalPrazo(props) {
  return (
    <ModalFluxo titulo="Prazo pra respostas" {...props}>
      <div className={s.opcoes} role="radiogroup">
        <Opcao texto="1 dia" />
        <Opcao texto="1 semana" marcada />
        <Opcao texto="1 mês" />

        <div className={s.divisor}>
          <span className={s.divisorLinha} />
          <p className={s.divisorTexto}>ou</p>
          <span className={s.divisorLinha} />
        </div>

        <div className={s.opcaoComCampos}>
          <Opcao rotulo="Data específica" />
          <ParDeCampos />
        </div>
      </div>
    </ModalFluxo>
  )
}

const MENSAGEM_EXEMPLO =
  'Obrigado por dedicar esses minutos pra compartilhar sua visão. Cada resposta ajuda o time de design a crescer e trabalhar melhor, juntos. Até a próxima pesquisa.'

export function ModalMensagemFinal(props) {
  return (
    <ModalFluxo titulo="Mensagem final" {...props}>
      <textarea
        className={s.mensagem}
        defaultValue={MENSAGEM_EXEMPLO}
        aria-label="Mensagem final"
      />
    </ModalFluxo>
  )
}

export function ModalAvancadas(props) {
  return (
    <ModalFluxo titulo="Configurações avançadas" espacamento={32} {...props}>
      <div className={s.listaAvancada}>
        <LinhaResumo rotulo="Enviar lembrete" valor="Diário" />
        <LinhaResumo
          rotulo="Mostrar barra de progresso"
          controle={<Interruptor ligado rotulo="Mostrar barra de progresso" />}
        />
        <LinhaResumo
          rotulo="Embaralhar perguntas"
          controle={<Interruptor rotulo="Embaralhar perguntas" />}
        />
        <LinhaResumo
          rotulo="Tornar as perguntas obrigatórias por padrão"
          controle={
            <Interruptor ligado rotulo="Tornar as perguntas obrigatórias por padrão" />
          }
        />
      </div>
    </ModalFluxo>
  )
}
