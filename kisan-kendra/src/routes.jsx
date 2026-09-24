import { Routes, Route, Navigate } from 'react-router-dom'

import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import PublicLayout from './components/layout/PublicLayout.jsx'
import { RouterLocationProvider, useTransitionedLocation } from './components/layout/RouteTransition.jsx'

import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
// CropDetails is hidden for this prototype: the backend has no CropLot model.
// import CropDetails from './pages/CropDetails.jsx'
import Centres from './pages/Centres.jsx'
import CentreDetails from './pages/CentreDetails.jsx'
import SlotBooking from './pages/SlotBooking.jsx'
import BookingConfirmation from './pages/BookingConfirmation.jsx'
import CheckIn from './pages/CheckIn.jsx'
import QueueTracker from './pages/QueueTracker.jsx'
import ProcurementStatus from './pages/ProcurementStatus.jsx'
// PaymentStatus/PaymentDetails are hidden for this prototype: the backend has
// no standalone Payment model — payment info lives on Procurement instead.
// import PaymentStatus from './pages/PaymentStatus.jsx'
// import PaymentDetails from './pages/PaymentDetails.jsx'
import Profile from './pages/Profile.jsx'
import Help from './pages/Help.jsx'
import NotFound from './pages/NotFound.jsx'
import CentrePortal from './pages/CentrePortal.jsx'

export default function AppRoutes() {
  // Routes render `displayLocation`, which follows the router inside a page
  // transition. The route table itself is unchanged.
  const { location, displayLocation } = useTransitionedLocation()
  return (
    <RouterLocationProvider value={location}>
    <Routes location={displayLocation}>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/help" element={<Help />} />
        {/* CentrePortal manages its own officer session directly against
            localStorage (AuthContext ignores officer sessions entirely), but
            it renders inside PublicLayout like every other public page so it
            gets the same header and footer. */}
        <Route path="/centre" element={<CentrePortal />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/crops" element={<CropDetails />} /> */}
          <Route path="/centres" element={<Centres />} />
          <Route path="/centres/:centreId" element={<CentreDetails />} />
          <Route path="/book/:centreId" element={<SlotBooking />} />
          <Route path="/bookings/:bookingId" element={<BookingConfirmation />} />
          <Route path="/check-in/:bookingId" element={<CheckIn />} />
          <Route path="/queue" element={<QueueTracker />} />
          <Route path="/queue/:bookingId" element={<QueueTracker />} />
          <Route path="/procurement" element={<ProcurementStatus />} />
          {/* <Route path="/payments" element={<PaymentStatus />} /> */}
          {/* <Route path="/payments/:paymentId" element={<PaymentDetails />} /> */}
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
    </Routes>
    </RouterLocationProvider>
  )
}
