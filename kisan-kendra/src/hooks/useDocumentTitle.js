import { useEffect } from 'react'

const SUFFIX = 'Kisan Suvidha'

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} - ${SUFFIX}` : SUFFIX
  }, [title])
}

export default useDocumentTitle
