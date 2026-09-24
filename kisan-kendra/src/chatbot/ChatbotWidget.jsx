import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/I18nProvider.jsx'
import {
  CHATBOT_TRANSLATIONS,
  getFaqsForLang,
  getBotResponse,
  getProcessGuideStep,
  getSupportedLang,
} from './knowledgeBase.js'
import Icon from '../components/ui/Icon.jsx'

const SUPPORTED_LANGUAGES = [
  { code: 'en', native: 'English', label: 'English' },
  { code: 'hi', native: 'हिन्दी', label: 'Hindi' },
  { code: 'kn', native: 'ಕನ್ನಡ', label: 'Kannada' },
  { code: 'ta', native: 'தமிழ்', label: 'Tamil' },
  { code: 'te', native: 'తెలుగు', label: 'Telugu' },
]

export default function ChatbotWidget() {
  const navigate = useNavigate()
  const { lang, setLanguage } = useI18n()

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('process') // 'process' | 'faq'
  const [messages, setMessages] = useState([])
  const [inputQuery, setInputQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const currentTrans = CHATBOT_TRANSLATIONS[lang] || CHATBOT_TRANSLATIONS.en

  const changeLanguage = (newLang) => {
    const safeLang = getSupportedLang(newLang)
    setLanguage(safeLang)
  }

  // Speech Synthesis Readout
  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
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
      console.warn('Speech error:', err)
    }
  }

  // Speech Recognition (Speech-to-Text Voice Input)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Voice input (Speech-to-Text) is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      const langMap = {
        en: 'en-IN',
        hi: 'hi-IN',
        kn: 'kn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
      }
      recognition.lang = langMap[lang] || 'en-IN'
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('')
        setInputQuery(transcript)
      }

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (err) {
      console.error('Speech recognition error:', err)
      setIsListening(false)
    }
  }

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
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6 select-none print:hidden">
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

      {isOpen && (
        <div className="flex h-[560px] w-[370px] max-w-[calc(100vw-32px)] flex-col rounded-2xl border border-emerald-800/20 bg-paper text-stone-900 shadow-2xl transition-all duration-300 dark:bg-stone-900 dark:text-stone-100 dark:border-stone-800 sm:w-[410px]">
          {/* Header */}
          <div className="flex flex-col rounded-t-2xl bg-gradient-to-r from-emerald-800 to-emerald-900 px-4 py-3 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-950/60 ring-2 ring-amber-400/60">
                  <span className="text-xl">🌾</span>
                </div>
                <div>
                  <h2 className="text-base font-bold leading-tight">{currentTrans.botTitle}</h2>
                  <p className="text-xs text-emerald-200">{currentTrans.botSubtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`rounded-lg p-1.5 transition-colors ${
                    speechEnabled ? 'bg-amber-500 text-stone-900 font-bold' : 'text-emerald-200 hover:bg-emerald-700'
                  }`}
                  title={speechEnabled ? currentTrans.speechOn : currentTrans.speechOff}
                >
                  {speechEnabled ? '🔊' : '🔇'}
                </button>

                <select
                  value={lang}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="rounded-lg bg-emerald-950/90 px-2 py-1 text-xs font-semibold text-emerald-100 border border-emerald-600/60 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  title="Select Language / भाषा चुनें"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-emerald-900 text-white">
                      {l.native}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleClearChat}
                  className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-700 hover:text-white transition-colors"
                  title={currentTrans.clearChat}
                >
                  <Icon name="refresh" className="h-4 w-4" />
                </button>

                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
                    setIsOpen(false)
                  }}
                  className="rounded-lg p-1.5 text-emerald-200 hover:bg-emerald-700 hover:text-white transition-colors"
                  title="Close Chat"
                >
                  <Icon name="close" className="h-5 w-5" />
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

          {/* Interactive Guided Process Panel */}
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

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-emerald-50/20 dark:bg-stone-900/40">
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
              <div className="flex items-center gap-2 text-xs text-stone-500 italic">
                <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
                {currentTrans.typing}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-emerald-800/10 bg-paper p-2">
            {isListening && (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-rose-50 px-3 py-1.5 text-xs text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
                  🎙️ Listening... Speak now ({SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.native || 'your language'})
                </span>
                <button
                  type="button"
                  onClick={toggleListening}
                  className="font-bold underline text-rose-800 dark:text-rose-200"
                >
                  Stop
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (isListening && recognitionRef.current) {
                  try {
                    recognitionRef.current.stop()
                  } catch (err) {}
                  setIsListening(false)
                }
                handleSend()
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isListening ? 'Listening... speak into mic' : currentTrans.placeholder}
                className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 shadow-md'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-stone-800 dark:text-emerald-400 dark:hover:bg-stone-700'
                }`}
                title={isListening ? 'Stop Listening' : 'Voice Input (Speech to Text)'}
              >
                {isListening ? '🎙️' : '🎤'}
              </button>
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white transition-all hover:bg-emerald-800 disabled:opacity-40 active:scale-95"
                title={currentTrans.send}
              >
                <Icon name="arrow-right" className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
