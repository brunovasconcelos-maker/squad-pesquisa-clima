import { useState } from 'react'
import ListaDePerguntas from '../../components/perguntas/ListaDePerguntas.jsx'
import ModalConfirmar from '../../components/fluxo/ModalConfirmar.jsx'
import EditorPergunta from '../nova-pesquisa/EditorPergunta.jsx'
import EditorAbertura from '../nova-pesquisa/EditorAbertura.jsx'
import { encerrarCiclo } from '../../lib/pesquisas.js'
import { acertarPasso } from '../../lib/acertar.js'
import { registrar } from '../../lib/alteracoes.js'
import s from './AbaPerguntas.module.css'

/*
 * Aba Perguntas do detalhe.
 *
 * É a mesma lista da revisão do fluxo — ListaDePerguntas, os mesmos editores
 * por tipo —, só que sobre a pesquisa guardada em vez do rascunho em memória.
 *
 * Enquanto a pesquisa está rodando, as perguntas já saíram para as pessoas:
 * mudar o questionário no meio faria as respostas de antes e as de depois
 * deixarem de ser comparáveis. Os botões continuam acesos, porque desabilitar
 * sem explicar não diz o que fazer; quem clica recebe a saída, que é pausar.
 *
 * Toda mudança aqui é anotada no registro de alterações, que é o que a coluna
 * Atividade do Histórico conta. A anotação vai junto com a mudança, na mesma
 * gravação: se fossem duas, um F5 no meio deixaria uma sem a outra.
 */
export default function AbaPerguntas({ pesquisa, onAlterar }) {
  const [emEdicao, setEmEdicao] = useState(false)
  /* Guarda como a abertura estava ao abrir o editor. Ele escreve a cada
     tecla, então a anotação sai uma vez só, no fim, e só se algo mudou de
     verdade — cancelar devolve o original e nada é anotado. */
  const [aberturaAberta, setAberturaAberta] = useState(null)
  const [aRemover, setARemover] = useState(null)
  const [pedindoPausa, setPedindoPausa] = useState(false)

  const rodando = pesquisa.status === 'rodando'

  /* Um só portão para as três ações: rodando, o clique vira o pedido de
     pausa; fora disso, segue para o editor. */
  const seDerParaMexer = (acao) => () => {
    if (rodando) {
      setPedindoPausa(true)
      return
    }
    acao()
  }

  const salvarPergunta = (pergunta) =>
    onAlterar((p) => {
      const existe = p.perguntas.some((q) => q.id === pergunta.id)
      const comPergunta = {
        ...p,
        perguntas: existe
          ? p.perguntas.map((q) => (q.id === pergunta.id ? pergunta : q))
          : [...p.perguntas, pergunta],
      }
      return registrar(
        comPergunta,
        existe ? 'editou' : 'adicionou',
        pergunta.enunciado,
      )
    })

  return (
    <div className={s.coluna}>
      <ListaDePerguntas
        nome={pesquisa.nome}
        abertura={pesquisa.abertura}
        perguntas={pesquisa.perguntas || []}
        onEditarAbertura={seDerParaMexer(() =>
          setAberturaAberta({ nome: pesquisa.nome, abertura: pesquisa.abertura }),
        )}
        onEditarPergunta={(pergunta) =>
          seDerParaMexer(() => setEmEdicao(pergunta))()
        }
        onRemoverPergunta={(pergunta) =>
          seDerParaMexer(() => setARemover(pergunta))()
        }
        onAdicionar={seDerParaMexer(() => setEmEdicao(null))}
      />

      {pedindoPausa ? (
        <ModalConfirmar
          titulo="Pausar para editar?"
          texto={'A pesquisa está rodando e já foi enviada. Mudar as perguntas agora deixaria as respostas de antes e as de depois sem comparação, então é preciso pausar antes de editar. Ela continua no ar, em "Ativa | Aguardando", e o ciclo em curso fecha agora.'}
          rotuloConfirmar="Pausar pesquisa"
          onConfirmar={() => {
            /* Acerta o passo junto: pausar fecha o ciclo, e ir direto no
               Histórico tem de mostrar a linha dele. */
            onAlterar((p) => acertarPasso(encerrarCiclo(p)))
            setPedindoPausa(false)
          }}
          onCancelar={() => setPedindoPausa(false)}
        />
      ) : null}

      {aRemover ? (
        <ModalConfirmar
          titulo="Deletar pergunta?"
          texto={`"${aRemover.enunciado}" sai da pesquisa. Não dá para desfazer.`}
          rotuloConfirmar="Deletar"
          onConfirmar={() => {
            onAlterar((p) =>
              registrar(
                {
                  ...p,
                  perguntas: p.perguntas.filter((q) => q.id !== aRemover.id),
                },
                'removeu',
                aRemover.enunciado,
              ),
            )
            setARemover(null)
          }}
          onCancelar={() => setARemover(null)}
        />
      ) : null}

      {aberturaAberta ? (
        <EditorAbertura
          nome={pesquisa.nome}
          abertura={pesquisa.abertura}
          definir={(campos) => onAlterar((p) => ({ ...p, ...campos }))}
          onFechar={() => {
            onAlterar((p) =>
              p.nome === aberturaAberta.nome &&
              p.abertura === aberturaAberta.abertura
                ? p
                : registrar(p, 'editou', 'Abertura'),
            )
            setAberturaAberta(null)
          }}
        />
      ) : null}

      {emEdicao !== false ? (
        <EditorPergunta
          pergunta={emEdicao}
          onSalvar={(pergunta) => {
            salvarPergunta(pergunta)
            setEmEdicao(false)
          }}
          onFechar={() => setEmEdicao(false)}
        />
      ) : null}
    </div>
  )
}
