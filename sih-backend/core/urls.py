from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

router = DefaultRouter()
router.register('centres', views.ProcurementCentreViewSet, basename='centre')
router.register('bookings', views.BookingViewSet, basename='booking')
router.register('queue-entries', views.QueueEntryViewSet, basename='queue-entry')
router.register('procurements', views.ProcurementViewSet, basename='procurement')

urlpatterns = [
    path('auth/register/', views.FarmerRegistrationView.as_view(), name='farmer-register'),
    path('auth/login/', views.PhoneTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('auth/login/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/officer-login/', TokenObtainPairView.as_view(), name='officer-token-obtain-pair'),
    path('auth/me/', views.MeView.as_view(), name='farmer-me'),
    path('', include(router.urls)),
]
