import { useMemo, useState } from 'react'
import Container from '../components/layout/Container.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Card, CardBody, CardHeader } from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Alert from '../components/ui/Alert.jsx'
import { TextInput } from '../components/ui/Field.jsx'
import { authApi, centreApi, queueApi } from '../api/services.js'
import { useApi, useMutation } from '../hooks/useApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { readStorage, writeStorage, removeStorage, STORAGE_KEYS } from '../utils/storage.js'

const statusLabel = { waiting: 'Waiting', called: 'Called', serving: 'Serving', served: 'Completed', skipped: 'Skipped' }

function statusClass(status) {
  return {
    waiting: 'bg-grain-50 text-grain-700',
    called: 'bg-steel-50 text-steel-600',
    serving: 'bg-brand-50 text-brand-700',
    served: 'bg-brand-50 text-brand-700',
    skipped: 'bg-paper text-muted',
  }[status] || 'bg-paper text-muted'
}

function todayLabel() {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
}

function isOfficerSession() {
  return readStorage(STORAGE_KEYS.ROLE) === 'officer' && Boolean(readStorage(STORAGE_KEYS.TOKEN))
}

// clearFarmerSession is AuthContext's own logout() -- it only clears storage
// and React state, it never navigates, so calling it here keeps the officer
// on /centre instead of bouncing them anywhere.
function OfficerLogin({ onLoggedIn, clearFarmerSession }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await authApi.officerLogin({ username, password })
      // An officer signing in must not leave a stale farmer session behind
      // (same TOKEN key is shared) -- clear it before writing the officer's.
      await clearFarmerSession()
      writeStorage(STORAGE_KEYS.TOKEN, result.access)
      writeStorage(STORAGE_KEYS.REFRESH_TOKEN, result.refresh)
      writeStorage(STORAGE_KEYS.ROLE, 'officer')
      onLoggedIn()
    } catch (requestError) {
      setError(requestError.message || 'Could not sign in. Check the officer credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="max-w-xl py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Centre officer sign in</h1>
      <p className="mt-1.5 text-[15px] text-muted">
        Sign in to see today’s farmers and manage the queue at your procurement centre.
      </p>

      <Card className="mt-6">
        <CardHeader title="Officer credentials" />
        <CardBody>
          <form onSubmit={submit} noValidate>
            {error ? (
              <Alert tone="danger" className="mb-4">
                {error}
              </Alert>
            ) : null}

            <TextInput
              label="Username"
              name="username"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />

            <TextInput
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-5"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <Button type="submit" size="lg" fullWidth className="mt-5" loading={loading}>
              {loading ? 'Signing in...' : 'Sign in to centre'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </Container>
  )
}

function ActionButton({ children, onClick }) {
  return <button type="button" onClick={onClick} className="border border-line px-2.5 py-1.5 text-xs font-bold text-brand-700 hover:border-brand-600 hover:bg-brand-50">{children}</button>
}

export default function CentrePortal() {
  const { logout: clearFarmerSession } = useAuth()
  const [session, setSession] = useState(isOfficerSession)
  const [centreId, setCentreId] = useState('')
  const [query, setQuery] = useState('')
  const centresQuery = useApi(() => centreApi.officerList(), [], { skip: !session })
  const centres = centresQuery.data || []
  const selectedCentreId = centreId || centres[0]?.id || ''
  const summaryQuery = useApi(() => centreApi.dailySummary(selectedCentreId), [selectedCentreId], { skip: !selectedCentreId || !session, pollMs: 15000 })
  const callNext = useMutation(() => centreApi.callNext(selectedCentreId))
  const queueAction = useMutation((action, entryId) => queueApi[action](entryId))

  const rows = useMemo(() => {
    const value = query.trim().toLowerCase()
    const all = summaryQuery.data || []
    if (!value) return all
    return all.filter((row) => `${row.farmer.full_name} ${row.farmer.phone_number} ${row.reference_code}`.toLowerCase().includes(value))
  }, [query, summaryQuery.data])

  const refresh = () => summaryQuery.refetch()
  const runAction = async (action, entryId) => {
    const result = await queueAction.mutate(action, entryId)
    if (result.ok) refresh()
  }
  const signOut = () => {
    removeStorage(STORAGE_KEYS.TOKEN)
    removeStorage(STORAGE_KEYS.REFRESH_TOKEN)
    removeStorage(STORAGE_KEYS.ROLE)
    setSession(false)
  }

  if (!session) return <OfficerLogin onLoggedIn={() => setSession(true)} clearFarmerSession={clearFarmerSession} />

  const centre = centres.find((item) => String(item.id) === String(selectedCentreId))
  const summaryRows = summaryQuery.data || []
  const waiting = summaryRows.filter((row) => row.queue_status === 'waiting').length
  const active = summaryRows.find((row) => ['called', 'serving'].includes(row.queue_status))
  const completed = summaryRows.filter((row) => row.queue_status === 'served').length

  if (centresQuery.error || summaryQuery.error) {
    const error = centresQuery.error || summaryQuery.error
    return (
      <Container className="py-12">
        <div className="mx-auto max-w-xl border border-danger-100 bg-danger-50 p-6">
          <h1 className="text-xl font-bold text-danger-600">Centre data could not be loaded</h1>
          <p className="mt-2 text-sm text-danger-600">{error.message}</p>
          <Button
            variant="solidDanger"
            className="mt-5"
            onClick={() => {
              centresQuery.refetch()
              summaryQuery.refetch()
            }}
          >
            Try again
          </Button>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-7">
      <PageHeader
        title="Procurement centre desk"
        description="Today’s registered farmers and live queue at your procurement centre."
        actions={
          <>
            <label className="text-sm text-muted">
              Centre
              <select
                value={selectedCentreId}
                onChange={(event) => setCentreId(event.target.value)}
                className="ml-2 border border-line bg-surface px-2 py-1.5 font-semibold text-ink outline-none focus:border-brand-600"
              >
                {centres.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="neutral" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </>
        }
      />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-700">{todayLabel()}</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">{centre?.name || 'Loading centre'}</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => callNext.mutate().then(refresh)} loading={callNext.loading} disabled={waiting === 0}>
            {callNext.loading ? 'Calling...' : 'Call next farmer'}
          </Button>
          <Button variant="neutral" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="border border-line bg-surface p-4">
          <p className="text-sm text-muted">Farmers today</p>
          <p className="mt-2 text-3xl font-bold tnum">{summaryRows.length}</p>
        </div>
        <div className="border border-line bg-surface p-4">
          <p className="text-sm text-muted">Waiting in queue</p>
          <p className="mt-2 text-3xl font-bold text-grain-700 tnum">{waiting}</p>
        </div>
        <div className="border border-line bg-surface p-4">
          <p className="text-sm text-muted">Completed</p>
          <p className="mt-2 text-3xl font-bold text-brand-700 tnum">{completed}</p>
        </div>
      </div>

      <section className="mt-7 border border-line bg-surface">
        <div className="flex flex-col gap-4 border-b border-line px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold">Today’s farmer list</h3>
            <p className="mt-1 text-sm text-muted">Token appears after check-in.</p>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search farmer, phone or booking"
            className="border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-brand-600 lg:w-72"
          />
        </div>
        {active ? (
          <div className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-brand-500 bg-brand-50 px-4 py-3">
            <p className="text-sm">
              <span className="font-bold">Now active:</span> {active.farmer.full_name} · Token {active.token_number || '-'}
            </p>
            <span className="text-xs font-bold uppercase text-brand-700">{statusLabel[active.queue_status]}</span>
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-paper text-xs uppercase tracking-[0.08em] text-muted">
              <tr>
                <th className="px-5 py-3">Farmer</th>
                <th className="px-3 py-3">Booking</th>
                <th className="px-3 py-3">Token</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Slot</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-paper">
                  <td className="px-5 py-4">
                    <p className="font-bold">{row.farmer.full_name}</p>
                    <p className="mt-0.5 text-xs text-muted tnum">{row.farmer.phone_number}</p>
                  </td>
                  <td className="px-3 py-4 font-semibold text-brand-700 tnum">{row.reference_code}</td>
                  <td className="px-3 py-4 text-lg font-bold tnum">{row.token_number ? `#${row.token_number}` : '-'}</td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold ${statusClass(row.queue_status)}`}>
                      {row.queue_status ? statusLabel[row.queue_status] : 'Booked'}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-muted tnum">
                    {row.slot.start_time.slice(0, 5)}-{row.slot.end_time.slice(0, 5)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      {row.queue_entry_id && row.queue_status === 'called' ? (
                        <ActionButton onClick={() => runAction('serve', row.queue_entry_id)}>Start</ActionButton>
                      ) : null}
                      {row.queue_entry_id && row.queue_status === 'serving' ? (
                        <ActionButton onClick={() => runAction('complete', row.queue_entry_id)}>Complete</ActionButton>
                      ) : null}
                      {row.queue_entry_id && ['waiting', 'called'].includes(row.queue_status) ? (
                        <ActionButton onClick={() => runAction('skip', row.queue_entry_id)}>Skip</ActionButton>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? <p className="px-5 py-10 text-center text-sm text-muted">No farmers match this search.</p> : null}
        </div>
      </section>
    </Container>
  )
}
