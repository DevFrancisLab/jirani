from django.contrib import admin
from django.urls import path
from jirani_core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('webhooks/whatsapp/', views.whatsapp_webhook, name='whatsapp-webhook'),
    path('api/overview/', views.overview), path('api/developments/', views.developments),
    path('api/developments/<int:development_id>/', views.development_detail),
    path('api/concerns/', views.concerns), path('api/map/', views.map_data), path('api/insights/', views.insights),
]
