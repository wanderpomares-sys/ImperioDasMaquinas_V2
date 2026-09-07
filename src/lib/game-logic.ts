// ============================================================================
// GAME LOGIC — extraído de app.html (01-JOGO), sessão de migração para Next.js.
//
// REGRA DE OURO (ver CLAUDE.md): os nomes abaixo (MACHINES, CONTRACTS, playerCash,
// historico, etc.) são EXATAMENTE os mesmos usados no localStorage salvo pelos
// jogadores atuais do app.html. Não renomear, não achatar, não mudar o shape de
// nenhum campo sem migrar save-system.ts junto — foi isso que quebrou o save duas
// vezes no histórico do projeto (sessões 34 e 36 do REGISTRO.pdf).
// ============================================================================

// ---------------------------------------------------------------------------
// TIPOS
// ---------------------------------------------------------------------------

export type MachineStatus = 'green' | 'amber' | 'red';

export interface Machine {
  tipoKey: string;
  idadeDias: number;
  diasDesdeUltimaManutencao: number;
  name: string;
  cat: string;
  specs: string;
  photo: string;
  thumb: string;
  health: number;
  status: MachineStatus;
  statusLabel: string;
  hours: string;
  utilizacao: number;
  problem: string;
  original: { price: number; downtime: string; impact: number; contract: string | null };
  alt: { price: number; downtime: string; impact: number; contract: string | null };
  inContract: boolean;
  task: string;
  location: string;
  // Identidade da máquina (Fase 3 do roadmap, sessão 30)
  apelido?: string;
  diasNaEmpresa?: number;
  contratosRealizados?: number;
  faturamentoGerado?: number;
  manutencoesFeitas?: number;
  quebrada?: boolean;
}

export type MachinesState = Record<string, Machine>;

export type RiskLevel = 'low' | 'mid' | 'high';

export interface ContractRequirement {
  tipo: string;
  qtd: number;
}

export interface ContractArchetype {
  nome: string;
  req: ContractRequirement[];
  risk: RiskLevel;
  riskLabel: string;
  prazoDias: number;
  valorBase: number;
  riscoDesc: string;
  tipoConsequencia: 'atraso' | 'custo' | 'ambos';
  photo: string;
  hero: string;
}

export interface Contract {
  name: string;
  value: number;
  company: string;
  location: string;
  photo: string;
  hero: string;
  payment: string;
  risk: RiskLevel;
  riskLabel: string;
  req: string[];
  prazo: string;
  prazoDias: number;
  km: string;
  riskDesc: string;
  penalty: string;
  penaltyPctDia: number;
  hasMachine: boolean;
  missing: string;
  requiredMachineKeys: ContractRequirement[];
  state: 'DISPONIVEL' | 'EM_ANDAMENTO' | 'EM_RISCO' | 'ATRASADO';
  personalidade?: 'tentador' | 'especial' | 'comum';
  isNovo?: boolean;
}

export type ContractsState = Record<string, Contract>;

export interface AcceptedContract {
  key: string;
  name: string;
  machineKeys: string[];
  state: 'EM_ANDAMENTO' | 'EM_RISCO' | 'ATRASADO';
  [key: string]: unknown;
}

export interface HistoricoEntry {
  icon: string;
  titulo: string;
  detalhe: string;
}

export interface SedeInfo {
  nome: string;
  desc: string;
  cor: string;
  foto: string;
  risco: number;
  maxMaquinas: number;
  custoUpgrade?: number;
  desbloqueado: boolean;
}

// ---------------------------------------------------------------------------
// DADOS — MACHINES (frota inicial, 5 máquinas)
// ---------------------------------------------------------------------------

export const APELIDOS_MAQUINA = [
  'Bruta', 'Coração de Aço', 'Fura-Fila', 'Trator Véio', 'Guerreira',
  'Sem Pressa', 'Bicho Papão', 'Confiável', 'Fumacinha', 'Titã',
];

export function sortearApelido(): string {
  return APELIDOS_MAQUINA[Math.floor(Math.random() * APELIDOS_MAQUINA.length)];
}

