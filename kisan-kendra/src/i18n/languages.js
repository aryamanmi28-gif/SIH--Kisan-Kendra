// The five languages offered at first launch. `glyph` is the first vowel of
// each script, shown large on the chooser so a farmer can find their own
// script before reading a single word.
export const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English', glyph: 'A', intl: 'en-IN' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', glyph: 'अ', intl: 'hi-IN' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada', glyph: 'ಅ', intl: 'kn-IN' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil', glyph: 'அ', intl: 'ta-IN' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu', glyph: 'అ', intl: 'te-IN' },
]

export const DEFAULT_LANGUAGE = 'en'

export const isSupportedLanguage = (code) => LANGUAGES.some((language) => language.code === code)

export const languageMeta = (code) => LANGUAGES.find((language) => language.code === code) || LANGUAGES[0]
