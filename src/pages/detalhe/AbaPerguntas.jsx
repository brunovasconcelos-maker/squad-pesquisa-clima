import { useState } from 'react'
import ListaDePerguntas from '../../components/perguntas/ListaDePerguntas.jsx'
import ModalConfirmar from '../../components/fluxo/ModalConfirmar.jsx'
import EditorPergunta from '../nova-pesquisa/EditorPergunta.jsx'
import EditorAbertura from '../nova-pesquisa/EditorAbertura.jsx'
import { pausar } from '../../lib/pesquisas.js'
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
 * Editar deveria virar registro no Histórico. Essa aba ainda não existe, e a
 * gravação dela vem junto — não há nada de meio caminho aqui.
 */
export default function AbaPerguntas({ pesquisa, onAlterar }) {
  const [emEdicao, setEmEdicao] = useState(false)
  const [aberturaAberta, setAberturaAberta] = useState(false)
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
      return {
        ...p,
        perguntas: existe
          ? p.perguntas.map((q) => (q.id === pergunta.id ? pergunta : q))
          : [...p.perguntas, pergunta],
      }
    })

  return (
    <div className={s.coluna}>
      <ListaDePerguntas
        nome={pesquisa.nome}
        abertura={pesquisa.abertura}
        perguntas={pesquisa.perguntas || []}
        onEditarAbertura={seDerParaMexer(() => setAberturaAberta(true))}
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
          texto="A pesquisa está rodando e já foi enviada. Mudar as perguntas agora deixaria as respostas de antes e as de depois sem comparação, então é preciso pausar antes de editar."
          rotuloConfirmar="Pausar pesquisa"
          onConfirmar={() => {
            onAlterar((p) => pausar(p))
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
            onAlterar((p) => ({
              ...p,
              perguntas: p.perguntas.filter((q) => q.id !== aRemover.id),
            }))
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
          onFechar={() => setAberturaAberta(false)}
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
