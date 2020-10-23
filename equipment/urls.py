from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('added/', views.added, name='added'),
    path('add/', views.add, name='add'),
    path('<device_id>/', views.detail, name='detail'),
]
