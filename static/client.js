//our username
var name;
var connectedUser;

// constraints for desktop browser
var desktopConstraints = {
    video: {
        mandatory: {
            maxWidth: 800,
            maxHeight: 600
        }
    },
    audio: true
};

// Constraints for mobile browser
var mobileConstraints = {
    video: {
        mandatory: {
            maxWidth: 480,
            maxHeight: 320
        }
    },
    audio: true
};

// if a user is using a mobile browser
if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    var suitableConstraints = mobileConstraints;
} else {
    var suitableConstraints = desktopConstraints;
}

function hasUserMedia() {
    // check if the browser supports the WebRTC
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia);
}



//connecting to our signaling server
var conn = new WebSocket('ws://localhost:8000/ws/some_url/');

conn.onopen = () => {
    console.log("Connected to the signaling server.");
};

//when we got a message from a signaling server.
conn.onmessage = (msg) => {
    console.log("Got message", msg.data);

    var data = JSON.parse(msg.data);

    switch (data.type) {
        case "login":
            handleLogin(data.success);
            break;
        // when somebody wants to call us.
        case "offer":
            handleOffer(data.offer, data.name);
            break;
        case "answer":
            handleAnswer(data.answer);
            break;
        // when a remote peer sends an ice candidate to us.
        case "candidate":
            handleCandidate(data.candidate);
            break;
        case "leave":
            handleLeave();
            break;
        case "chat":
            handleChat(data.username, data.chatContent);
        default:
            break;
    }
};

conn.onerror = (err) => {
    console.log("Got error ", err);
};

// alias for sending JSON encoded messages.
function send(message) {
    // attach the other peer username to our messages.
    if (connectedUser) {
        message.name = connectedUser;
    }

    conn.send(JSON.stringify(message));
};



//*************
//UI Selectors Block
//*************


var loginPage = document.querySelector('#loginPage');
var userNameInput = document.querySelector('#usernameInput');
var loginBtn = document.querySelector('#loginBtn');

var callPage = document.querySelector('#callPage');
var callToUsernameInput = document.querySelector('#callToUsernameInput');
var callBtn = document.querySelector('#callBtn');

var hangUpBtn = document.querySelector('#hangUpBtn');

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

var chatSection = document.querySelector('#chatSection');

var yourConn;
var stream;

callPage.style.display = "none";
chatSection.style.display = "none";

// Login when the user clicks the button.
loginBtn.addEventListener("click", (event) => {
    name = userNameInput.value;

    if (name.length > 0) {
        send({
            type: "login",
            name: name
        });
    }

});


function handleLogin(success) {
    if (success == false) {
        alert("oops, try a different username.");
    } else {
        loginPage.style.display = "none";
        callPage.style.display = "block";
        chatSection.style.display = "block";


        //***************
        //Starting a peer connection.
        //***************

        if (hasUserMedia()) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            // enabling video and audio channels
            navigator.getUserMedia(suitableConstraints, (myStream) => {

                stream = myStream;

                // displaying local video stream on the page.
                localVideo.srcObject = stream;

                // using Google public stun server.
                var configuration = {
                    "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
                };

                yourConn = new webkitRTCPeerConnection(configuration);

                // setup stream listening.
                yourConn.addStream(stream);

                // when a remote user adds stream to the peer connection, we display it
                yourConn.onaddstream = (e) => {
                    remoteVideo.srcObject = e.stream;
                };

                // Setup ice handling.
                yourConn.onicecandidate = (event) => {
                    if (event.candidate) {
                        send({
                            type: "candidate",
                            candidate: event.candidate
                        });
                    }
                };


            }, (error) => {
                console.log("error ", error);
            });
        } else {
            alert("WebRTC is not supported");
        }

    }
};

// initiating a call.
callBtn.addEventListener("click", () => {
    var callToUsername = callToUsernameInput.value;

    if (callToUsername.length > 0) {

        connectedUser = callToUsername;

        // create an offer.
        yourConn.createOffer((offer) => {
            send({
                type: "offer",
                offer: offer
            });

            yourConn.setLocalDescription(offer);
        }, (error) => {
            alert("Error when creating an offer.");
        });
    }
});

// when somebody sends us an offer.
function handleOffer(offer, name) {
    connectedUser = name;
    yourConn.setRemoteDescription(new RTCSessionDescription(offer));

    // create an answer to an offer.
    yourConn.createAnswer((answer) => {
        yourConn.setLocalDescription(answer);

        send({
            type: "answer",
            answer: answer
        });

    }, (error) => {
        alert("Error when creating an answer.");
    });
};

// when we got an answer from a remote user.
function handleAnswer(answer) {
    yourConn.setRemoteDescription(new RTCSessionDescription(answer));
};

// when we got an ice candidate from a remote user.
function handleCandidate(candidate) {
    yourConn.addIceCandidate(new RTCIceCandidate(candidate));
};

// hang up.
hangUpBtn.addEventListener("click", () => {
    send({
        type: "leave"
    });

    handleLeave();
});

function handleLeave() {
    connectedUser = null;
    remoteVideo.srcObject = null;

    yourConn.close();
    yourConn.onicecandidate = null;
    yourConn.onaddstream = null;
}


// When user sends a chat message
var chatText = chatSection.querySelector('#chatText');
var messageContent = chatText.value;

var chatSendBtn = chatSection.querySelector('#chatSendBtn');
chatSendBtn.addEventListener('click', () => {
    if (chatText.value == "" || chatText.value == undefined) {
        alert("Enter message to send.");
    } else {
        console.log(chatText.value);
        send({
            type: "chat",
            username: name,
            chatContent: chatText.value
        });

        var msgDisplayer = chatSection.querySelector('#msgDisplayer');
        var card = document.createElement('div');
        var cardBody = document.createElement('div');
        var cardTitle = document.createElement('h5');
        var cardText = document.createElement('p');


        var TitleText = document.createTextNode("" + name);
        var TextText = document.createTextNode("" + chatText.value);

        cardTitle.appendChild(TitleText);
        cardText.appendChild(TextText);
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        card.appendChild(cardBody);
        msgDisplayer.appendChild(card);

        card.classList.add("card", "bg-warning", "text-dark", "float-right", "mb-1", "w-75", "d-block");
        cardBody.classList.add("card-body", "myPadding");
        cardTitle.classList.add("card-title");
        cardText.classList.add("card-text");

        // reset text input
        chatText.value = "";
        document.querySelector('#chatText').focus();
        msgDisplayer.scrollTop = msgDisplayer.scrollHeight;
    }


});

// To display newly recieved chat messages
function handleChat(username, chatContent) {
    var msgDisplayer = chatSection.querySelector('#msgDisplayer');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardTitle = document.createElement('h5');
    var cardText = document.createElement('p');

    var TitleText = document.createTextNode("" + username);
    var TextText = document.createTextNode("" + chatContent);

    cardTitle.appendChild(TitleText);
    cardText.appendChild(TextText);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    card.appendChild(cardBody);
    msgDisplayer.appendChild(card);

    card.classList.add("card", "bg-info", "text-light", "float-left", "mb-1", "w-75", "d-block");
    cardBody.classList.add("card-body", "myPadding");
    cardTitle.classList.add("card-title");
    cardText.classList.add("card-text");

    msgDisplayer.scrollTop = msgDisplayer.scrollHeight;
}


// While focus on TextBox and Enter key is presses, send button is auto clicked.
document.querySelector("#chatText")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.querySelector("#chatSendBtn").click();
    }
});