export const MACHINES: MachinesState = {
  retro: {
    tipoKey: 'retro', idadeDias: 640, diasDesdeUltimaManutencao: 80,
    name: 'Retroescavadeira NH B110B', cat: 'Escavação', specs: '14 toneladas · caçamba 0,3 m³',
    photo: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=500&fit=crop&w=800',
    thumb: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=200&fit=crop&w=200',
    health: 22, status: 'red', statusLabel: '🔴 Crítico', hours: '340h desde a última revisão', utilizacao: 0,
    problem: 'Vazamento no sistema hidráulico e desgaste avançado nas mangueiras principais.',
    original: { price: 8500, downtime: '1 dia', impact: 1800, contract: 'Terraplenagem p/ Loteamento' },
    alt: { price: 4900, downtime: '3 dias', impact: 5400, contract: 'Terraplenagem p/ Loteamento' },
    inContract: true, task: 'Parada — aguardando manutenção', location: 'Base — Campinas, SP',
  },
  trator: {
    tipoKey: 'trator', idadeDias: 310, diasDesdeUltimaManutencao: 20,
    name: 'Trator de Esteira D6T', cat: 'Terraplenagem', specs: '18 toneladas · lâmina 3,4 m³',
    photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=800&h=550&fit=crop',
    thumb: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    health: 61, status: 'amber', statusLabel: '🟡 Atenção', hours: '180h desde a última revisão', utilizacao: 78,
    problem: 'Filtro de ar e óleo de motor próximos do limite recomendado.',
    original: { price: 2200, downtime: '4h', impact: 400, contract: 'Aterro Sanitário Leste' },
    alt: { price: 1300, downtime: '1 dia', impact: 1900, contract: 'Aterro Sanitário Leste' },
    inContract: true, task: 'Em operação — Aterro Sanitário Leste', location: 'Suzano, SP',
  },
  escavadeira: {
    tipoKey: 'escavadeira', idadeDias: 45, diasDesdeUltimaManutencao: 10,
    name: 'Escavadeira Hidráulica CAT 320D', cat: 'Escavação', specs: '22 toneladas · caçamba 1,2 m³',
    photo: 'https://images.unsplash.com/photo-1752342625685-bc342beb248e?fm=jpg&q=75&w=800&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1752342625685-bc342beb248e?fm=jpg&q=70&w=200&auto=format&fit=crop',
    health: 92, status: 'green', statusLabel: '🟢 OK', hours: '40h desde a última revisão', utilizacao: 35,
    problem: 'Nenhum problema detectado. Revisão de rotina recomendada em 620h.',
    original: { price: 1800, downtime: '3h', impact: 0, contract: null },
    alt: { price: 1100, downtime: '6h', impact: 0, contract: null },
    inContract: false, task: 'Disponível para novo contrato', location: 'Base — Campinas, SP',
  },
  caminhao: {
    tipoKey: 'caminhao', idadeDias: 95, diasDesdeUltimaManutencao: 15,
    name: 'Caminhão Basculante Ford Cargo', cat: 'Transporte', specs: '12 m³ de caçamba · 8 ton. de carga útil',
    photo: 'https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?fm=jpg&q=75&w=800&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?fm=jpg&q=70&w=200&auto=format&fit=crop',
    health: 88, status: 'green', statusLabel: '🟢 OK', hours: '95h desde a última revisão', utilizacao: 20,
    problem: 'Nenhum problema detectado. Pastilhas de freio com 70% de vida útil.',
    original: { price: 1600, downtime: '3h', impact: 0, contract: null },
    alt: { price: 900, downtime: '5h', impact: 0, contract: null },
    inContract: false, task: 'Disponível para novo contrato', location: 'Base — Campinas, SP',
  },
  pa: {
    tipoKey: 'pa', idadeDias: 380, diasDesdeUltimaManutencao: 50,
    name: 'Pá Carregadeira WA200', cat: 'Carregamento', specs: '20 toneladas · caçamba 3,1 m³',
    photo: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=800&auto=format&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=70&w=200&auto=format&fit=crop',
    health: 58, status: 'amber', statusLabel: '🟡 Atenção', hours: '210h desde a última revisão', utilizacao: 8,
    problem: 'Pneus com desgaste irregular e sistema de içamento pedindo lubrificação.',
    original: { price: 3400, downtime: '1 dia', impact: 0, contract: null },
    alt: { price: 1900, downtime: '2 dias', impact: 0, contract: null },
    inContract: false, task: 'Em pátio — revisão recomendada', location: 'Base — Campinas, SP',
  },
};

// Inicializa a identidade (Fase 3) das 5 máquinas iniciais.
//
// DIFERENÇA DELIBERADA em relação ao app.html: lá, o apelido era sorteado com
// Math.random() direto no carregamento do script — funciona porque o app.html
// roda 100% no cliente, sem SSR. Aqui MACHINES é importado tanto no servidor
// (renderização inicial) quanto no cliente (hidratação); usar Math.random() no
// escopo do módulo faz cada lado sortear um apelido diferente e o React acusa
// erro de hidratação (texto do servidor != texto do cliente). Por isso a frota
// inicial usa um apelido determinístico (por posição no array); sortearApelido()
// continua disponível e com o mesmo comportamento aleatório para máquinas
// COMPRADAS depois, já que essa compra só acontece em código client-side
// (clique do jogador), onde não existe divergência servidor/cliente para evitar.
Object.values(MACHINES).forEach((m, i) => {
  m.apelido = APELIDOS_MAQUINA[i % APELIDOS_MAQUINA.length];
  m.diasNaEmpresa = 0;
  m.contratosRealizados = 0;
  m.faturamentoGerado = 0;
  m.manutencoesFeitas = 0;
});

// ---------------------------------------------------------------------------
// DADOS — CONTRACT_POOL (40 arquétipos de contrato regeneráveis)
// ---------------------------------------------------------------------------

