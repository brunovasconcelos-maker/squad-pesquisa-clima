import { useCallback, useState } from 'react'
import s from './AbaConfiguracoes.module.css'
import Aviso from '../../components/Aviso.jsx'
import Botao from '../../components/fluxo/Botao.jsx'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import Interruptor from '../../components/fluxo/Interruptor.jsx'
import LinhaResumo from '../../components/fluxo/LinhaResumo.jsx'
import ModalConfirmar from '../../components/fluxo/ModalConfirmar.jsx'
import ModalCapa from '../../components/ModalCapa.jsx'
import ModalParticipantes from '../nova-pesquisa/ModalParticipantes.jsx'
import {
  ModalDataEnvio,
  ModalFrequencia,
  ModalLembrete,
  ModalPrazo,
} from '../nova-pesquisa/ModaisConfiguracao.jsx'
import { rotuloParticipantes } from '../nova-pesquisa/estado.jsx'
import { estiloDaCapa } from '../../lib/capa.js'
import { formatarComDia } from '../../lib/datas.js'
import { proximoEnvioDe } from '../../lib/geral.js'
import {
  aceitandoRespostas,
  encerrarCiclo,
  estaPublicada,
  forcarInicio,
  despublicar,
  linkDaPesquisa,
  publicar,
} from '../../lib/pesquisas.js'
import { acertarPasso } from '../../lib/acertar.js'

import caretRight from '../../assets/icons/CaretRight.svg'
import link from '../../assets/icons/Link.svg'

/*
 * Aba "Configurações" do detalhe (Figma 8072:6532), ligada à pesquisa
 * guardada.
 *
 * Os dois primeiros interruptores não guardam booleanos: eles leem e escrevem
 * o `status`. Publicado é ter ciclo — agendada, rodando ou aguardando —, e
 * aceitar respostas é estar rodando. Guardar isso à parte criaria uma segunda
 * verdade que poderia discordar do selo da home.
 *
 * Por isso os dois pedem confirmação: cada um vira o status da pesquisa. O
 * texto do "Aceitando respostas" ligando é o mesmo do Play da home, porque a
 * ação é a mesma — força o início de um ciclo agora.
 *
 * O resto são campos da configuração, editados pelos mesmos modais do fluxo
 * de criação e gravados no mesmo lugar que ele grava.
 *
 * O Figma escreve "Apresentaçao" sem o til — aqui vai "Apresentação".
 */

/* A linha "Repetir" mostra a frequência com a frase do Figma, mas o valor
   guardado continua sendo o vocabulário do modal de Frequência: são as duas
   pontas da mesma escolha, e traduzir só na exibição evita duas listas. */
const REPETICAO = {
  Semanal: 'Toda semana',
  Mensal: 'Todo mês',
  'A cada três meses': 'A cada três meses',
  'A cada seis meses': 'A cada seis meses',
  Anual: 'Todo ano',
}

function textoDePrazo(prazo) {
  if (!prazo) return '—'
  if (prazo.tipo === 'data') return `${prazo.data}, as ${prazo.hora}`
  if (prazo.tipo === 'dias') return prazo.dias ? `${prazo.dias} dias` : '—'
  return prazo.periodo
}

/* Um cartão da coluna: título, as linhas e o que vier de rodapé (a pílula
   do primeiro cartão). O `items-center` do Figma é o que centra a pílula, e
   é por isso que o título precisa esticar sozinho. */
function Cartao({ titulo, rodape, children }) {
  return (
    <section className={s.cartao}>
      <p className={s.secao}>{titulo}</p>
      <div className={s.linhas}>{children}</div>
      {rodape}
    </section>
  )
}

function LinhaInterruptor({ rotulo, ligado, desabilitado = false, onAlternar }) {
  return (
    <LinhaResumo
      rotulo={rotulo}
      controle={
        <Interruptor
          ligado={ligado}
          desabilitado={desabilitado}
          rotulo={rotulo}
          onAlternar={onAlternar}
        />
      }
    />
  )
}

