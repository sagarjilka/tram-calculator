// Scoring and highlighting logic derived from TRAM Excel sheet

export type ResponseData = Record<string, number>

// For freq_sev items, keys are e.g. sym_depression_freq and sym_depression_sev
// Combined score = freq + sev (max 10). If freq=0, score=0 (not experienced).
export function getFreqSevScore(responses: ResponseData, id: string): number {
  const freq = responses[`${id}_freq`] ?? 0
  if (freq === 0) return 0
  const sev = responses[`${id}_sev`] ?? 0
  return freq + sev
}

export function getScore(responses: ResponseData, id: string): number {
  return responses[id] ?? 0
}

// HIGHLIGHTING THRESHOLDS (moderate or above = highlight)
// Symptoms/Risk: combined freq+sev >= 5 (freq>=2 AND sev>=3 roughly)
// Overall Illness: >= 3
// Disruption: >= 2
// Barriers: >= 2
// Health System: >= 3
// Factors: present (1) = highlight
export function isHighlighted(domainId: number, score: number): boolean {
  switch (domainId) {
    case 1: return score >= 5   // symptoms
    case 2: return score >= 3   // overall illness
    case 3: return score >= 2   // disruption
    case 4: return score >= 5   // risk
    case 5: return score >= 1   // factors (any present)
    case 6: return score >= 3   // health system
    case 7: return score >= 2   // barriers
    default: return false
  }
}

// Build graph data for recharts from all 3 respondent responses
export interface ChartItem {
  name: string
  clinician: number
  yp: number
  parent: number
}

export function buildSymptomsChart(
  cl: ResponseData, yp: ResponseData, par: ResponseData
): ChartItem[] {
  const items = [
    { id: 'sym_depression', name: 'Depression' },
    { id: 'sym_mania', name: 'Mania' },
    { id: 'sym_anxiety', name: 'Anxiety' },
    { id: 'sym_ptsd', name: 'Post-traumatic Stress' },
    { id: 'sym_psychosis', name: 'Psychosis' },
    { id: 'sym_borderline', name: 'Borderline Personality' },
    { id: 'sym_antisocial', name: 'Antisocial Behaviour' },
    { id: 'sym_adhd', name: 'Attention Deficit' },
    { id: 'sym_social_comm', name: 'Social Communication' },
    { id: 'sym_eating', name: 'Eating Difficulties' },
    { id: 'sym_other_mh', name: 'Other Mental Health' },
  ]
  return items
    .map(item => ({
      name: item.name,
      clinician: getFreqSevScore(cl, item.id),
      yp: getFreqSevScore(yp, item.id),
      parent: getFreqSevScore(par, item.id),
    }))
    .filter(d => d.clinician > 0 || d.yp > 0 || d.parent > 0)
    .reverse()
}

export function buildRiskChart(
  cl: ResponseData, yp: ResponseData, par: ResponseData
): ChartItem[] {
  const items = [
    { id: 'risk_stress', name: 'Stress' },
    { id: 'risk_risk_taking', name: 'Risk Taking Behaviour' },
    { id: 'risk_selfharm', name: 'Self-harm (no suicidal intent)' },
    { id: 'risk_suicidal', name: 'Suicidal Thoughts/Behaviours' },
    { id: 'risk_to_others', name: 'Risk to Others' },
    { id: 'risk_from_others', name: 'Risk from Others' },
  ]
  return items
    .map(item => ({
      name: item.name,
      clinician: getFreqSevScore(cl, item.id),
      yp: getFreqSevScore(yp, item.id),
      parent: getFreqSevScore(par, item.id),
    }))
    .filter(d => d.clinician > 0 || d.yp > 0 || d.parent > 0)
    .reverse()
}

export function buildDisruptionChart(
  cl: ResponseData, yp: ResponseData, par: ResponseData
): ChartItem[] {
  const items = [
    { id: 'dis_selfcare', name: 'Self Care' },
    { id: 'dis_sleep', name: 'Sleep' },
    { id: 'dis_household', name: 'Household Chores' },
    { id: 'dis_community', name: 'Community' },
    { id: 'dis_social', name: 'Social' },
    { id: 'dis_responsibility', name: 'Responsibility' },
    { id: 'dis_family', name: 'Family' },
    { id: 'dis_friends', name: 'Friends/Partner' },
    { id: 'dis_peers', name: 'Peers/Colleagues' },
    { id: 'dis_education', name: 'Education/Work Performance' },
  ]
  return items
    .map(item => ({
      name: item.name,
      clinician: getScore(cl, item.id),
      yp: getScore(yp, item.id),
      parent: getScore(par, item.id),
    }))
    .filter(d => d.clinician > 0 || d.yp > 0 || d.parent > 0)
    .reverse()
}

export function buildBarriersChart(
  cl: ResponseData, yp: ResponseData, par: ResponseData
): ChartItem[] {
  const items = [
    { id: 'bar_independence', name: 'Poor Independence' },
    { id: 'bar_condition', name: 'Poor Understanding' },
    { id: 'bar_service_knowledge', name: 'Poor Service Knowledge' },
    { id: 'bar_motivation', name: 'Poor Motivation' },
    { id: 'bar_medication', name: 'Poor Medication Adherence' },
    { id: 'bar_social_support', name: 'Poor Social Support' },
    { id: 'bar_carers', name: 'Carer Involvement' },
    { id: 'bar_team_relations', name: 'Team Relation Struggles' },
    { id: 'bar_history', name: 'Difficulty Repeating History' },
  ]
  return items
    .map(item => ({
      name: item.name,
      clinician: getScore(cl, item.id),
      yp: getScore(yp, item.id),
      parent: getScore(par, item.id),
    }))
    .filter(d => d.clinician > 0 || d.yp > 0 || d.parent > 0)
    .reverse()
}
