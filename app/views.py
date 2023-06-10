from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
import time
import json
from .models import *
from django.views.decorators.csrf import csrf_exempt
# Create your views here.

def getToken(request):

    appId = 'ebd43be6a3bc41d18c1185ed57a0159e'
    appCertificate = '0670b413234f4a0b839476f79582039f'
    channelName = request.GET.get('channel')
    uid = random.randint(1,230)

    expirationTime = 3600*24 #24 hours
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTime
    role = 1 # host 2 for guest

    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token':token,'uid':uid},safe=False)

def home(request):
    return render(request,'lobby.html',{})

def room(request):
    return render(request,'room.html',{})

@csrf_exempt
def createUser(request):
    data = json.loads(request.body)
    member,created = RoomMember.objects.get_or_create(
        name = data['name'],
        uid = data['UID'],
        roomName = data['roomName']
    )
    return JsonResponse({'name':data['name']},safe=False)


def getMember(request):
    uid = request.GET.get('UID')
    roomName = request.GET.get('room_name')

    member = RoomMember.objects.get(uid=uid,roomName = roomName)
    name = member.name
    return JsonResponse({'name':name},safe=False)


@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)
    name = data['name']
    uid = data['UID']
    roomName = data['roomName']
    member = RoomMember.objects.get(name=name,uid=uid,roomName = roomName)
    member.delete()
    return JsonResponse('member Deleted',safe=False)