export default function AbaConfiguracoes({ pesquisa, onAlterar }) {
  const [modal, setModal] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null)
  const [aviso, setAviso] = useState('')
  const limparAviso = useCallback(() => setAviso(''), [])
  const c = pesquisa.configuracao || {}
  const avancadas = c.avancadas || {}
  const publicada = estaPublicada(pesquisa)
  const aceitando = aceitandoRespostas(pesquisa)

  const fechar = () => setModal(null)

  /* Grava um campo da configuração e fecha o modal — o mesmo par que a tela
     de Configuração do fluxo usa. */
  const salvarConfig = (campos) => {
    onAlterar((p) => ({ ...p, configuracao: { ...p.configuracao, ...campos } }))
    fechar()
  }

  const salvarAvancada = (campos) =>
    onAlterar((p) => ({
      ...p,
      configuracao: {
        ...p.configuracao,
        avancadas: { ...p.configuracao?.avancadas, ...campos },
      },
    }))

  const aoPublicar = () => {
    if (publicada) {
      setConfirmacao({
        titulo: 'Tirar do ar?',
        texto: `"${pesquisa.nome}" sai do ar e passa a "Não ativa". O link de resposta deixa de funcionar — quem abrir vê uma página de erro — e ela também para de aceitar respostas.`,
        rotulo: 'Tirar do ar',
        aoConfirmar: () => onAlterar((p) => acertarPasso(despublicar(p))),
      })
      return
    }
    setConfirmacao({
      titulo: 'Publicar de novo?',
      texto: `"${pesquisa.nome}" volta ao ar como "Ativa | Aguardando": o link funciona outra vez, mas ela ainda não recebe respostas. Para voltar a receber, ligue também "Aceitando respostas".`,
      rotulo: 'Publicar',
      aoConfirmar: () => onAlterar((p) => acertarPasso(publicar(p))),
    })
  }

  const aoAceitar = () => {
    if (aceitando) {
      setConfirmacao({
        titulo: 'Encerrar o ciclo?',
        texto: `O ciclo em curso de "${pesquisa.nome}" fecha agora e ela passa a "Ativa | Aguardando". A pesquisa continua no ar, mas para de receber respostas até o próximo ciclo.`,
        rotulo: 'Encerrar ciclo',
        aoConfirmar: () => onAlterar((p) => acertarPasso(encerrarCiclo(p))),
      })
      return
    }
    // Mesmo texto do Play da home: a ação é a mesma.
    setConfirmacao({
      titulo: 'Iniciar agora?',
      texto: `"${pesquisa.nome}" começa imediatamente e passa a receber respostas, ignorando a data de envio agendada. Um novo ciclo é iniciado a partir de agora.`,
      rotulo: 'Iniciar',
      aoConfirmar: () => onAlterar((p) => acertarPasso(forcarInicio(p))),
    })
  }

  /*
   * Copia o link e abre a vista de quem responde numa aba nova: o botão
   * entrega o link para mandar para alguém e, de quebra, mostra como ela
   * ficou sem perder a tela de configuração. `noopener` porque a aba nova não
   * tem nada que fazer com esta.
   *
   * Abrir vem primeiro, e de propósito: depois de um `await` o clique deixa
   * de contar como gesto do usuário e o navegador barra a aba nova.
   */
  const aoCopiarEAbrir = async () => {
    const endereco = linkDaPesquisa(pesquisa)
    window.open(endereco, '_blank', 'noopener')
    try {
      await navigator.clipboard.writeText(endereco)
      setAviso('Link copiado')
    } catch {
      // Sem permissão de área de transferência (contexto inseguro, por ex.).
      setAviso('Não foi possível copiar o link')
    }
  }

  /* "Imediatamente" só faz sentido enquanto não há ciclo: com um em curso, o
     que importa é quando sai o próximo. */
  const textoDoEnvio =
    !publicada && c.envio?.imediato
      ? 'Imediatamente'
      : formatarComDia(proximoEnvioDe(pesquisa))

  return (
    <div className={s.coluna}>
      <Cartao
        titulo="Opções publicadas"
        rodape={
          <Botao variante="contorno" onClick={aoCopiarEAbrir}>
            Copiar link da pesquisa
            <img className={s.iconeDoLink} src={link} alt="" width={24} height={24} />
          </Botao>
        }
      >
        <LinhaInterruptor
          rotulo="Publicar formulário"
          ligado={publicada}
          onAlternar={aoPublicar}
        />
        {/* Fora do ar, aceitar respostas não quer dizer nada: o interruptor
            fica desligado e apagado até o formulário voltar. */}
        <LinhaInterruptor
          rotulo="Aceitando respostas"
          ligado={aceitando}
          desabilitado={!publicada}
          onAlternar={aoAceitar}
        />
        <LinhaInterruptor
          rotulo="Respostas anônimas"
          ligado={Boolean(c.respostasAnonimas)}
          onAlternar={() =>
            onAlterar((p) => ({
              ...p,
              configuracao: {
                ...p.configuracao,
                respostasAnonimas: !p.configuracao?.respostasAnonimas,
              },
            }))
          }
        />
        <LinhaResumo
          rotulo="Participantes"
          valor={rotuloParticipantes(pesquisa.participantes || {})}
          onAbrir={() => setModal('participantes')}
        />
      </Cartao>

      <Cartao titulo="Datas">
        <LinhaResumo
          rotulo="Próximo envio"
          valor={textoDoEnvio}
          onAbrir={() => setModal('envio')}
        />
        <LinhaResumo
          rotulo="Repetir"
          valor={
            c.recorrencia === 'Recorrente'
              ? (REPETICAO[c.frequencia] ?? c.frequencia)
              : 'Não repete'
          }
          onAbrir={() => setModal('frequencia')}
        />
        <LinhaResumo
          rotulo="Aceitar resposta"
          valor={textoDePrazo(c.prazo)}
          onAbrir={() => setModal('prazo')}
        />
        <LinhaResumo
          rotulo="Enviar lembrete"
          valor={avancadas.lembrete || '—'}
          onAbrir={() => setModal('lembrete')}
        />
      </Cartao>

      <Cartao titulo="Apresentação">
        {/* A capa não cabe em `valor`: no lugar do texto vai a amostra, e a
            seta continua sendo a do LinhaResumo. */}
        <LinhaResumo
          rotulo="Capa"
          controle={
            <div className={s.controleDaCapa}>
              {/* A amostra abre o mesmo modal que a seta: é o alvo mais
                  óbvio da linha, e clicar nela sem efeito frustrava. */}
              <button
                type="button"
                className={s.amostra}
                style={estiloDaCapa(pesquisa.capa)}
                aria-label="Editar capa"
                onClick={() => setModal('capa')}
              />
              <IconeBotao
                src={caretRight}
                rotulo="Abrir Capa"
                onClick={() => setModal('capa')}
              />
            </div>
          }
        />
        <LinhaInterruptor
          rotulo="Mostrar barra de progresso"
          ligado={Boolean(avancadas.barraProgresso)}
          onAlternar={() =>
            salvarAvancada({ barraProgresso: !avancadas.barraProgresso })
          }
        />
        <LinhaInterruptor
          rotulo="Embaralhar perguntas"
          ligado={Boolean(avancadas.embaralhar)}
          onAlternar={() => salvarAvancada({ embaralhar: !avancadas.embaralhar })}
        />
        <LinhaInterruptor
          rotulo="Tornar as perguntas obrigatórias por padrão"
          ligado={Boolean(avancadas.obrigatorias)}
          onAlternar={() =>
            salvarAvancada({ obrigatorias: !avancadas.obrigatorias })
          }
        />
      </Cartao>

      {modal === 'participantes' ? (
        <ModalParticipantes
          selecao={pesquisa.participantes}
          /* Trocar o público troca o denominador de tudo: a taxa do ciclo em
             curso e a de cada ciclo do histórico contam sobre ele. Por isso
             acerta o passo na mesma gravação, como as viradas de status —
             senão o Histórico ficaria até 30s contando sobre o público
             velho. */
          onSalvar={(participantes) => {
            onAlterar((p) => acertarPasso({ ...p, participantes }))
            fechar()
          }}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'envio' ? (
        <ModalDataEnvio
          valor={c.envio}
          onSalvar={(envio) => salvarConfig({ envio })}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'frequencia' ? (
        <ModalFrequencia
          valor={c.frequencia}
          /* Escolher de quanto em quanto tempo repete é dizer que repete:
             uma Única vira recorrente aqui, senão a linha voltaria a mostrar
             "Não repete" logo depois de escolher "Todo mês". */
          onSalvar={(frequencia) =>
            salvarConfig({ frequencia, recorrencia: 'Recorrente' })
          }
          onFechar={fechar}
        />
      ) : null}

      {modal === 'prazo' ? (
        <ModalPrazo
          valor={c.prazo}
          onSalvar={(prazo) => salvarConfig({ prazo })}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'lembrete' ? (
        <ModalLembrete
          valor={avancadas.lembrete}
          onSalvar={(lembrete) => {
            salvarAvancada({ lembrete })
            fechar()
          }}
          onFechar={fechar}
        />
      ) : null}

      {modal === 'capa' ? (
        <ModalCapa
          valor={pesquisa.capa}
          onSalvar={(capa) => {
            onAlterar((p) => ({ ...p, capa }))
            fechar()
          }}
          onFechar={fechar}
        />
      ) : null}

      <Aviso texto={aviso} onSumir={limparAviso} />

      {confirmacao ? (
        <ModalConfirmar
          titulo={confirmacao.titulo}
          texto={confirmacao.texto}
          rotuloConfirmar={confirmacao.rotulo}
          onConfirmar={() => {
            confirmacao.aoConfirmar()
            setConfirmacao(null)
          }}
          onCancelar={() => setConfirmacao(null)}
        />
      ) : null}
    </div>
  )
}
