/**
 * Loyalty tier system for El Braddock.
 *
 * Tiers based on total lifetime cuts:
 *   Bronze  → 1–9 cuts
 *   Prata   → 10–24 cuts
 *   Ouro    → 25–49 cuts
 *   Diamante → 50+ cuts (bonus tier for super VIPs)
 */

export const TIERS = [
  {
    name: 'Diamante',
    label: '💎 Diamante',
    min: 50,
    next: Infinity,
    color: '#a5f3fc',      // cyan
    bg: 'rgba(165,243,252,0.12)',
    border: 'rgba(165,243,252,0.35)',
    benefits: ['Prioridade máxima na agenda', 'Desconto exclusivo VIP', 'Brinde especial'],
  },
  {
    name: 'Ouro',
    label: '🥇 Ouro',
    min: 25,
    next: 50,
    color: '#d4af37',      // gold
    bg: 'rgba(212,175,55,0.12)',
    border: 'rgba(212,175,55,0.35)',
    benefits: ['Prioridade na agenda', '10% de desconto', 'Acesso antecipado a promoções'],
  },
  {
    name: 'Prata',
    label: '🥈 Prata',
    min: 10,
    next: 25,
    color: '#9ca3af',      // silver
    bg: 'rgba(156,163,175,0.12)',
    border: 'rgba(156,163,175,0.3)',
    benefits: ['5% de desconto no próximo corte', 'Atendimento preferencial'],
  },
  {
    name: 'Bronze',
    label: '🥉 Bronze',
    min: 1,
    next: 10,
    color: '#cd7f32',      // bronze
    bg: 'rgba(205,127,50,0.12)',
    border: 'rgba(205,127,50,0.3)',
    benefits: ['Desconto na 10ª visita', 'Acumulação de pontos VIP'],
  },
  {
    name: 'Novo',
    label: '⭐ Novo',
    min: 0,
    next: 1,
    color: '#6b7280',
    bg: 'rgba(107,114,128,0.1)',
    border: 'rgba(107,114,128,0.2)',
    benefits: ['Bem-vindo ao El Braddock!'],
  },
];

export const getTier = (totalCuts) => {
  return TIERS.find(t => totalCuts >= t.min) || TIERS[TIERS.length - 1];
};

/** Returns progress (0–100) toward the next tier. */
export const getTierProgress = (totalCuts) => {
  const tier = getTier(totalCuts);
  if (tier.next === Infinity) return 100;
  const range = tier.next - tier.min;
  const progress = totalCuts - tier.min;
  return Math.min(100, Math.round((progress / range) * 100));
};

/** Returns how many cuts until the next tier. */
export const cutsToNextTier = (totalCuts) => {
  const tier = getTier(totalCuts);
  if (tier.next === Infinity) return 0;
  return tier.next - totalCuts;
};
