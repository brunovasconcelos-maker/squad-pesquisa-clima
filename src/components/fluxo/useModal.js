import { useEffect, useRef } from 'react'

/*
 * O comportamento de teclado que todo modal do projeto precisa ter.
 *
 * Nenhum deles tinha: o foco continuava no botão que abriu o modal, atrás do
 * scrim; Tab passeava pela página coberta, mexendo em coisas que a pessoa nem
 * vê; e Esc não fechava nada. Quem usa teclado ou leitor de tela ficava sem
 * saber onde estava.
 *
 * Vive num gancho, e não num componente, porque o projeto tem seis moldes de
 * modal diferentes — ModalFluxo, ModalConfirmar, os dois editores, o de
 * participantes, o de sair do fluxo. Todos desenham um scrim com um diálogo
 * dentro; o que muda é o miolo. O gancho recebe a referência do diálogo e
 * cuida do resto.
 *
 * `aoFechar` é o mesmo caminho do X e do Voltar — inclusive nos dois modais
 * que perguntam antes de descartar, onde Esc também passa pela pergunta.
 */

/*
 * A pilha dos modais abertos.
 *
 * Modal em cima de modal existe: o editor de pergunta abre a confirmação de
 * descarte por cima de si mesmo. Sem a pilha, Esc fecharia os dois de uma vez
 * e a armadilha de foco do de baixo brigaria com a do de cima. Só o último
 * registrado responde.
 */
const abertos = []

const FOCAVEIS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const focaveisDe = (caixa) =>
  Array.from(caixa.querySelectorAll(FOCAVEIS)).filter(
    (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
  )

export default function useModal(aoFechar) {
  const caixa = useRef(null)
  /* `aoFechar` costuma ser uma função nova a cada render. Guardada numa ref,
     o efeito não precisa dela nas dependências — e assim não desmonta e
     remonta a armadilha de foco a cada tecla digitada dentro do modal. */
  const fechar = useRef(aoFechar)
  fechar.current = aoFechar

  useEffect(() => {
    const elemento = caixa.current
    if (!elemento) return undefined

    /* Para onde o foco volta quando o modal fechar. */
    const veioDe = document.activeElement

    abertos.push(elemento)

    /* O primeiro campo de verdade, quando há um; senão o próprio diálogo, que
       ganha foco programático sem entrar na ordem de Tab. */
    const primeiro = focaveisDe(elemento)[0]
    if (primeiro) {
      primeiro.focus()
    } else {
      elemento.setAttribute('tabindex', '-1')
      elemento.focus()
    }

    const aoTeclar = (e) => {
      // Só o modal de cima responde.
      if (abertos[abertos.length - 1] !== elemento) return

      if (e.key === 'Escape') {
        e.stopPropagation()
        e.preventDefault()
        fechar.current?.()
        return
      }

      if (e.key !== 'Tab') return

      const lista = focaveisDe(elemento)
      if (!lista.length) {
        e.preventDefault()
        return
      }
      const primeiroDaVez = lista[0]
      const ultimo = lista[lista.length - 1]
      const atual = document.activeElement

      /* Circula em vez de sair: chegando ao fim volta ao começo, e o foco não
         escapa para a página que o scrim cobre. */
      if (!elemento.contains(atual)) {
        e.preventDefault()
        primeiroDaVez.focus()
      } else if (e.shiftKey && atual === primeiroDaVez) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && atual === ultimo) {
        e.preventDefault()
        primeiroDaVez.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar, true)

    return () => {
      document.removeEventListener('keydown', aoTeclar, true)
      const i = abertos.indexOf(elemento)
      if (i >= 0) abertos.splice(i, 1)
      /* Devolve o foco a quem abriu — mas só se ele ainda estiver na página e
         nada mais tiver tomado o foco enquanto o modal fechava. */
      if (veioDe && veioDe.isConnected && typeof veioDe.focus === 'function') {
        veioDe.focus()
      }
    }
  }, [])

  return caixa
}
