import { useEffect, useRef, useState } from 'react'
import Icon from '../ui/Icon.jsx'
import { useI18n } from '../../i18n/I18nProvider.jsx'
import { translate } from '../../i18n/translate.js'
import { prefersReducedMotion } from '../../utils/viewTransition.js'

const CYCLE_MS = 2200
const LEAVE_MS = 420

/**
 * The first thing a new visitor sees: pick one of five languages. Opens
 * again from the language button in the masthead or the profile page.
 *
 * Before a language is chosen the page cannot know which one to speak, so the
 * headline cycles "Choose your language" through all five scripts, and each
 * tile leads with the first vowel of its script.
 */
export default function LanguageGate() {
  const { languages, lang, hasChosen, pickerOpen, closePicker, setLanguage } = useI18n()
  const [leaving, setLeaving] = useState(false)
  const [cycleIndex, setCycleIndex] = useState(0)
  const firstTile = useRef(null)

  const visible = pickerOpen || leaving

  // Cycle the headline through the scripts (static under reduced motion).
  useEffect(() => {
    if (!pickerOpen || hasChosen || prefersReducedMotion()) return undefined
    const id = setInterval(() => setCycleIndex((index) => (index + 1) % languages.length), CYCLE_MS)
    return () => clearInterval(id)
  }, [pickerOpen, hasChosen, languages.length])

  useEffect(() => {
    if (!pickerOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstTile.current?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape' && hasChosen) closePicker()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [pickerOpen, hasChosen, closePicker])

  if (!visible) return null

  // Once a language is known, speak it; before that, rotate through all five.
  const headingLang = hasChosen ? lang : languages[cycleIndex].code

  const choose = (code) => {
    setLanguage(code, { animate: false })
    if (prefersReducedMotion()) {
      closePicker()
      return
    }
    setLeaving(true)
    setTimeout(() => {
      closePicker()
      setLeaving(false)
    }, LEAVE_MS)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-gate-title"
      className={`fixed inset-0 z-[60] overflow-y-auto bg-forest-900 text-white ${
        leaving ? 'lang-gate-leave' : 'lang-gate-enter'
      }`}
    >
      <div className="mx-auto flex min-h-full w-full max-w-content flex-col px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border-2 border-white/70">
              <Icon name="wheat" className="h-6 w-6" strokeWidth={1.6} />
            </span>
            <span className="text-lg font-bold tracking-tight">Kisan Suvidha</span>
          </div>
          {hasChosen && !leaving ? (
            <button
              type="button"
              onClick={closePicker}
              className="flex h-11 w-11 items-center justify-center border border-white/30 hover:bg-white/10"
              aria-label={translate('common.close', null, lang)}
            >
              <Icon name="close" className="h-6 w-6" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col justify-center pb-8">
        <div className="mt-12 sm:mt-0">
          <h1 id="language-gate-title" className="min-h-[2.6em] text-3xl font-bold leading-tight sm:min-h-[1.4em] sm:text-[44px]">
            <span className="sr-only">Choose your language</span>
            <span key={headingLang} lang={headingLang} className="lang-cycle-word block" aria-hidden="true">
              {translate('language.chooseTitle', null, headingLang)}
            </span>
          </h1>
          <p key={`hint-${headingLang}`} lang={headingLang} className="lang-cycle-word mt-3 text-[15px] text-white/75" aria-hidden="true">
            {translate('language.chooseHint', null, headingLang)}
          </p>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-5">
          {languages.map((language, index) => {
            const selected = hasChosen && language.code === lang
            return (
              <li key={language.code}>
                <button
                  ref={(node) => {
                    if (selected || (!hasChosen && index === 0)) firstTile.current = node
                  }}
                  type="button"
                  lang={language.code}
                  onClick={() => choose(language.code)}
                  aria-label={`${language.native} (${language.english})`}
                  aria-current={selected ? 'true' : undefined}
                  className={`group flex w-full items-center gap-4 border-2 px-4 py-3 text-left transition-colors duration-150 sm:min-h-[210px] sm:flex-col sm:items-start sm:justify-between sm:py-5 ${
                    selected
                      ? 'border-grain-500 bg-white/10'
                      : 'border-white/25 hover:border-white hover:bg-white/5'
                  }`}
                >
                  <span className="w-14 shrink-0 text-5xl font-semibold leading-none text-white/90 sm:w-auto sm:text-6xl" aria-hidden="true">
                    {language.glyph}
                  </span>
                  <span className="min-w-0 flex-1 sm:flex-none">
                    <span className="block text-xl font-bold">{language.native}</span>
                    <span className="mt-0.5 block text-sm text-white/70" lang="en">
                      {language.english}
                    </span>
                    <span
                      className={`mt-2 items-center gap-1 text-sm font-medium text-[#EFD48C] ${selected ? 'flex' : 'hidden sm:flex'}`}
                    >
                      {selected ? (
                        <>
                          <Icon name="check" className="h-4 w-4" strokeWidth={2.4} />
                          {translate('language.current', null, language.code)}
                        </>
                      ) : (
                        <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                          {translate('language.continueIn', null, language.code)}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        </div>
      </div>
    </div>
  )
}
