import s from './Rosca.module.css'

/*
 * Rosca da taxa de resposta (Figma 8109:9403).
 *
 * O Figma exporta cada arco como vetor, um por porcentagem. Aqui é um círculo
 * com stroke-dasharray: mesma geometria — raio 50, traço de 16 —, e serve
 * qualquer valor sem precisar de um arquivo novo a cada um.
 *
 * O traço fica centrado no caminho, então transborda 8px de cada lado da
 * caixa de 100px. É o que o Figma desenha: a moldura tem 100 e o render sai
 * com 116. Por isso a caixa não corta.
 */
const RAIO = 50
const TRACO = 16
const VOLTA = 2 * Math.PI * RAIO

/* Escala combinada com o produto: cinza em 0, e depois vermelho, amarelo e
   verde conforme a participação sobe. */
function corDe(taxa) {
  if (taxa <= 0) return 'var(--cor-rosca-trilho)'
  if (taxa < 50) return 'var(--cor-vermelho)'
  if (taxa < 80) return 'var(--cor-rosca-amarelo)'
  return 'var(--cor-verde-ativo)'
}

export default function Rosca({ taxa }) {
  const preenchido = Math.max(0, Math.min(100, taxa))

  return (
    <div className={s.rosca}>
      <svg className={s.desenho} viewBox="0 0 116 116" aria-hidden="true">
        <circle
          className={s.trilho}
          cx="58"
          cy="58"
          r={RAIO}
          strokeWidth={TRACO}
        />
        {preenchido > 0 ? (
          <circle
            className={s.arco}
            cx="58"
            cy="58"
            r={RAIO}
            strokeWidth={TRACO}
            stroke={corDe(preenchido)}
            strokeDasharray={`${(preenchido / 100) * VOLTA} ${VOLTA}`}
            /* Em 100% as duas pontas se encontram e a ponta redonda sobra
               por cima da outra, deixando um calo no topo. O círculo fechado
               não tem ponta à mostra, então ali ela não faz falta. */
            strokeLinecap={preenchido >= 100 ? 'butt' : 'round'}
          />
        ) : null}
      </svg>
      <span className={s.valor}>{preenchido}%</span>
    </div>
  )
}
