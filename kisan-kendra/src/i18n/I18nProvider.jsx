import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LANGUAGES, isSupportedLanguage, languageMeta } from './languages.js'
import {
  getLanguage,
  setCurrentLanguage,
  translate,
  translatePlural,
  translateRaw,
  translateServerMessage,
} from './translate.js'
import { readStorage, writeStorage, STORAGE_KEYS } from '../utils/storage.js'
import { runViewTransition } from '../utils/viewTransition.js'

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(getLanguage)
  // First launch: no stored choice yet, so the chooser opens before anything else.
  const [pickerOpen, setPickerOpen] = useState(() => !isSupportedLanguage(readStorage(STORAGE_KEYS.LANGUAGE)))
  const [hasChosen, setHasChosen] = useState(() => isSupportedLanguage(readStorage(STORAGE_KEYS.LANGUAGE)))

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLanguage = useCallback(
    (code, { animate = true } = {}) => {
      if (!isSupportedLanguage(code)) return
      writeStorage(STORAGE_KEYS.LANGUAGE, code)
      const apply = () => {
        setCurrentLanguage(code)
        document.documentElement.lang = code
        setLang(code)
        setHasChosen(true)
      }
      if (animate && code !== getLanguage()) runViewTransition('vt-lang', apply)
      else apply()
    },
    [],
  )

  const value = useMemo(
    () => ({
      lang,
      meta: languageMeta(lang),
      languages: LANGUAGES,
      hasChosen,
      pickerOpen,
      openPicker: () => setPickerOpen(true),
      closePicker: () => setPickerOpen(false),
      setLanguage,
      // `lang` is read so every consumer re-renders when it changes.
      t: (key, vars) => translate(key, vars, lang),
      tp: (key, count, vars) => translatePlural(key, count, vars, lang),
      tRaw: (key) => translateRaw(key, lang),
      tServer: (message) => translateServerMessage(message),
    }),
    [lang, hasChosen, pickerOpen, setLanguage],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}
