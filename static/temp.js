console.log(window.location);
var loc = window.location;
var wsStart = "ws://";
if(loc.protocol == "https:"){
    wsStart = "wss://";
}

// var endpoint = wsStart + loc.host + loc.pathname;
var endpoint = wsStart + loc.host + '8765';
const connection = new WebSocket(endpoint);

// Connection opened
connection.addEventListener('open', function (event) {
    connection.send('Hello Server!');
});

//console.log("ws obj: "+connection);
var name = "";

var loginInput = document.querySelector('#loginInput');
var loginBtn = document.querySelector('#loginBtn');
var otherUsernameInput = document.querySelector('#otherUsernameInput');
var connectToOtherUsernameBtn = document.querySelector('#ConnectToOtherUsernameBtn');
var connectedUser, myConnection;

//when a user clicks the login btn.
loginBtn.addEventListener("click", function(event){
    name = loginInput.value;

    if(name.length > 0){
        send({
            type: "login",
            name: name
        });
    }

})


//handle messages from the server.
connection.onmessage = function(message){
    console.log("Got message", message.data);
    var data = JSON.parse(message.data);

    switch(data.type){
        case "login":
            onLogin(data.success);
            break;
        case "offer":
            onOffer(data.offer, data.name);
            break;
        case "answer":
            onAnswer(data.answer);
            break;
        case "candidate":
            onCandidate(data.candidate);
            break;
        default:
            break;
    }
};


//when a user logs in.
function onLogin(success){
    if(success == false){
        alert("oops... try a different username.");
    } else {
        //creating a RTCPeerConnection Object

        var configuration = {
            "iceServers": [{ "url": "stun:stun.1.google.com:19302" }]
        };

        myConnection = new webkitRTCPeerConnection(configuration);
        console.log("RTCPeerConnection object was created.");
        console.log(myConnection);

        //setup ice handling
        //when the browser finds an ice candidate we send it to another peer.
        myConnection.onicecandidate = function(event) {
            if(event.candidate){
                send({
                   type: "candidate",
                   candidate: event.candidate
                });
            }
        };
    }
};


connection.onopen = function(){
    console.log("Connected.");
};

connection.onerror = function(err){
    console.log("Got error.", err);
}

//Alias for sending messages in JSON format.
function send(message) {
    if(connectedUser) {
        message.name = connectedUser;
    }

    connection.send(JSON.stringify(message));
}