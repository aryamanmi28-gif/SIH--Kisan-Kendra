/**
 * Kisan Sahayak Intelligent Bot Engine & Intent Processor
 * Performs multi-language matching, keyword scoring, fuzzy query normalization,
 * and guided process assistance.
 */

import { CHATBOT_TRANSLATIONS, FAQ_DATABASE, FARMER_PROCESS_GUIDES } from './knowledge_base.js'

/**
 * Normalizes input string for search
 */
export function normalizeQuery(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[?,./#!$%^&*;:{}=\-_`~()"'।॥]/g, '')
}

/**
 * Returns supported language code or fallback 'en'
 */
export function getSupportedLang(lang) {
  return CHATBOT_TRANSLATIONS[lang] ? lang : 'en'
}

/**
 * Fetches all FAQ questions formatted for a given language
 */
export function getFaqsForLang(lang = 'en') {
  const safeLang = getSupportedLang(lang)
  return FAQ_DATABASE.map((item) => ({
    id: item.id,
    category: item.category,
    question: item.question[safeLang] || item.question.en,
    answer: item.answer[safeLang] || item.answer.en,
  }))
}

/**
 * Gets step-by-step process guide for a specific step ID (step1, step2, step3, step4, step5)
 */
export function getProcessGuideStep(stepId, lang = 'en') {
  const safeLang = getSupportedLang(lang)
  const guide = FARMER_PROCESS_GUIDES[stepId] || FARMER_PROCESS_GUIDES.step1
  const trans = CHATBOT_TRANSLATIONS[safeLang]

  return {
    stepId,
    title: guide.title[safeLang] || guide.title.en,
    details: guide.details[safeLang] || guide.details.en,
    actionLink: guide.actionLink,
    actionText: trans.actionButtons[guide.actionKey] || trans.actionButtons.goToCentres,
  }
}

/**
 * Smart Response Processor: Evaluates user query and returns structured response
 */
export function getBotResponse(userQuery, lang = 'en') {
  const safeLang = getSupportedLang(lang)
  const trans = CHATBOT_TRANSLATIONS[safeLang]
  const normalized = normalizeQuery(userQuery)

  if (!normalized) {
    return {
      matched: false,
      text: trans.welcomeMessage,
      suggestions: getFaqsForLang(safeLang).slice(0, 4),
    }
  }

  // 1. Direct Step Guide Trigger Match (e.g. "step1", "step 1", "registration", "checkin", "payment status")
  if (normalized.includes('step1') || normalized.includes('step 1') || normalized.includes('register')) {
    const guide = getProcessGuideStep('step1', safeLang)
    return {
      matched: true,
      text: `${guide.title}\n\n${guide.details}`,
      actionLink: guide.actionLink,
      actionText: guide.actionText,
      suggestions: getFaqsForLang(safeLang).slice(0, 3),
    }
  }

  if (normalized.includes('step2') || normalized.includes('step 2') || normalized.includes('book slot')) {
    const guide = getProcessGuideStep('step2', safeLang)
    return {
      matched: true,
      text: `${guide.title}\n\n${guide.details}`,
      actionLink: guide.actionLink,
      actionText: guide.actionText,
      suggestions: getFaqsForLang(safeLang).slice(0, 3),
    }
  }

  if (normalized.includes('step3') || normalized.includes('step 3') || normalized.includes('gate checkin')) {
    const guide = getProcessGuideStep('step3', safeLang)
    return {
      matched: true,
      text: `${guide.title}\n\n${guide.details}`,
      actionLink: guide.actionLink,
      actionText: guide.actionText,
      suggestions: getFaqsForLang(safeLang).slice(0, 3),
    }
  }

  if (normalized.includes('step4') || normalized.includes('step 4') || normalized.includes('weighment')) {
    const guide = getProcessGuideStep('step4', safeLang)
    return {
      matched: true,
      text: `${guide.title}\n\n${guide.details}`,
      actionLink: guide.actionLink,
      actionText: guide.actionText,
      suggestions: getFaqsForLang(safeLang).slice(0, 3),
    }
  }

  if (normalized.includes('step5') || normalized.includes('step 5') || normalized.includes('dbt payment')) {
    const guide = getProcessGuideStep('step5', safeLang)
    return {
      matched: true,
      text: `${guide.title}\n\n${guide.details}`,
      actionLink: guide.actionLink,
      actionText: guide.actionText,
      suggestions: getFaqsForLang(safeLang).slice(0, 3),
    }
  }

  // 2. Direct ID or Question Exact Match
  const directMatch = FAQ_DATABASE.find((item) => {
    if (item.id === normalized) return true
    return Object.values(item.question).some(
      (q) => normalizeQuery(q) === normalized
    )
  })

  if (directMatch) {
    return {
      matched: true,
      faqId: directMatch.id,
      text: directMatch.answer[safeLang] || directMatch.answer.en,
      suggestions: FAQ_DATABASE.filter((i) => i.id !== directMatch.id)
        .slice(0, 3)
        .map((i) => ({ id: i.id, question: i.question[safeLang] || i.question.en })),
    }
  }

  // 3. Keyword Scoring across all multi-language keyword lists
  let bestScore = 0
  let bestItem = null
  const queryWords = normalized.split(/\s+/).filter((w) => w.length > 1)

  FAQ_DATABASE.forEach((item) => {
    let score = 0

    // Match keywords
    item.keywords.forEach((kw) => {
      const normKw = normalizeQuery(kw)
      if (normalized.includes(normKw)) score += 5
      queryWords.forEach((qw) => {
        if (normKw.includes(qw) || qw.includes(normKw)) score += 3
      })
    })

    // Match question texts across languages
    Object.values(item.question).forEach((qText) => {
      const normQ = normalizeQuery(qText)
      queryWords.forEach((qw) => {
        if (normQ.includes(qw)) score += 2
      })
    })

    if (score > bestScore) {
      bestScore = score
      bestItem = item
    }
  })

  if (bestScore >= 3 && bestItem) {
    let actionLink = null
    let actionText = null

    if (bestItem.id === 'booking' || bestItem.id === 'priority' || bestItem.id === 'centres') {
      actionLink = '/centres'
      actionText = trans.actionButtons.goToCentres
    } else if (bestItem.id === 'checkin' || bestItem.id === 'queue') {
      actionLink = '/queue'
      actionText = trans.actionButtons.goToQueue
    } else if (bestItem.id === 'payment' || bestItem.id === 'weighment' || bestItem.id === 'msp') {
      actionLink = '/procurement'
      actionText = trans.actionButtons.goToProcurement
    } else if (bestItem.id === 'documents') {
      actionLink = '/register'
      actionText = trans.actionButtons.goToRegister
    }

    return {
      matched: true,
      faqId: bestItem.id,
      text: bestItem.answer[safeLang] || bestItem.answer.en,
      actionLink,
      actionText,
      suggestions: FAQ_DATABASE.filter((i) => i.id !== bestItem.id)
        .slice(0, 3)
        .map((i) => ({ id: i.id, question: i.question[safeLang] || i.question.en })),
    }
  }

  // 4. Fallback response when query is unrecognised
  return {
    matched: false,
    text: trans.noMatchFound,
    suggestions: getFaqsForLang(safeLang).slice(0, 4),
  }
}
