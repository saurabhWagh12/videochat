//const AgoraRTC_N4172 = require("../assets/AgoraRTC_N-4.17.2");

// const APP_ID = 'ebd43be6a3bc41d18c1185ed57a0159e';
const APP_ID = 'ebd43be6a3bc41d18c1185ed57a0159e';
const CHANNEL = sessionStorage.getItem('room');
const TOKEN = sessionStorage.getItem('token');
let UID = Number(sessionStorage.getItem('UID'));

let NAME = sessionStorage.getItem('name');

const client = AgoraRTC.createClient({mode:'rtc',codec:'vp8'});

let localTracks = []
let remoteUsres = {}

let joinAndDisplayLocalStream = async ()=>{
    document.getElementById('room-name').innerText = CHANNEL
    client.on('user-published',handleUserJoined)
    client.on('user-left',handleUserLeft)

    try{
        await client.join(APP_ID,CHANNEL,TOKEN,UID);

    }catch(error){
        // console.error(error);
        window.open('/','_self');
    }
   
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(); //at index 0->audio track and at index 1->video track
    let member = await createMember();

    let player =`<div class="video-container" id="user-container-${UID}">
                    <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                    <div class="video-player" id="user-${UID}"></div> 
                    </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend',player);

    localTracks[1].play(`user-${UID}`);

    await client.publish([localTracks[0],localTracks[1]]);

} 

//Adding more users
let handleUserJoined = async(user,mediaType)=>{
    remoteUsres[user.uid] = user;
    await client.subscribe(user,mediaType)

    if(mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`);
        if(player!=null){
            player.remove()
        }

        
        // let member = await getMember(user)
        let member = await getMember(user)

        player =`<div class="video-container" id="user-container-${user.uid}">
                    <div class="username-wrapper"><span class="user-name">${member.name}</span></div>
                    <div class="video-player" id="user-${user.uid}"></div> 
                </div>`

        document.getElementById('video-streams').insertAdjacentHTML('beforeend',player);

        user.videoTrack.play(`user-${user.uid}`);
    }

    if(mediaType==='audio'){
        user.audioTrack.play();
    }
}


//User Leaving:
let handleUserLeft = async(user)=>{
    delete remoteUsres[user.uid]  
    document.getElementById(`user-container-${user.uid}`).remove()
}


// Leave Control Button
let leaveAndRemoveLocalStreams = async()=>{
    for(let i = 0;i<localTracks.length;i++){
        localTracks[i].stop();
        localTracks[i].close();
    }

    await client.leave()
    deleteMember()
    window.open('/','_self');
}

// Camera Toggle Button
let toggleCamera = async(e)=>{
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false);
        e.target.style.backgroundColor = '#fff'; 
    }else{
        await localTracks[1].setMuted(true);
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'; 
    }
}

// Microphone Toggle Button
let toggleMic = async(e)=>{
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false);
        e.target.style.backgroundColor = '#fff'; 
    }else{
        await localTracks[0].setMuted(true);
        e.target.style.backgroundColor = 'rgb(255, 80, 80, 1)'; 
    }
}


let createMember = async()=>{
    let response = await fetch('/createMember/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME,'roomName':CHANNEL,'UID':UID})
    });
    let member = await response.json()
    return member;
}

let getMember = async(user)=>{
    let response = await fetch(`/getMember/?UID=${user.uid}&room_name=${CHANNEL}`)
    let member = await response.json()
    return member;
}

let deleteMember = async()=>{
    let response = await fetch('/deleteMember/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({'name':NAME,'roomName':CHANNEL,'UID':UID})
    });
    let member = await response.json()
}

joinAndDisplayLocalStream();


//Button Controls : 
document.getElementById('leave-btn').addEventListener('click',leaveAndRemoveLocalStreams);
document.getElementById('camera-btn').addEventListener('click',toggleCamera);
document.getElementById('mic-btn').addEventListener('click',toggleMic);


//window close
window.addEventListener('beforeunload',deleteMember)
