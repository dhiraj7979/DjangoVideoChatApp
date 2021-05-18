var stream;
var yourConn;

function hasUserMedia() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    return !!navigator.getUserMedia;
}

if (hasUserMedia) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    navigator.getUserMedia({ video: true, audio: true }, function (myStream) {
        stream = myStream;

        var video = document.querySelector('video');
        video.srcObject = stream;
        //video.src = window.URL.createObjectURL(stream); ...deprecated...

        var configuration = {
            "iceServers": [{"url": "stun:stun2.1.google.com:19302"}]
        };

        yourConn = new webkitRTCPeerConnection(configuration);

        yourConn.addStream(stream);

        yourConn.onaddStream = (e)=>{
            remoteVideo.srcObject = e.stream;
        };

        yourConn.onicecandidate = (event)=>{
            if(event.candidate){
                send({
                    type: "candidate",
                    candidate: event.candidate
                });
            }
        };

    }, function (err) {
        console.log("error");
    });

} else {
    alert("Error. WebRTC is not supported!");
}

// let j = JSON.stringify(myframe);
// console.log(j);


//Second Segment of Code

// let j = JSON.stringify(myframe);
// console.log(j);
// Script for making websocket connection...
var socket = new WebSocket('ws://localhost:8000/ws/some_url/');
// console.log("Start re baba");

// Handler activated when client/user recieves msg from the server through ws...
socket.onmessage = (event) => {


    // var data = JSON.parse(event.data);
    var data = event.data;
    console.log(data);
    var tag = document.createElement('h3');
    var text = document.createTextNode(data);
    tag.appendChild(text);
    var element = document.querySelector('#msg-container');
    element.appendChild(tag);

    // console.log("ws connection is closed...");
}

// Attempt to close the websocket...
// const ws_close_btn = document.querySelector('#ws-close-btn');
// ws_close_btn.addEventListener('click', (event) => {
//         socket.close(1000, "ws served its purpose. Then closed manually.");
// });


// Script for sending client/user msg to the server...
var user_msg = document.querySelector('#user_msg');
var send_msg_btn = document.querySelector('#send_msg_btn');

send_msg_btn.addEventListener('click', () => {
    if (user_msg.value == undefined || user_msg.value == "") {
        console.log("Message empty. Not sent." + user_msg.innerText);
    } else {
        console.log("msg needs to be sent. " + user_msg.innerText);
        socket.send(user_msg.value);
        user_msg.value = "";
    }
});