export const CONTRACT_POOL: ContractArchetype[] = [
  { nome: 'Aterro Industrial', req: [{ tipo: 'escavadeira', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 10, valorBase: 240000, riscoDesc: 'Caminhão pode atolar na lama após chuva, prendendo a operação até o resgate.', tipoConsequencia: 'atraso', photo: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=1000&auto=format&fit=crop' },
  { nome: 'Aterro Industrial — Fase 2', req: [{ tipo: 'trator', qtd: 1 }, { tipo: 'caminhao', qtd: 2 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 12, valorBase: 260000, riscoDesc: 'Solo instável pode ceder sob o peso do trator, danificando as esteiras.', tipoConsequencia: 'custo', photo: 'https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?fm=jpg&q=70&w=1000&auto=format&fit=crop' },
  { nome: 'Abertura de Estrada Rural', req: [{ tipo: 'motoniveladora', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 14, valorBase: 180000, riscoDesc: 'Pedras ocultas sob a terra podem danificar a lâmina de nivelamento.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Reforma de Estrada Vicinal', req: [{ tipo: 'motoniveladora', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 12, valorBase: 165000, riscoDesc: 'Buraco antigo mal sinalizado pode causar dano à suspensão da máquina.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Extração de Pedra', req: [{ tipo: 'escavadeira30', qtd: 1 }], risk: 'high', riskLabel: 'Alto', prazoDias: 21, valorBase: 525000, riscoDesc: 'Risco real de queda de blocos de rocha soltos sobre a máquina durante a extração.', tipoConsequencia: 'ambos', photo: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=1000&auto=format&fit=crop' },
  { nome: 'Terraplenagem p/ Loteamento', req: [{ tipo: 'trator', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 12, valorBase: 210000, riscoDesc: 'Fundação antiga enterrada e não mapeada pode danificar a lâmina do trator.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Terraplenagem de Loteamento Grande', req: [{ tipo: 'trator', qtd: 2 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 15, valorBase: 280000, riscoDesc: 'Falha de coordenação entre os dois tratores pode causar colisão leve entre as máquinas.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Desmatamento Fazenda Boa Vista', req: [{ tipo: 'retro', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 15, valorBase: 95000, riscoDesc: 'Tronco caído de forma inesperada pode prender a caçamba durante a remoção.', tipoConsequencia: 'atraso', photo: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=300&fit=crop&w=400', hero: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=700&fit=crop&w=1000' },
  { nome: 'Desmatamento de Área Extensa', req: [{ tipo: 'retro', qtd: 2 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 18, valorBase: 130000, riscoDesc: 'Área extensa aumenta a chance de encontrar ninho de inseto ou animal peçonhento, parando o serviço.', tipoConsequencia: 'atraso', photo: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=300&fit=crop&w=400', hero: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=700&fit=crop&w=1000' },
  { nome: 'Demolição Controlada', req: [{ tipo: 'escavadeira', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'high', riskLabel: 'Alto', prazoDias: 14, valorBase: 310000, riscoDesc: 'Risco real de colapso parcial imprevisto da estrutura sobre a máquina.', tipoConsequencia: 'ambos', photo: 'https://images.unsplash.com/photo-1776594974675-b21647efe342?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1776594974675-b21647efe342?fm=jpg&q=75&w=1000&auto=format&fit=crop' },
  { nome: 'Demolição de Galpão Industrial', req: [{ tipo: 'escavadeira', qtd: 1 }, { tipo: 'caminhao', qtd: 2 }], risk: 'high', riskLabel: 'Alto', prazoDias: 16, valorBase: 350000, riscoDesc: 'Estrutura metálica pode ceder de forma imprevisível, atingindo equipamento próximo.', tipoConsequencia: 'ambos', photo: 'https://images.unsplash.com/photo-1776594974675-b21647efe342?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1776594974675-b21647efe342?fm=jpg&q=75&w=1000&auto=format&fit=crop' },
  { nome: 'Dragagem de Lago Artificial', req: [{ tipo: 'escavadeira', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 13, valorBase: 265000, riscoDesc: 'Solo do fundo do lago pode ceder, fazendo a escavadeira atolar ou afundar parcialmente na água.', tipoConsequencia: 'atraso', photo: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=1000&auto=format&fit=crop' },
  { nome: 'Desassoreamento de Rio', req: [{ tipo: 'escavadeira', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 11, valorBase: 220000, riscoDesc: "Correnteza forte pode desestabilizar a máquina na margem, com risco de a esteira escorregar pra dentro d'água.", tipoConsequencia: 'ambos', photo: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=1000&auto=format&fit=crop' },
  { nome: 'Abertura de Vala p/ Tubulação', req: [{ tipo: 'retro', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 8, valorBase: 85000, riscoDesc: 'Cabo elétrico ou tubulação não mapeada pode ser rompida durante a escavação.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=300&fit=crop&w=400', hero: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=700&fit=crop&w=1000' },
  { nome: 'Rede de Drenagem Pluvial', req: [{ tipo: 'retro', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 11, valorBase: 175000, riscoDesc: 'Escavação perto de via pavimentada pode causar rachadura no asfalto, gerando multa extra.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=300&fit=crop&w=400', hero: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=700&fit=crop&w=1000' },
  { nome: 'Nivelamento de Campo Agrícola', req: [{ tipo: 'trator', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 9, valorBase: 110000, riscoDesc: 'Cerca ou irrigação enterrada pode ser rompida acidentalmente durante o nivelamento.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Preparo de Solo p/ Plantio', req: [{ tipo: 'pa', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 7, valorBase: 90000, riscoDesc: 'Raízes profundas podem travar a caçamba momentaneamente, exigindo manobra extra.', tipoConsequencia: 'atraso', photo: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=1000&auto=format&fit=crop' },
  { nome: 'Escavação de Fundação Predial', req: [{ tipo: 'escavadeira', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 12, valorBase: 255000, riscoDesc: 'Encontrar rocha ou lençol freático raso pode obrigar a parar a escavação até avaliação técnica.', tipoConsequencia: 'atraso', photo: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=1000&auto=format&fit=crop' },
  { nome: 'Escavação de Fundação — Prédio Grande', req: [{ tipo: 'escavadeira', qtd: 1 }, { tipo: 'caminhao', qtd: 2 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 16, valorBase: 320000, riscoDesc: 'Profundidade maior aumenta o risco de desmoronamento lateral da vala.', tipoConsequencia: 'ambos', photo: 'https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?fm=jpg&q=70&w=1000&auto=format&fit=crop' },
  { nome: 'Pavimentação de Estacionamento', req: [{ tipo: 'motoniveladora', qtd: 1 }, { tipo: 'pa', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 10, valorBase: 150000, riscoDesc: 'Nivelamento impreciso pode exigir uma segunda passada completa.', tipoConsequencia: 'atraso', photo: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Limpeza Pós-Incêndio', req: [{ tipo: 'trator', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 10, valorBase: 145000, riscoDesc: 'Solo instável coberto de cinzas pode ceder sob o peso do trator sem aviso.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Nivelamento de Campo Esportivo', req: [{ tipo: 'motoniveladora', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 9, valorBase: 120000, riscoDesc: 'Irregularidade oculta no terreno pode exigir passada extra de nivelamento.', tipoConsequencia: 'atraso', photo: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Ampliação de Cemitério Municipal', req: [{ tipo: 'retro', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 8, valorBase: 78000, riscoDesc: 'Proximidade com estrutura já existente exige cuidado redobrado — risco de dano à vizinhança.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=300&fit=crop&w=400', hero: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=700&fit=crop&w=1000' },
  { nome: 'Cobertura de Aterro Sanitário', req: [{ tipo: 'trator', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 13, valorBase: 230000, riscoDesc: 'Gases do aterro podem se acumular e causar mal-estar no operador, exigindo pausa na operação.', tipoConsequencia: 'atraso', photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Limpeza de Faixa de Servidão', req: [{ tipo: 'retro', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 9, valorBase: 88000, riscoDesc: 'Proximidade com linha de transmissão exige distância mínima — risco de choque se não respeitada.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=300&fit=crop&w=400', hero: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=700&fit=crop&w=1000' },
  { nome: 'Acesso p/ Parque Eólico', req: [{ tipo: 'motoniveladora', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 15, valorBase: 275000, riscoDesc: 'Encosta acidentada aumenta o risco de a motoniveladora escorregar ou tombar em terreno molhado.', tipoConsequencia: 'ambos', photo: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Acesso p/ Usina Solar', req: [{ tipo: 'motoniveladora', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 11, valorBase: 155000, riscoDesc: 'Terreno relativamente plano — risco baixo, mas poeira excessiva pode exigir pausa por segurança.', tipoConsequencia: 'atraso', photo: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Lastro de Ferrovia', req: [{ tipo: 'pa', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 14, valorBase: 240000, riscoDesc: 'Trabalho próximo a trilho ativo pode ser interditado por segurança a qualquer momento.', tipoConsequencia: 'atraso', photo: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=1000&auto=format&fit=crop' },
  { nome: 'Terraplenagem de Pátio Industrial', req: [{ tipo: 'trator', qtd: 1 }, { tipo: 'pa', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 12, valorBase: 235000, riscoDesc: 'Solo parcialmente compactado pode ocultar vazio subterrâneo, arriscando afundamento repentino da máquina.', tipoConsequencia: 'ambos', photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Escavação de Piscina de Contenção', req: [{ tipo: 'escavadeira', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 10, valorBase: 195000, riscoDesc: 'Profundidade da escavação aumenta o risco de desabamento das paredes de terra sobre a máquina.', tipoConsequencia: 'ambos', photo: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=1000&auto=format&fit=crop' },
  { nome: 'Terraplenagem de Campo de Golfe', req: [{ tipo: 'trator', qtd: 1 }, { tipo: 'pa', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 16, valorBase: 260000, riscoDesc: 'Exigência de acabamento fino aumenta o risco de retrabalho, mais que o de incidente físico.', tipoConsequencia: 'atraso', photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Reforma de Estrada de Fazenda', req: [{ tipo: 'motoniveladora', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 8, valorBase: 95000, riscoDesc: 'Trecho simples — risco baixo, mas erosão recente pode exigir correção extra.', tipoConsequencia: 'atraso', photo: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Contenção de Encosta', req: [{ tipo: 'retro', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'high', riskLabel: 'Alto', prazoDias: 14, valorBase: 300000, riscoDesc: 'Risco real de deslizamento de terra durante a intervenção, especialmente em dia de chuva.', tipoConsequencia: 'ambos', photo: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=300&fit=crop&w=400', hero: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=700&fit=crop&w=1000' },
  { nome: 'Estabilização de Margem de Rio', req: [{ tipo: 'escavadeira', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'high', riskLabel: 'Alto', prazoDias: 15, valorBase: 315000, riscoDesc: 'Erosão da margem pode ceder sob o peso da máquina, com risco de tombamento em direção à água.', tipoConsequencia: 'ambos', photo: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=1000&auto=format&fit=crop' },
  { nome: 'Remoção de Entulho de Obra', req: [{ tipo: 'pa', qtd: 1 }, { tipo: 'caminhao', qtd: 2 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 7, valorBase: 105000, riscoDesc: 'Entulho pontiagudo pode perfurar pneu da máquina durante o carregamento.', tipoConsequencia: 'custo', photo: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=1000&auto=format&fit=crop' },
  { nome: 'Preparo de Base p/ Galpão Logístico', req: [{ tipo: 'trator', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 13, valorBase: 245000, riscoDesc: 'Especificação rígida de compactação aumenta o risco de retrabalho caso a base não passe no teste.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Extração de Cascalho', req: [{ tipo: 'pa', qtd: 1 }, { tipo: 'caminhao', qtd: 2 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 12, valorBase: 250000, riscoDesc: 'Pilha instável de material pode desmoronar sobre a máquina durante o carregamento.', tipoConsequencia: 'custo', photo: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=1000&auto=format&fit=crop' },
  { nome: 'Extração de Areia', req: [{ tipo: 'pa', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 11, valorBase: 200000, riscoDesc: 'Areia encharcada pode fazer a máquina atolar durante a extração.', tipoConsequencia: 'atraso', photo: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=400&auto=format&fit=crop', hero: 'https://images.unsplash.com/photo-1757496156065-669f39ae77eb?fm=jpg&q=75&w=1000&auto=format&fit=crop' },
  { nome: 'Terraplenagem p/ Loteamento Popular', req: [{ tipo: 'trator', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], risk: 'mid', riskLabel: 'Médio', prazoDias: 11, valorBase: 215000, riscoDesc: 'Prazo apertado por exigência do contratante aumenta a pressão — risco maior de atraso que de incidente físico.', tipoConsequencia: 'atraso', photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', hero: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop' },
  { nome: 'Escavação p/ Piscina Residencial', req: [{ tipo: 'retro', qtd: 1 }], risk: 'low', riskLabel: 'Baixo', prazoDias: 6, valorBase: 62000, riscoDesc: 'Espaço apertado do quintal aumenta o risco de a máquina esbarrar em muro ou estrutura vizinha.', tipoConsequencia: 'custo', photo: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=300&fit=crop&w=400', hero: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=700&fit=crop&w=1000' },
];

// ---------------------------------------------------------------------------
// DADOS — CONTRACTS (contratos ativos disponíveis no Hub, estado inicial)
// ---------------------------------------------------------------------------

export const CONTRACTS: ContractsState = {
  aterro: {
    name: 'Aterro Industrial', value: 240000, company: 'Construtora Planalto', location: 'Campinas, SP',
    photo: 'https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?fm=jpg&q=70&w=400&auto=format&fit=crop',
    hero: 'https://images.unsplash.com/photo-1534097575056-ddba81f714c8?fm=jpg&q=75&w=900&auto=format&fit=crop',
    payment: 'Parcelado (3x)', risk: 'mid', riskLabel: 'Risco médio',
    req: ['🚜 Escavadeira 20t ou maior (você tem: 22t)', '🚛 Caminhão basc. mín. 10m³ (você tem: 12m³)', '👷 Operador habilitado'],
    prazo: '10 dias', prazoDias: 10, km: '48 km',
    riskDesc: 'Terreno com histórico de chuvas na região. Pode haver atrasos por condições climáticas.',
    penalty: 'Atraso: 0,5%/dia · Cancelamento: 10% do valor total.', penaltyPctDia: 0.005,
    hasMachine: true, missing: '', requiredMachineKeys: [{ tipo: 'escavadeira', qtd: 1 }, { tipo: 'caminhao', qtd: 1 }], state: 'DISPONIVEL',
  },
  estrada: {
    name: 'Abertura de Estrada', value: 180000, company: 'Prefeitura de Itupeva', location: 'Itupeva, SP',
    photo: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&fit=crop',
    hero: 'https://images.pexels.com/photos/18812422/pexels-photo-18812422.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
    payment: 'À vista', risk: 'low', riskLabel: 'Risco baixo',
    req: ['🚜 Motoniveladora', '👷 Operador habilitado'],
    prazo: '14 dias', prazoDias: 14, km: '22 km',
    riskDesc: 'Terreno plano, acesso pavimentado e histórico estável na região.',
    penalty: 'Atraso: 0,3%/dia · Cancelamento: 8% do valor total.', penaltyPctDia: 0.003,
    hasMachine: false, missing: 'Motoniveladora (nenhuma na sua frota)', requiredMachineKeys: [{ tipo: 'motoniveladora', qtd: 1 }], state: 'DISPONIVEL',
  },
  pedra: {
    name: 'Extração de Pedra', value: 525000, company: 'Mineração Forte', location: 'Mairinque, SP',
    photo: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=70&w=400&auto=format&fit=crop',
    hero: 'https://images.unsplash.com/photo-1503708928676-1cb796a0891e?fm=jpg&q=75&w=900&auto=format&fit=crop',
    payment: 'Parcelado (4x)', risk: 'high', riskLabel: 'Risco alto',
    req: ['🚜 Escavadeira 30t+ (sua maior: 22t)', '👷 Operador certificado NR-22'],
    prazo: '21 dias', prazoDias: 21, km: '63 km',
    riskDesc: 'Área de mineração ativa, terreno instável e exigências regulatórias.',
    penalty: 'Atraso: 0,8%/dia · Cancelamento: 15% do valor total.', penaltyPctDia: 0.008,
    hasMachine: false, missing: 'Escavadeira 30t ou maior', requiredMachineKeys: [{ tipo: 'escavadeira30', qtd: 1 }], state: 'DISPONIVEL',
  },
  loteamento: {
    name: 'Terraplenagem p/ Loteamento', value: 210000, company: 'Loteadora Nova Vida', location: 'Sorocaba, SP',
    photo: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=600&h=450&fit=crop',
    hero: 'https://images.pexels.com/photos/13923406/pexels-photo-13923406.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop',
    payment: 'Parcelado (2x)', risk: 'mid', riskLabel: 'Risco médio',
    req: ['🚜 Trator de Esteira (você tem: D6T, 18t)', '👷 Operador habilitado'],
    prazo: '12 dias', prazoDias: 12, km: '35 km',
    riskDesc: 'Terreno recém-loteado com drenagem ainda não testada em chuva forte.',
    penalty: 'Atraso: 0,5%/dia · Cancelamento: 10% do valor total.', penaltyPctDia: 0.005,
    hasMachine: true, missing: '', requiredMachineKeys: [{ tipo: 'trator', qtd: 1 }], state: 'DISPONIVEL',
  },
  desmatamento: {
    name: 'Desmatamento Fazenda Boa Vista', value: 95000, company: 'Fazenda Boa Vista', location: 'Itatiba, SP',
    photo: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=400&fit=crop&w=400',
    hero: 'https://images.pexels.com/photos/5125782/pexels-photo-5125782.jpeg?auto=compress&cs=tinysrgb&h=700&fit=crop&w=1000',
    payment: 'À vista', risk: 'low', riskLabel: 'Risco baixo',
    req: ['🚜 Retroescavadeira (você tem: NH B110B, 14t)', '👷 Operador habilitado'],
    prazo: '15 dias', prazoDias: 15, km: '18 km',
    riskDesc: 'Área rural de baixa complexidade, sem histórico de intercorrências.',
    penalty: 'Atraso: 0,3%/dia · Cancelamento: 8% do valor total.', penaltyPctDia: 0.003,
    hasMachine: true, missing: '', requiredMachineKeys: [{ tipo: 'retro', qtd: 1 }], state: 'DISPONIVEL',
  },
};

// ---------------------------------------------------------------------------
// DADOS — SEDES_DATA (fotos extraídas de public/assets/sedes/, base64 → arquivo real)
// ---------------------------------------------------------------------------

export const SEDES_DATA: Record<number, SedeInfo> = {
  1: { nome: 'O Barraço', desc: 'Terreno de chão batido, ferrugem, lama.', cor: '#3A2230', foto: '/assets/sedes/sede-1.jpg', risco: 1.2, maxMaquinas: 5, desbloqueado: true },
  2: { nome: 'Garagem com Oficina', desc: 'Piso concreto, oficina organizada.', cor: '#332A57', foto: '/assets/sedes/sede-2.jpg', risco: 1.0, maxMaquinas: 8, custoUpgrade: 180000, desbloqueado: false },
  3: { nome: 'Sede Média', desc: 'Prédio 2 andares, vidro, pátio pavimentado.', cor: '#241C3B', foto: '/assets/sedes/sede-3.jpg', risco: 0.95, maxMaquinas: 12, custoUpgrade: 650000, desbloqueado: false },
  4: { nome: 'Sede Grande', desc: 'Galpão industrial, painéis solares.', cor: '#1A1530', foto: '/assets/sedes/sede-4.jpg', risco: 0.90, maxMaquinas: 18, custoUpgrade: 1200000, desbloqueado: false },
  5: { nome: 'IMPÉRIO', desc: 'Torre de vidro, heliponto, oficina própria.', cor: '#0F0820', foto: '/assets/sedes/sede-5.jpg', risco: 0.85, maxMaquinas: 30, custoUpgrade: 4000000, desbloqueado: false },
};

export const REQUISITOS_SEDE: Record<number, { reputacao: number; custo: number }> = {
  2: { reputacao: 105, custo: 180000 },
  3: { reputacao: 115, custo: 650000 },
  4: { reputacao: 128, custo: 1200000 },
  5: { reputacao: 142, custo: 4000000 },
};

// ---------------------------------------------------------------------------
// CONSTANTES DE NEGÓCIO (risco, seguro, custos, impostos, reputação)
// ---------------------------------------------------------------------------

export const RISK_TIERS: Record<RiskLevel, { label: string; baseProb: number; impactPct: number }> = {
  low: { label: 'Baixo', baseProb: 0.020, impactPct: 0.15 },
  mid: { label: 'Médio', baseProb: 0.060, impactPct: 0.25 },
  high: { label: 'Alto', baseProb: 0.085, impactPct: 0.35 },
};

export const SEGURO_OPTIONS = {
  nenhum: { label: 'Sem seguro', custoPct: 0, probRed: 0, impactRed: 0 },
  basica: { label: 'Cobertura básica', custoPct: 0.03, probRed: 0.060, impactRed: 0.40 },
  completa: { label: 'Cobertura completa', custoPct: 0.07, probRed: 0.120, impactRed: 0.75 },
} as const;

export const TAX_BRACKETS = [
  { ate: 500000, aliquota: 0.06 },
  { ate: 1000000, aliquota: 0.08 },
  { ate: 2000000, aliquota: 0.10 },
  { ate: Infinity, aliquota: 0.12 },
];

export const CUSTOS_ADMINISTRATIVOS_COMPONENTES = [
  { label: 'Aluguel da sede', icon: '🏢', valorDia: 400 },
  { label: 'Equipe administrativa', icon: '🧑‍💼', valorDia: 350 },
  { label: 'Pró-labore dos sócios', icon: '💼', valorDia: 500 },
];
export const CUSTO_ADMINISTRATIVO_DIARIO_BASE = CUSTOS_ADMINISTRATIVOS_COMPONENTES.reduce((s, c) => s + c.valorDia, 0);
export const CUSTO_ADICIONAL_POR_MAQUINA_DIA = 150;
export const CUSTO_MAQUINA_OCIOSA_DIA = 50;

export const DIAS_GRACA_MANUTENCAO_BASICA = 45;
export const DESGASTE_USO_MIN_POR_DIA = 0.3;
export const DESGASTE_USO_MAX_POR_DIA = 0.8;
export const DESGASTE_PARADA_MIN_POR_DIA = 0.05;
export const DESGASTE_PARADA_MAX_POR_DIA = 0.12;

export const REPUTACAO_TIERS = [
  { min: 0, max: 109, nome: 'Iniciante', multiplicador: 0.90, cor: '#9891B0' },
  { min: 110, max: 124, nome: 'Confiável', multiplicador: 1.05, cor: '#5AA8FF' },
  { min: 125, max: 139, nome: 'Referência regional', multiplicador: 1.20, cor: '#33E0A0' },
  { min: 140, max: 150, nome: 'Referência no mercado', multiplicador: 1.35, cor: '#FFC24B' },
];

export const REQ_LABELS: Record<string, string> = {
  escavadeira: 'Escavadeira 20t ou maior', caminhao: 'Caminhão basc. mín. 10m³',
  trator: 'Trator de Esteira', pa: 'Pá Carregadeira', retro: 'Retroescavadeira',
  motoniveladora: 'Motoniveladora', escavadeira30: 'Escavadeira 30t ou maior',
};

export const CURRENCY_SYMBOL = 'R$';

// ---------------------------------------------------------------------------
// FUNÇÕES PURAS (portadas 1:1 do app.html — mesma assinatura, mesmo comportamento)
// ---------------------------------------------------------------------------

export function fmt(n: number): string {
  return CURRENCY_SYMBOL + ' ' + Math.round(n).toLocaleString('pt-BR');
}

export function obterTierReputacao(rep: number) {
  return REPUTACAO_TIERS.find((t) => rep >= t.min && rep <= t.max) || REPUTACAO_TIERS[0];
}

export function custoAdministrativoDiarioAtual(machines: MachinesState): number {
  const maquinas = Object.values(machines);
  if (maquinas.length <= 1) return CUSTO_ADMINISTRATIVO_DIARIO_BASE;
  const extras = maquinas.slice(1);
  const custoExtras = extras.reduce(
    (soma, m) => soma + (m.inContract ? CUSTO_ADICIONAL_POR_MAQUINA_DIA : CUSTO_MAQUINA_OCIOSA_DIA),
    0
  );
  return CUSTO_ADMINISTRATIVO_DIARIO_BASE + custoExtras;
}

export function calcularAliquotaEfetiva(faturamentoAcumulado: number): number {
  for (const faixa of TAX_BRACKETS) {
    if (faturamentoAcumulado <= faixa.ate) return faixa.aliquota;
  }
  return TAX_BRACKETS[TAX_BRACKETS.length - 1].aliquota;
}

// Checa se o jogador POSSUI máquinas suficientes de cada tipo exigido (não necessariamente livres agora).
export function calcularHasMachine(machines: MachinesState, requisitos: ContractRequirement[]) {
  if (!requisitos || requisitos.length === 0) return { ok: false, missing: 'Máquina fora da sua frota atual' };
  for (const req of requisitos) {
    const possuidas = Object.values(machines).filter((m) => m.tipoKey === req.tipo).length;
    if (possuidas < req.qtd) {
      const label = REQ_LABELS[req.tipo] || 'Máquina não disponível';
      return {
        ok: false,
        missing: req.qtd > 1 ? `${label} — precisa de ${req.qtd}, você tem ${possuidas}` : label,
      };
    }
  }
  return { ok: true, missing: '' };
}

// Checa se as máquinas exigidas estão LIVRES agora (não só na garagem).
export function maquinasDisponiveisAgora(machines: MachinesState, requisitos: ContractRequirement[]) {
  for (const req of requisitos) {
    const livres = Object.entries(machines).filter(([, m]) => m.tipoKey === req.tipo && !m.inContract).length;
    if (livres < req.qtd) {
      const label = REQ_LABELS[req.tipo] || 'máquina';
      return {
        ok: false,
        motivo: `${label}: precisa de ${req.qtd} livre(s), só ${livres} disponível(is) agora (o resto já está em outro contrato).`,
      };
    }
  }
  return { ok: true, motivo: '' };
}

// Escolhe quais instâncias específicas de máquina trabalham no contrato — prioriza as mais saudáveis.
export function selecionarMaquinasParaContrato(machines: MachinesState, requisitos: ContractRequirement[]): string[] {
  const escolhidas: string[] = [];
  requisitos.forEach((req) => {
    const livres = Object.entries(machines)
      .filter(([, m]) => m.tipoKey === req.tipo && !m.inContract)
      .sort((a, b) => b[1].health - a[1].health);
    for (let i = 0; i < req.qtd && i < livres.length; i++) {
      escolhidas.push(livres[i][0]);
    }
  });
  return escolhidas;
}

// Fator de produtividade de um contrato em andamento — máquina quebrada não conta como disponível.
export function calcularFatorProdutividade(
  machines: MachinesState,
  machineKeys: string[],
  requiredMachineKeys: ContractRequirement[]
): number {
  const maquinasAtivas = machineKeys.map((k) => machines[k]).filter((m) => m && !m.quebrada);
  const avgHealth = maquinasAtivas.length ? maquinasAtivas.reduce((s, m) => s + m.health, 0) / maquinasAtivas.length : 0;
  const fatorSaude = 0.6 + 0.4 * (avgHealth / 100);

  const qtdMinima = (requiredMachineKeys || []).reduce((s, r) => s + r.qtd, 0) || 1;
  const qtdAtual = maquinasAtivas.length;
  const fatorQuantidade = Math.max(0.15, Math.min(1.5, qtdAtual / qtdMinima));

  return fatorSaude * fatorQuantidade;
}

// Envelhece a frota inteira — muta `machines` in-place, igual ao app.html (MACHINES é mutado, não substituído).
export function envelhecerFrota(machines: MachinesState, diasNovos: number): void {
  Object.values(machines).forEach((m) => {
    m.idadeDias = (m.idadeDias || 0) + diasNovos;
    m.diasNaEmpresa = (m.diasNaEmpresa || 0) + diasNovos;
    m.diasDesdeUltimaManutencao = (m.diasDesdeUltimaManutencao || 0) + diasNovos;
    if (m.inContract) {
      const desgastePorDia = DESGASTE_USO_MIN_POR_DIA + Math.random() * (DESGASTE_USO_MAX_POR_DIA - DESGASTE_USO_MIN_POR_DIA);
      m.health = Math.round(Math.max(0, m.health - desgastePorDia * diasNovos));
    } else if (m.diasDesdeUltimaManutencao > DIAS_GRACA_MANUTENCAO_BASICA) {
      const desgasteParado = DESGASTE_PARADA_MIN_POR_DIA + Math.random() * (DESGASTE_PARADA_MAX_POR_DIA - DESGASTE_PARADA_MIN_POR_DIA);
      m.health = Math.round(Math.max(0, m.health - desgasteParado * diasNovos));
    }
  });
}

// Status derivado da saúde — usado pra recolorir o status da máquina depois de envelhecer/reparar.
export function statusDeHealth(health: number): MachineStatus {
  if (health >= 70) return 'green';
  if (health >= 40) return 'amber';
  return 'red';
}

// ---------------------------------------------------------------------------
// ESTADO INICIAL DO JOGADOR (mesmos valores/nomes de campo do app.html)
// ---------------------------------------------------------------------------

export interface PlayerState {
  playerCash: number;
  playerPatrimonio: number;
  playerSedeNivel: number;
  reputacao: number;
  fidelidadeMarcas: Record<string, number>;
  contratosTier3Completos: number;
  objetivosCumpridos: Record<string, boolean>;
  playerBonusAtivos: Record<string, { effect: string; duracao: number; diasRestantes: number }>;
  faturamentoAcumulado: number;
  diasGlobaisDecorridos: number;
  stats: { contratosNoPrazo: number; contratosConcluidos: number; oficinasUsadas: number };
  missoesResgatadas: Record<string, boolean>;
  noticias: unknown[];
  missoesNotificadasConcluidas: Record<string, boolean>;
  acceptedContracts: AcceptedContract[];
  completedContracts: unknown[];
  lostContracts: unknown[];
  financiamentosAtivos: unknown[];
  historico: HistoricoEntry[];
  historicoCaixa: unknown[];
  scheduledMaintenances: unknown[];
  maquinasComManutencao: string[];
}

export function criarEstadoInicial(): PlayerState {
  return {
    playerCash: 60000,
    playerPatrimonio: 0,
    playerSedeNivel: 1,
    reputacao: 100,
    fidelidadeMarcas: {},
    contratosTier3Completos: 0,
    objetivosCumpridos: {},
    playerBonusAtivos: {},
    faturamentoAcumulado: 0,
    diasGlobaisDecorridos: 0,
    stats: { contratosNoPrazo: 0, contratosConcluidos: 0, oficinasUsadas: 0 },
    missoesResgatadas: {},
    noticias: [],
    missoesNotificadasConcluidas: {},
    acceptedContracts: [],
    completedContracts: [],
    lostContracts: [],
    financiamentosAtivos: [],
    historico: [],
    historicoCaixa: [],
    scheduledMaintenances: [],
    maquinasComManutencao: [],
  };
}
