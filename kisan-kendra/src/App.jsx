import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { I18nProvider } from './i18n/I18nProvider.jsx'
import LanguageGate from './components/layout/LanguageGate.jsx'
import AppRoutes from './routes.jsx'
import ChatbotWidget from './chatbot/ChatbotWidget.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
            <ChatbotWidget />
            <LanguageGate />
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
