import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader.jsx'
import { TextInput } from '../components/ui/Field.jsx'
import { EmptyState, ErrorState, SkeletonRows } from '../components/ui/States.jsx'
import CentreCard from '../components/farmer/CentreCard.jsx'
import Button from '../components/ui/Button.jsx'
import Icon from '../components/ui/Icon.jsx'
import { centreApi } from '../api/services.js'
import { useApi } from '../hooks/useApi.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import { useI18n } from '../i18n/I18nProvider.jsx'

/**
 * The backend has no distance, crop-catalogue or wait-time data per centre —
 * just identity and contact info — so this only searches those fields
 * client-side rather than filtering/sorting on the server.
 */
export default function Centres() {
  const { t, tp } = useI18n()
  useDocumentTitle(t('centres.docTitle'))
  const [search, setSearch] = useState('')

  const { data: centres, loading, error, refetch } = useApi(() => centreApi.list(), [], { pollMs: 60000 })

  const filtered = useMemo(() => {
    const list = centres || []
    const query = search.trim().toLowerCase()
    if (!query) return list
    return list.filter((centre) =>
      [centre.name, centre.code, centre.district, centre.state, centre.address]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query)),
    )
  }, [centres, search])

  return (
    <>
      <PageHeader
        title={t('centres.title')}
        description={t('centres.lead')}
        actions={
          <Button variant="neutral" size="sm" onClick={() => refetch()} icon={<Icon name="refresh" className="h-4 w-4" />}>
            {t('common.refresh')}
          </Button>
        }
      />

      <div className="mb-5 border border-line bg-surface px-4 py-4">
        <TextInput
          label={t('centres.searchLabel')}
          name="search"
          placeholder={t('centres.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && !centres ? <SkeletonRows rows={3} /> : null}
      {error && !centres ? <ErrorState error={error} onRetry={refetch} title={t('centres.failed')} /> : null}

      {centres ? (
        filtered.length === 0 ? (
          <EmptyState
            icon="map-pin"
            title={t('centres.noMatch')}
            description={t('centres.noMatchText')}
            action={
              search ? (
                <Button variant="secondary" onClick={() => setSearch('')}>
                  {t('centres.clear')}
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <p className="mb-3 text-[15px] text-muted tnum">
              {tp('centres.found', filtered.length)}
            </p>
            <div className="space-y-4">
              {filtered.map((centre) => (
                <CentreCard key={centre.id} centre={centre} />
              ))}
            </div>
          </>
        )
      ) : null}
    </>
  )
}
