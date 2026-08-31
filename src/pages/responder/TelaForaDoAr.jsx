import VistaResposta from './VistaResposta.jsx'
import s from './Responder.module.css'

import pipo from '../../assets/images/Pipo-Loading.png'

/*
 * O que quem abre o link vê quando a pesquisa não está recebendo respostas.
 *
 * É o que o modal "Tirar do ar?" das Configurações promete: despublicar faz o
 * link parar de funcionar. Encerrada e cheia — 100% do público já respondeu —
 * caem aqui pelo mesmo motivo: não há resposta a dar.
 *
 * Sem referência no Figma — a moldura é a mesma das outras telas de quem
 * responde, com o cartão centrado da tela final e sem botão nenhum, porque
 * não há o que fazer aqui.
 *
 * O texto muda com o motivo. Dizer "não está no ar" para uma pesquisa que
 * simplesmente acabou mandaria a pessoa cobrar quem enviou por um problema
 * que não existe.
 */
const MOTIVOS = {
  encerrada: {
    titulo: 'Essa pesquisa foi encerrada.',
    /* Mesmo tratamento da tela final: o Pipo entra embaixo do cartão. */
    ilustracao: true,
  },
  rascunho: {
    titulo: 'Esta pesquisa ainda não foi publicada',
    texto:
      'Quem cuida dela ainda está preparando o formulário. Tente de novo mais tarde com o mesmo link.',
  },
  padrao: {
    titulo: 'Esta pesquisa não está no ar',
    texto:
      'O formulário foi despublicado, então não dá para responder agora. Se você recebeu este link, vale avisar quem enviou.',
  },
}

export default function TelaForaDoAr({ pesquisa }) {
  /* Cheia é o mesmo fim que encerrada, para quem chega: o ciclo já colheu
     todas as respostas que tinha para colher. */
  const cheia = (pesquisa.taxa ?? 0) >= 100
  const motivo =
    cheia || pesquisa.status === 'encerrada'
      ? MOTIVOS.encerrada
      : (MOTIVOS[pesquisa.status] ?? MOTIVOS.padrao)

  return (
    <VistaResposta pesquisa={pesquisa}>
      <section className={`${s.cartao} ${s.cartaoCentrado}`}>
        <h1 className={s.nome}>{motivo.titulo}</h1>
        {motivo.texto ? <p className={s.paragrafo}>{motivo.texto}</p> : null}
      </section>

      {motivo.ilustracao ? (
        <img
          className={s.ilustracao}
          src={pipo}
          alt="Pipo trabalhando no computador"
          width={580}
          height={324}
        />
      ) : null}
    </VistaResposta>
  )
}
