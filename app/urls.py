from django.contrib import admin
from django.urls import path,include
from .views import *

urlpatterns = [
    path('',home,name="Homepage"),
    path('room/',room,name="Homepage"),
    path('getToken/',getToken),
    path('createMember/',createUser),
    path('getMember/',getMember),
    path('deleteMember/',deleteMember),

]