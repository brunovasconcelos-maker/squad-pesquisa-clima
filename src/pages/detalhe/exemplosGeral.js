/*
 * Conteúdo de exemplo da aba Geral, fixo. Nada aqui é calculado nem sai da
 * pesquisa de verdade — é só o suficiente para ver as três combinações de
 * status renderizadas. A ligação com os dados vem depois.
 *
 * As três variações cobrem: recorrente rodando com a taxa abaixo do ciclo
 * anterior, recorrente aguardando com a taxa acima, e única encerrada, que
 * não tem ciclo anterior para comparar.
 */
export const EXEMPLOS = [
  {
    nome: 'Clima Geral da empresa',
    status: { texto: 'Ativa | Rodando', tom: 'positivo' },
    campos: [
      { rotulo: 'Data de Envio', valor: '18 Ago 2026' },
      { rotulo: 'Encerra em', valor: '25 Ago 2026' },
      { rotulo: 'Tipo', valor: 'Recorrente' },
      { rotulo: 'Ciclos', valor: '2' },
    ],
    atual: {
      titulo: 'Taxa de resposta até agora',
      taxa: 63,
      principal: '35 de 56 responderam até agora',
      apoio: 'Faltam 5 dias',
    },
    anterior: {
      titulo: 'Taxa de resposta anterior',
      periodo: 'Jul 26',
      taxa: 95,
      principal: '52 de 56 responderam essa pesquisa.',
      apoio: 'Encerrada em 25 Jul 2026',
    },
    resumo:
      'Até agora, 35 das 56 pessoas já responderam, com 5 dias restantes pra encerrar. Comparado ao mesmo ponto do ciclo anterior, a participação está um pouco mais lenta, mas as respostas já recebidas mostram uma leitura parecida com a de julho, satisfação estável e boa avaliação da colaboração entre os times. Já é possível notar um leve aumento nas menções à carga de trabalho, vale acompanhar se isso se confirma conforme mais respostas chegam.',
    tempoMedio: { valor: '9', unidade: 'minutos' },
    desistencia: { valor: '1', unidade: 'pessoa desistiu' },
    piorAvaliacao: { valor: '2,5', pergunta: 'Kit de boas vindas' },
  },
  {
    nome: 'Clima Geral da empresa',
    status: { texto: 'Ativa | Aguardando', tom: 'acao' },
    campos: [
      { rotulo: 'Último envio', valor: '18 Ago 2026' },
      { rotulo: 'Próximo envio', valor: '18 Set 2026' },
      { rotulo: 'Tipo', valor: 'Recorrente' },
      { rotulo: 'Ciclos', valor: '3' },
    ],
    atual: {
      titulo: 'Taxa de resposta atual',
      taxa: 98,
      principal: '55 de 56 responderam essa pesquisa.',
      apoio: 'Encerrada em 25 Ago 2026',
    },
    anterior: {
      titulo: 'Taxa de resposta anterior',
      periodo: 'Jul 26',
      taxa: 95,
      principal: '52 de 56 responderam essa pesquisa.',
      apoio: 'Encerrada em 25 Jul 2026',
    },
    resumo:
      'O ciclo de agosto encerrou com 55 das 56 pessoas respondendo, a maior participação desde o começo da pesquisa e acima dos 95% de julho. A leitura geral segue estável: colaboração entre times continua sendo o ponto mais bem avaliado, e a carga de trabalho, que vinha aparecendo de leve no ciclo anterior, se confirmou como o tema mais citado nos comentários abertos.',
    tempoMedio: { valor: '7', unidade: 'minutos' },
    desistencia: { valor: '0', unidade: 'pessoa desistiu' },
    piorAvaliacao: { valor: '3,1', pergunta: 'Carga de trabalho' },
  },
  {
    nome: 'Pesquisa de Desligamento',
    status: { texto: 'Encerrada', tom: 'padrao' },
    campos: [
      { rotulo: 'Último envio', valor: '04 Ago 2026' },
      { rotulo: 'Encerrada em', valor: '11 Ago 2026' },
      { rotulo: 'Tipo', valor: 'Única' },
      { rotulo: 'Ciclos', valor: '1' },
    ],
    atual: {
      titulo: 'Taxa de resposta',
      taxa: 100,
      principal: '12 de 12 responderam essa pesquisa.',
      apoio: 'Encerrada em 11 Ago 2026',
    },
    // Única não tem ciclo anterior, então o segundo cartão não existe.
    anterior: null,
    resumo:
      'Todas as 12 pessoas responderam. As saídas se concentram em falta de perspectiva de crescimento e, em menor grau, em desalinhamento com a liderança direta. O processo de entrada foi o ponto mais mal avaliado, o que se repete desde o começo do ano e vale olhar junto com a pesquisa de clima.',
    tempoMedio: { valor: '14', unidade: 'minutos' },
    desistencia: { valor: '0', unidade: 'pessoa desistiu' },
    piorAvaliacao: { valor: '2,1', pergunta: 'Kit de boas vindas' },
  },
]
