// TRAM questionnaire definitions
// Respondent types: 'clinician' | 'yp' | 'parent'
// all three complete domains 1-5, 7-8 (with exceptions noted)
// only clinician completes domain 6

export type Respondent = 'clinician' | 'yp' | 'parent'

export type QuestionType =
  | 'freq_sev'      // frequency (0-5) + severity (1-5 if freq>0)
  | 'scale_0_5'     // single 0-5 scale
  | 'scale_0_4'     // single 0-4 scale
  | 'scale_0_3'     // single 0-3 scale
  | 'binary'        // 0=not present, 1=present
  | 'crisis_freq'   // 0-4 count
  | 'life_change'   // -1, 0, +1

export interface Question {
  id: string
  label: string
  type: QuestionType
  respondents: Respondent[]
  domain: number
}

export const FREQ_OPTIONS = [
  { value: 0, label: '0 – Not experienced' },
  { value: 1, label: '1 – Rarely' },
  { value: 2, label: '2 – Sometimes' },
  { value: 3, label: '3 – Often' },
  { value: 4, label: '4 – Most of the time' },
  { value: 5, label: '5 – All of the time' },
]

export const SEV_OPTIONS = [
  { value: 1, label: '1 – Very mild' },
  { value: 2, label: '2 – Mild' },
  { value: 3, label: '3 – Moderate' },
  { value: 4, label: '4 – Severe' },
  { value: 5, label: '5 – Very severe' },
]

export const ILLNESS_OPTIONS = [
  { value: 0, label: '0 – Recovered, no treatment needed' },
  { value: 1, label: '1 – Recovered, as long as on treatment' },
  { value: 2, label: '2 – Mildly ill' },
  { value: 3, label: '3 – Moderately ill' },
  { value: 4, label: '4 – Severely ill' },
  { value: 5, label: '5 – Very severely ill' },
]

export const DISRUPTION_OPTIONS = [
  { value: 0, label: '0 – No disruption' },
  { value: 1, label: '1 – Some disruption' },
  { value: 2, label: '2 – Moderate disruption' },
  { value: 3, label: '3 – Significant disruption' },
  { value: 4, label: '4 – Total disruption' },
]

export const BARRIER_OPTIONS = [
  { value: 0, label: '0 – No barrier' },
  { value: 1, label: '1 – Minor barrier' },
  { value: 2, label: '2 – Moderate barrier' },
  { value: 3, label: '3 – Severe barrier' },
]

export const HEALTH_SYSTEM_OPTIONS = [
  { value: 0, label: '0 – No problem' },
  { value: 1, label: '1 – Very mild problem' },
  { value: 2, label: '2 – Mild problem' },
  { value: 3, label: '3 – Moderate problem' },
  { value: 4, label: '4 – Significant problem' },
]

export const LIFE_CHANGE_OPTIONS = [
  { value: -1, label: '-1 – Positive change' },
  { value: 0, label: '0 – No change / no impact' },
  { value: 1, label: '+1 – Negative change' },
]

export const BINARY_OPTIONS = [
  { value: 0, label: '0 – Not present' },
  { value: 1, label: '1 – Present' },
]

export const CRISIS_FREQ_OPTIONS = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4 (maximum)' },
]

const ALL: Respondent[] = ['clinician', 'yp', 'parent']
const CL_ONLY: Respondent[] = ['clinician']
const YP_PARENT: Respondent[] = ['yp', 'parent']

