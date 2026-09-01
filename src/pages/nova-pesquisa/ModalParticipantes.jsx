import { useState } from 'react'
import s from './Participantes.module.css'
import Botao from '../../components/fluxo/Botao.jsx'
import IconeBotao from '../../components/fluxo/IconeBotao.jsx'
import { GRUPOS, PESSOAS, nomeDaPessoa } from './estado.jsx'

import checkSquare from '../../assets/icons/CheckSquare.svg'
import square from '../../assets/icons/Square.svg'
import caretDown from '../../assets/icons/CaretDown.svg'
import search from '../../assets/icons/Search.svg'
import close from '../../assets/icons/Close.svg'

/*
 * Tela 2 (Figma 8057:3674): modal de participantes.
 *
 * A seleção é editada numa cópia local e só sobe no "Salvar" — é o que faz o
 * "Voltar" descartar as marcações sem precisar desfazer nada.
 *
 * "Toda empresa" e os grupos se excluem: marcar um grupo desmarca a empresa
 * inteira, e marcar a empresa limpa os grupos. São duas formas de dizer a
 * mesma coisa — quem é o público —, e as duas ligadas ao mesmo tempo não
 * querem dizer nada além do que "Toda empresa" já diz.
 *
 * A lista de grupos começa fechada: quem escolhe a empresa inteira não
 * precisa ver os grupos, e quem quer um grupo abre.
 *
 * A busca procura no diretório de pessoas pelo nome e pelo e-mail inteiro —
 * quem tem o endereço na mão cola o endereço —, e o resultado entra na lista
 * como mais um item marcável, com o mesmo desenho dos grupos. Marcar uma
 * pessoa também desmarca "Toda empresa".
 */
/* Sem acento e sem caixa: quem digita "kaue" tem de achar "kauê". */
const normalizar = (t) =>
  (t || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

/* O que a busca compara: o nome que aparece na lista mais o e-mail cru, para
   que tanto "Gustavo Lima" quanto "gustavo.lima@inner.ai" achem a mesma
   pessoa. */
const procuravel = (email) => normalizar(`${nomeDaPessoa(email)} ${email}`)

export default function ModalParticipantes({ selecao, onSalvar, onFechar }) {
  const [rascunho, setRascunho] = useState({ pessoas: [], ...selecao })
  const [busca, setBusca] = useState('')
  /* Aberta quando já há grupo escolhido: fechar a lista escondendo uma
     escolha que existe seria pior do que abri-la sem precisar. */
  const [gruposAbertos, setGruposAbertos] = useState(
    () => (selecao?.grupos?.length ?? 0) > 0,
  )

  const alternarEmpresa = () =>
    setRascunho((r) =>
      r.todaEmpresa
        ? { ...r, todaEmpresa: false }
        : { ...r, todaEmpresa: true, grupos: [], pessoas: [] },
    )

  const alternarGrupo = (grupo) =>
    setRascunho((r) => ({
      ...r,
      // Escolher um grupo é dizer que não é a empresa inteira.
      todaEmpresa: false,
      grupos: r.grupos.includes(grupo)
        ? r.grupos.filter((g) => g !== grupo)
        : [...r.grupos, grupo],
    }))

  /* Mesma regra dos grupos: escolher uma pessoa é dizer que não é a empresa
     inteira. */
  const alternarPessoa = (email) =>
    setRascunho((r) => {
      const atuais = r.pessoas || []
      return {
        ...r,
        todaEmpresa: false,
        pessoas: atuais.includes(email)
          ? atuais.filter((e) => e !== email)
          : [...atuais, email],
      }
    })

  const procurado = normalizar(busca)
  const achadas = procurado
    ? PESSOAS.filter((e) => procuravel(e).includes(procurado))
    : []
  /* Quem já foi marcado fica na lista mesmo depois de a busca esvaziar: a
     escolha não pode sumir de vista só porque o campo foi limpo. */
  const escolhidas = (rascunho.pessoas || []).filter((e) => !achadas.includes(e))

  const Item = ({ nome, apoio = '56 membros', marcado, onAlternar }) => (
    <button type="button" className={s.item} onClick={onAlternar}>
      <img
        className={s.caixa}
        src={marcado ? checkSquare : square}
        alt=""
        width={24}
        height={24}
      />
      <span className={s.itemNome}>{nome}</span>
      <span className={s.itemContagem}>{apoio}</span>
    </button>
  )

  return (
    <div className={s.scrim}>
      <div className={s.modal} role="dialog" aria-label="Participantes">
        <div className={s.cabecalho}>
          <p className={s.titulo}>Participantes</p>
          <IconeBotao src={close} rotulo="Fechar" onClick={onFechar} />
        </div>

        <div className={s.corpo}>
          <div className={s.grupos}>
            <Item
              nome="Toda empresa"
              marcado={rascunho.todaEmpresa}
              onAlternar={alternarEmpresa}
            />

            <button
              type="button"
              className={s.linhaGrupos}
              aria-expanded={gruposAbertos}
              onClick={() => setGruposAbertos((aberta) => !aberta)}
            >
              <span className={s.rotuloGrupos}>Grupos:</span>
              <img
                className={`${s.caixa} ${gruposAbertos ? s.setaAberta : ''}`}
                src={caretDown}
                alt=""
                width={24}
                height={24}
              />
            </button>

            {gruposAbertos ? (
              <div className={s.sublista}>
                {GRUPOS.map((grupo) => (
                  <Item
                    key={grupo}
                    nome={grupo}
                    marcado={rascunho.grupos.includes(grupo)}
                    onAlternar={() => alternarGrupo(grupo)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className={s.divisor}>
            <span className={s.divisorLinha} />
            <p className={s.divisorTexto}>ou</p>
            <span className={s.divisorLinha} />
          </div>

          <div className={s.busca}>
            <img
              className={s.buscaIcone}
              src={search}
              alt=""
              width={24}
              height={24}
            />
            <input
              className={s.buscaCampo}
              type="text"
              value={busca}
              placeholder="Pesquisar um membro ou grupo"
              aria-label="Pesquisar um membro ou grupo"
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {procurado || escolhidas.length ? (
            <div className={s.resultados}>
              {achadas.map((email) => (
                <Item
                  key={email}
                  nome={nomeDaPessoa(email)}
                  apoio={email}
                  marcado={(rascunho.pessoas || []).includes(email)}
                  onAlternar={() => alternarPessoa(email)}
                />
              ))}
              {escolhidas.map((email) => (
                <Item
                  key={email}
                  nome={nomeDaPessoa(email)}
                  apoio={email}
                  marcado
                  onAlternar={() => alternarPessoa(email)}
                />
              ))}
              {procurado && achadas.length === 0 ? (
                <p className={s.semResultado}>
                  Ninguém com &quot;{busca.trim()}&quot; no nome ou no e-mail.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={s.rodape}>
          <Botao onClick={onFechar}>Voltar</Botao>
          <Botao variante="marca" onClick={() => onSalvar(rascunho)}>
            Salvar
          </Botao>
        </div>
      </div>
    </div>
  )
}
