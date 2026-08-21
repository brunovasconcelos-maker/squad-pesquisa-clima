/*
 * Seis linhas de exemplo, as mesmas do Figma (8015:432). Some quando a lista
 * passar a ler pesquisas de verdade.
 *
 * `transporte` é qual botão a linha mostra: pausar, iniciar, ou nenhum.
 */
export const PESQUISAS_EXEMPLO = [
  {
    id: 'clima-geral',
    nome: 'Clima Geral da empresa',
    publico: 'Toda empresa',
    tipo: 'Recorrente',
    status: { texto: 'Ativa | Rodando', tom: 'positivo' },
    evento: 'Encerra: 18 Ago',
    taxa: '63%',
    ciclos: '2',
    transporte: 'pausar',
  },
  {
    id: 'pulso-meteoro',
    nome: 'Pulso pós Meteoro',
    publico: 'Toda empresa',
    tipo: 'Única',
    status: { texto: 'Agendada', tom: 'destaque' },
    evento: 'Começa: 1 Set',
    taxa: '—',
    ciclos: '0',
    transporte: 'iniciar',
  },
  {
    id: 'follow-up-design',
    nome: 'Follow-up Design',
    publico: 'Time Design',
    tipo: 'Recorrente',
    status: { texto: 'Ativa | Aguardando', tom: 'acao' },
    evento: 'Próxima: 1 Out',
    taxa: '99%',
    ciclos: '6',
    transporte: 'iniciar',
  },
  {
    id: 'pulso-onboarding',
    nome: 'Pulso pós onboarding',
    publico: '8 pessoas',
    tipo: 'Única',
    status: { texto: 'Encerrada', tom: 'padrao' },
    evento: 'Encerrada: 2 Jul',
    taxa: '100%',
    ciclos: '1',
    transporte: null,
  },
  {
    id: 'clima-suporte',
    nome: 'Clima Time de Suporte',
    publico: 'Time de Suporte',
    tipo: 'Recorrente',
    status: { texto: 'Não ativa', tom: 'negativo' },
    evento: '—',
    taxa: '40%',
    ciclos: '3',
    transporte: 'iniciar',
  },
  {
    id: 'clima-vendas',
    nome: 'Clima do Time de Vendas',
    publico: '—',
    tipo: '—',
    status: { texto: 'Rascunho', tom: 'padrao' },
    evento: '—',
    taxa: '—',
    ciclos: '—',
    transporte: null,
  },
]
