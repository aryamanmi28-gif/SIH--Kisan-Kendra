import ChatbotWidget from './ChatbotWidget.jsx'
import {
  CHATBOT_TRANSLATIONS,
  FAQ_DATABASE,
  FARMER_PROCESS_GUIDES,
} from './knowledge_base.js'
import {
  normalizeQuery,
  getFaqsForLang,
  getProcessGuideStep,
  getBotResponse,
} from './bot_engine.js'

export {
  ChatbotWidget,
  CHATBOT_TRANSLATIONS,
  FAQ_DATABASE,
  FARMER_PROCESS_GUIDES,
  normalizeQuery,
  getFaqsForLang,
  getProcessGuideStep,
  getBotResponse,
}

export default ChatbotWidget