export const QUESTIONS: Question[] = [
  // DOMAIN 1: SYMPTOMS (freq + sev, all 3)
  { id: 'sym_depression', label: 'Depression', type: 'freq_sev', respondents: ALL, domain: 1 },
  { id: 'sym_mania', label: 'Mania', type: 'freq_sev', respondents: ALL, domain: 1 },
  { id: 'sym_anxiety', label: 'Anxiety', type: 'freq_sev', respondents: ALL, domain: 1 },
  { id: 'sym_ptsd', label: 'Post-traumatic stress', type: 'freq_sev', respondents: ALL, domain: 1 },
  { id: 'sym_psychosis', label: 'Psychosis', type: 'freq_sev', respondents: ALL, domain: 1 },
  { id: 'sym_borderline', label: 'Borderline personality', type: 'freq_sev', respondents: ALL, domain: 1 },
  { id: 'sym_antisocial', label: 'Antisocial behaviour', type: 'freq_sev', respondents: ALL, domain: 1 },
  { id: 'sym_adhd', label: 'Attention deficit', type: 'freq_sev', respondents: ALL, domain: 1 },
  { id: 'sym_social_comm', label: 'Social communication difficulties', type: 'freq_sev', respondents: ALL, domain: 1 },
  { id: 'sym_eating', label: 'Eating difficulties', type: 'freq_sev', respondents: ALL, domain: 1 },
  { id: 'sym_other_mh', label: 'Other mental health conditions', type: 'freq_sev', respondents: ALL, domain: 1 },

  // DOMAIN 2: OVERALL ILLNESS (0-5, all 3)
  { id: 'illness_overall', label: 'Overall illness', type: 'scale_0_5', respondents: ALL, domain: 2 },

  // DOMAIN 3: OVERALL DISRUPTION (0-4, all 3)
  { id: 'dis_selfcare', label: 'Self care', type: 'scale_0_4', respondents: ALL, domain: 3 },
  { id: 'dis_sleep', label: 'Sleep', type: 'scale_0_4', respondents: ALL, domain: 3 },
  { id: 'dis_household', label: 'Household chores', type: 'scale_0_4', respondents: ALL, domain: 3 },
  { id: 'dis_community', label: 'Community', type: 'scale_0_4', respondents: ALL, domain: 3 },
  { id: 'dis_social', label: 'Social', type: 'scale_0_4', respondents: ALL, domain: 3 },
  { id: 'dis_responsibility', label: 'Responsibility', type: 'scale_0_4', respondents: ALL, domain: 3 },
  { id: 'dis_family', label: 'Relationships with family', type: 'scale_0_4', respondents: ALL, domain: 3 },
  { id: 'dis_friends', label: 'Relationships with friends/partner', type: 'scale_0_4', respondents: ALL, domain: 3 },
  { id: 'dis_peers', label: 'Relationships with peers/colleagues', type: 'scale_0_4', respondents: ALL, domain: 3 },
  { id: 'dis_education', label: 'Education/work performance', type: 'scale_0_4', respondents: ALL, domain: 3 },

  // DOMAIN 4: RISK (freq + sev, all 3)
  { id: 'risk_stress', label: 'Stress', type: 'freq_sev', respondents: ALL, domain: 4 },
  { id: 'risk_risk_taking', label: 'Risk taking behaviour', type: 'freq_sev', respondents: ALL, domain: 4 },
  { id: 'risk_selfharm', label: 'Self-harming behaviours (with no suicidal intent)', type: 'freq_sev', respondents: ALL, domain: 4 },
  { id: 'risk_suicidal', label: 'Suicidal thoughts/behaviours', type: 'freq_sev', respondents: ALL, domain: 4 },
  { id: 'risk_to_others', label: 'Risk to others', type: 'freq_sev', respondents: ALL, domain: 4 },
  { id: 'risk_from_others', label: 'Risk from others', type: 'freq_sev', respondents: ALL, domain: 4 },

  // DOMAIN 5: FACTORS AFFECTING SYMPTOMS (all 3)
  { id: 'fac_crisis_service', label: 'Service use in times of crisis', type: 'binary', respondents: ALL, domain: 5 },
  { id: 'fac_crisis_freq', label: 'Frequency of crisis service use', type: 'crisis_freq', respondents: ALL, domain: 5 },
  { id: 'fac_inpatient', label: 'Inpatient hospital stays', type: 'binary', respondents: ALL, domain: 5 },
  { id: 'fac_relapse', label: 'Relapse', type: 'binary', respondents: ALL, domain: 5 },
  { id: 'fac_ongoing_tx', label: 'Ongoing treatment', type: 'binary', respondents: ALL, domain: 5 },
  { id: 'fac_drug_alcohol', label: 'Drug and alcohol misuse', type: 'binary', respondents: ALL, domain: 5 },
  { id: 'fac_comorbidity', label: 'Medical comorbidity', type: 'binary', respondents: ALL, domain: 5 },
  { id: 'fac_side_effects', label: 'Side effects', type: 'binary', respondents: ALL, domain: 5 },

  // DOMAIN 6: HEALTH SYSTEM FACTORS (clinician only, 0-4)
  { id: 'hs_financial', label: 'Negative financial implications of transition', type: 'scale_0_4', respondents: CL_ONLY, domain: 6 },
  { id: 'hs_camhs_links', label: 'Poor CAMHS-AMHS links', type: 'scale_0_4', respondents: CL_ONLY, domain: 6 },
  { id: 'hs_local_services', label: 'Lack of appropriate local available services', type: 'scale_0_4', respondents: CL_ONLY, domain: 6 },
  { id: 'hs_alt_services', label: 'Poor extent of alternative services available', type: 'scale_0_4', respondents: CL_ONLY, domain: 6 },
  { id: 'hs_gp', label: "GP not familiar with treating young person's condition", type: 'scale_0_4', respondents: CL_ONLY, domain: 6 },

  // DOMAIN 7: BARRIERS TO FUNCTIONING (0-3, all 3)
  { id: 'bar_independence', label: 'Inability to act independently', type: 'scale_0_3', respondents: ALL, domain: 7 },
  { id: 'bar_condition', label: 'Poor condition understanding', type: 'scale_0_3', respondents: ALL, domain: 7 },
  { id: 'bar_service_knowledge', label: 'Poor service access knowledge', type: 'scale_0_3', respondents: ALL, domain: 7 },
  { id: 'bar_motivation', label: 'Poor motivation', type: 'scale_0_3', respondents: ALL, domain: 7 },
  { id: 'bar_medication', label: 'Poor medication adherence', type: 'scale_0_3', respondents: ALL, domain: 7 },
  { id: 'bar_social_support', label: 'Poor social support', type: 'scale_0_3', respondents: ALL, domain: 7 },
  { id: 'bar_carers', label: 'Not wanting carers involved', type: 'scale_0_3', respondents: ALL, domain: 7 },
  { id: 'bar_team_relations', label: 'Difficulty forming team relations', type: 'scale_0_3', respondents: ALL, domain: 7 },
  { id: 'bar_history', label: 'Difficulty repeating history', type: 'scale_0_3', respondents: ALL, domain: 7 },

  // DOMAIN 8: OTHER LIFE CHANGES (YP + parent only, -1/0/+1)
  { id: 'lc_family', label: 'Family relationships', type: 'life_change', respondents: YP_PARENT, domain: 8 },
  { id: 'lc_friends', label: 'Relationships with friends and partner', type: 'life_change', respondents: YP_PARENT, domain: 8 },
  { id: 'lc_house', label: 'Moving house', type: 'life_change', respondents: YP_PARENT, domain: 8 },
  { id: 'lc_school', label: 'School/college/work', type: 'life_change', respondents: YP_PARENT, domain: 8 },
  { id: 'lc_illness_death', label: 'Illness/death', type: 'life_change', respondents: YP_PARENT, domain: 8 },
  { id: 'lc_police', label: 'Police involvement', type: 'life_change', respondents: YP_PARENT, domain: 8 },
  { id: 'lc_pregnancy', label: 'Pregnancy', type: 'life_change', respondents: YP_PARENT, domain: 8 },
  { id: 'lc_other', label: 'Other', type: 'life_change', respondents: YP_PARENT, domain: 8 },
]

export const DOMAIN_LABELS: Record<number, string> = {
  1: 'Symptoms',
  2: 'Overall Illness',
  3: 'Overall Disruption',
  4: 'Risk',
  5: 'Factors Affecting Symptoms',
  6: 'Health System Factors',
  7: 'Barriers to Functioning',
  8: 'Other Life Changes',
}

export function getQuestionsForRespondent(respondent: Respondent): Question[] {
  return QUESTIONS.filter(q => q.respondents.includes(respondent))
}
