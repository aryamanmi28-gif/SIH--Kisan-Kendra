import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CHATBOT_TRANSLATIONS,
  FARMER_PROCESS_GUIDES,
} from './knowledge_base.js'
import {
  getFaqsForLang,
  getBotResponse,
  getProcessGuideStep,
  getSupportedLang,
} from './bot_engine.js'

// Language definitions list
const SUPPORTED_LANGUAGES = [
  { code: 'en', native: 'English', label: 'English' },
  { code: 'hi', native: 'हिन्दी', label: 'Hindi' },
  { code: 'kn', native: 'ಕನ್ನಡ', label: 'Kannada' },
  { code: 'ta', native: 'தமிழ்', label: 'Tamil' },
  { code: 'te', native: 'తెలుగు', label: 'Telugu' },
]

export default function ChatbotWidget({ defaultLang = 'en', onLangChange = null }) {
  let navigate
  try {
    navigate = useNavigate()
  } catch (e) {
    navigate = null
  }

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('kk.ui.language') || defaultLang
  })

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('process') // 'process' | 'faq'
  const [messages, setMessages] = useState([])
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const messagesEndRef = useRef(null)

  const currentTrans = CHATBOT_TRANSLATIONS[lang] || CHATBOT_TRANSLATIONS.en

  // Synchronize language with local storage & external app state
  const changeLanguage = (newLang) => {
    const safeLang = getSupportedLang(newLang)
    setLang(safeLang)
    localStorage.setItem('kk.ui.language', safeLang)
    if (onLangChange) onLangChange(safeLang)
  }

  // Voice speech synthesis helper
  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel() // Stop ongoing speech
      const cleanText = text.replace(/[\n\r📌📜🏛️🏦✅📞📧🏢🌾1️⃣2️⃣3️⃣4️⃣5️⃣➔]/g, ' ')
      const utterance = new SpeechSynthesisUtterance(cleanText)
      
      const langMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        kn: 'kn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
      }
      utterance.lang = langMap[lang] || 'en-IN'
      utterance.rate = 0.95
      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('Speech synthesis error:', err)
    }
  }

  // Initialize messages on load or language change
  useEffect(() => {
    const defaultFaqs = getFaqsForLang(lang)
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'bot',
        text: currentTrans.welcomeMessage,
        suggestions: defaultFaqs.slice(0, 4),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }, [lang])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      scrollToBottom()
    }
  }, [isOpen, messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSend = (textToSend) => {
    const query = (textToSend || inputQuery).trim()
    if (!query) return

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: time,
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInputQuery('')
    setIsTyping(true)
    scrollToBottom()

    setTimeout(() => {
      const response = getBotResponse(query, lang)
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.text,
        actionLink: response.actionLink,
        actionText: response.actionText,
        suggestions: response.suggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
      scrollToBottom()
      speakText(response.text)
    }, 350)
  }

  const handleProcessStepClick = (stepId) => {
    const guide = getProcessGuideStep(stepId, lang)
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: guide.title,
      timestamp: time,
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)
    scrollToBottom()

    setTimeout(() => {
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: `${guide.title}\n\n${guide.details}`,
        actionLink: guide.actionLink,
        actionText: guide.actionText,
        suggestions: getFaqsForLang(lang).slice(0, 3),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
      scrollToBottom()
      speakText(botMsg.text)
    }, 300)
  }

  const handleSuggestionClick = (faqItem) => {
    const questionText = typeof faqItem === 'string' ? faqItem : faqItem.question
    handleSend(questionText)
  }

  const handleClearChat = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    const defaultFaqs = getFaqsForLang(lang)
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'bot',
        text: currentTrans.welcomeMessage,
        suggestions: defaultFaqs.slice(0, 4),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const handleActionNavigate = (path) => {
    if (navigate && path) {
      setIsOpen(false)
      navigate(path)
    } else {
      window.location.hash = path
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6 select-none print:hidden font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-2xl transition-all duration-300 hover:bg-emerald-800 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/40"
          aria-label="Open Kisan Sahayak Chatbot Assistant"
          title="Kisan Sahayak FAQ & Process Helper"
        >
          <div className="relative">
            <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🌾</span>
            {hasUnread && (
              <span className="absolute -right-2 -top-2 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-500"></span>
              </span>
            )}
          </div>
        </button>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div className="flex h-[560px] w-[370px] max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-emerald-800/20 bg-white text-stone-900 shadow-2xl transition-all duration-300 dark:bg-stone-900 dark:text-stone-100 dark:border-stone-800 sm:w-[410px]">
          
          {/* Header */}
          <div className="flex flex-col rounded-t-2xl bg-gradient-to-r from-emerald-800 to-emerald-900 px-4 py-3 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-950/60 ring-2 ring-amber-400/60">
                  <span className="text-xl">🌾</span>
                </div>
                <div>
                  <h2 className="text-base font-bold leading-tight flex items-center gap-1.5">
                    {currentTrans.botTitle}
                  </h2>
                  <p className="text-xs text-emerald-200">{currentTrans.botSubtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Voice Readout Toggle */}
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`rounded-lg p-1.5 transition-colors ${
                    speechEnabled ? 'bg-amber-500 text-stone-900 font-bold' : 'text-emerald-200 hover:bg-emerald-700'
                  }`}
                  title={speechEnabled ? currentTrans.speechOn : currentTrans.speechOff}
                >
                  {speechEnabled ? '🔊' : '🔇'}
                </button>

                {/* Multi-Language Selector Dropdown */}
                <select
                  value={lang}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="rounded-lg bg-emerald-950/90 px-2 py-1 text-xs font-semibold text-emerald-100 border border-emerald-600/60 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  title="Select Language / भाषा चुनें"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-emerald-900 text-white">
                      {l.native} ({l.code.toUpperCase()})
                    </option>
                  ))}
                </select>

                {/* Clear Chat */}
                <button
                  onClick={handleClearChat}
                  className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-700 hover:text-white transition-colors"
                  title={currentTrans.clearChat}
                >
                  🔄
                </button>

                {/* Close Window */}
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
                    setIsOpen(false)
                  }}
                  className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-700 hover:text-white transition-colors text-lg leading-none"
                  title="Close Chat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sub-Navigation Mode Bar */}
            <div className="mt-3 flex gap-2 rounded-xl bg-emerald-950/50 p-1">
              <button
                onClick={() => setActiveTab('process')}
                className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-all ${
                  activeTab === 'process'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
                }`}
              >
                {currentTrans.processTabLabel}
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-all ${
                  activeTab === 'faq'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-900/50'
                }`}
              >
                {currentTrans.faqTabLabel}
              </button>
            </div>
          </div>

          {/* Interactive Guided Process Panel (shown when tab is 'process') */}
          {activeTab === 'process' && (
            <div className="border-b border-emerald-800/10 bg-emerald-50/50 px-3 py-2 dark:bg-stone-800/50">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-400">
                {currentTrans.guideTitle}
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {Object.entries(currentTrans.guideSteps).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleProcessStepClick(key)}
                    className="rounded-lg border border-emerald-600/30 bg-white px-2 py-1.5 text-left text-xs font-semibold text-emerald-900 shadow-2xs transition-all hover:border-emerald-600 hover:bg-emerald-100 hover:shadow active:scale-95 dark:bg-stone-800 dark:text-emerald-300 dark:hover:bg-stone-700"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 dark:bg-stone-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                    msg.sender === 'user'
                      ? 'rounded-br-none bg-emerald-700 text-white'
                      : 'rounded-bl-none border border-emerald-900/10 bg-white text-stone-800 dark:bg-stone-800 dark:text-stone-100 dark:border-stone-700'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Direct Action Link Button */}
                  {msg.actionLink && (
                    <button
                      onClick={() => handleActionNavigate(msg.actionLink)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-stone-950 shadow-md transition-all hover:bg-amber-400 active:scale-95"
                    >
                      {msg.actionText}
                    </button>
                  )}

                  <span
                    className={`mt-1.5 block text-[10px] ${
                      msg.sender === 'user' ? 'text-emerald-200' : 'text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* FAQ Prompt Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 w-full space-y-1.5">
                    <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
                      {currentTrans.suggestedTopics}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(item)}
                          className="rounded-full border border-emerald-600/30 bg-white px-3 py-1 text-xs font-medium text-emerald-950 shadow-2xs transition-all hover:border-emerald-600 hover:bg-emerald-50 hover:shadow active:scale-95 dark:bg-stone-800 dark:text-emerald-300 dark:hover:bg-stone-700"
                        >
                          ❓ {typeof item === 'string' ? item : item.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 italic">
                <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
                {currentTrans.typing}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Input Bar */}
          <div className="border-t border-stone-200 bg-white p-2.5 dark:border-stone-800 dark:bg-stone-900 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={currentTrans.placeholder}
                className="flex-1 rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white font-bold transition-all hover:bg-emerald-800 disabled:opacity-40 active:scale-95 shadow-sm"
                title={currentTrans.send}
              >
                ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
