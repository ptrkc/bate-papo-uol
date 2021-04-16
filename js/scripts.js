const nameObject = {};
const messageToSend = {
    from: "",
    to: "Todos",
    text: "",
    type: "message" // ou "private_message" para o bônus
};
let lastMessages;


startEventListeners();

function evaluateClick(event) {
    let clickedItem;
    if (event.target.id !== "") {
        clickedItem = event.target.id;
    } else if (event.target.classList.contains("clicable-area")) {
        clickedItem = event.target.parentNode.parentNode.id;
    }
    switch (clickedItem) {
        case "login-button":
            clickedLogin(event.target.classList.contains("active"));
            break;
        case "send":
            sendMessage();
            break;
        case "participants-button":
            showSidebar(true);
            break;
        case "participants":
            selectPartiticipant(event.target.parentNode);
            break;
        case "privacy":
            selectPrivacy(event.target.parentNode);
            break;
        case "overlay":
            showSidebar(false);
            break;
        default:
            break;
    }
}
function startEventListeners() {
    document.getElementById("username").addEventListener("keyup", checkUsernameInput);
    document.getElementById("message").addEventListener("keyup", checkIfEnter);
    document.addEventListener("click", evaluateClick);
}

function selectPartiticipant(participant) {
    messageToSend.to = participant.innerText;
    updateCheck(participant);
    updateDestination();
}
function updateCheck(participant) {
    const checkedParticipant = participant.parentNode.querySelector("li span.check:not(.hidden)")
    checkedParticipant.classList.add("hidden")
    participant.querySelector("span.check").classList.remove("hidden");
}
function checkIfEnter(evt) {
    if (evt.key === "Enter") {
        sendMessage()
    }
}
function sendMessage() {
    const messageInput = document.getElementById("message")
    if (messageInput.value !== "" && messageInput.value !== undefined) {
        messageToSend.text = messageInput.value
        sendRequest = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages", messageToSend);
        sendRequest.then(requestMessages);
        sendRequest.catch(function () {
            window.location.reload()
        });
        messageInput.value = "";
        messageInput.focus();
    }
}
function clickedLogin(active) {
    if (active) {
        const username = document.getElementById("username").value;
        requestUsername(username);
    }
}
function requestUsername(username) {
    nameObject.name = username
    const usernameRequest = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants", nameObject);
    usernameRequest.then(function () { successfulLogin() });
    usernameRequest.catch(receivedError)
    loadingScreenToggle();
}
function loadingScreenToggle() {
    initialElements = document.querySelectorAll("#login-screen > *:not(.logo, .hidden)")
    loadingElements = document.querySelectorAll("#login-screen > .hidden:not(.logo)")
    initialElements.forEach(element => {
        element.classList.add("hidden")
    });
    loadingElements.forEach(element => {
        element.classList.remove("hidden")
    });
}

function successfulLogin() {
    messageToSend.from = nameObject.name
    hideLoginScreen();
    requestMessagesLoop();
    requestParticipantsLoop()
    keepAlive();
}
function requestParticipantsLoop() {
    requestParticipants()
    setInterval(requestParticipants, 10000);
}
function requestParticipants() {
    const participantsRequest = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants");
    participantsRequest.then(renderParticipants);
}
function renderParticipants(response) {
    const participantsArray = response.data
    participantStillHere(participantsArray)
    let hidden = " hidden";
    if (messageToSend.to === "Todos") {
        hidden = ""
    }
    let participantsHTML = `
    <li>
        <div class="clicable-area"></div>
        <ion-icon name="people"></ion-icon>
        <span class="participant">Todos</span>
        <span class="check${hidden}"></span>
    </li>`
    let participant;
    for (let i = 0; i < participantsArray.length; i++) {
        if (participantsArray[i].name === messageToSend.to) {
            hidden = ""
        } else {
            hidden = " hidden"
        }
        participant = `
                <li>
                    <div class="clicable-area"></div>
                    <ion-icon name="person-circle"></ion-icon>
                    <span class="participant">${participantsArray[i].name}</span>
                    <span class="check${hidden}"></span>
                </li>`
        participantsHTML += participant;
    }
    const participants = document.getElementById("participants");
    participants.innerHTML = participantsHTML;
}
function participantStillHere(participantsArray) {
    const stillHere = participantsArray.find(participants => participants.name === messageToSend.to);
    if (stillHere === undefined) {
        messageToSend.to = "Todos"
        messageToSend.type = "message"
        updateDestination();
    }
}
function hideLoginScreen() {
    const loginScreen = document.getElementById("login-screen")
    loginScreen.style.opacity = 0
    setTimeout(function () {
        loginScreen.classList.add("hidden")
    }, 500)
}
function requestMessagesLoop() {
    requestMessages()
    setInterval(requestMessages, 5000);
}
function requestMessages() {
    const messagesRequest = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages");
    messagesRequest.then(renderMessages);
}
function renderMessages(response) {
    let messagesHTML = ""
    let message;
    const messagesArray = response.data
    const newMessagesArrived = (JSON.stringify(messagesArray) !== JSON.stringify(lastMessages))
    if (lastMessages === undefined || newMessagesArrived) {
        for (let i = 0; i < messagesArray.length; i++) {
            switch (messagesArray[i].type) {
                case "status":
                    message = `
                        <li class="status">
                        <span class="time">(${messagesArray[i].time})</span> 
                        <span class="participant">${messagesArray[i].from}</span> 
                        ${messagesArray[i].text}</li>`
                    messagesHTML += message
                    break;
                case "message":
                    message = `
                        <li><span class="time">(${messagesArray[i].time})</span> 
                        <span class="participant">${messagesArray[i].from}</span> para 
                        <span class="participant">${messagesArray[i].to}</span>: ${messagesArray[i].text}</li>`
                    messagesHTML += message
                    break;
                case "private_message":
                    if (messagesArray[i].to === "Todos" || messagesArray[i].to === nameObject.name || messagesArray[i].from === nameObject.name) {
                        message = `
                            <li class="private"><span class="time">(${messagesArray[i].time})</span> 
                            <span class="participant">${messagesArray[i].from}</span>
                            reservadamente para <span class="participant">${messagesArray[i].to}</span>: 
                            ${messagesArray[i].text}</li>`
                        messagesHTML += message
                    }
                    break;
                default:
                    break;
            }
        }
        const messages = document.getElementById("messages");
        messages.innerHTML = messagesHTML;
        lastMessages = messagesArray
        window.scrollTo(0, document.body.scrollHeight);
    }
}

function keepAlive() {
    setInterval(function () {
        axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/status", nameObject);
    }, 5000);
}

function receivedError(error) {
    loadingScreenToggle()
    const usernameInput = document.getElementById("username");
    usernameInput.value = "";
    usernameInput.focus();
    document.getElementById("login-button").classList.remove("active")
    document.querySelector("#login-screen .warn").classList.remove("soft-hidden");
}

function checkUsernameInput(evt) {
    const loginButton = document.getElementById("login-button")
    if (evt.target.value === undefined || evt.target.value === "") {
        loginButton.classList.remove("active")
    } else {
        loginButton.classList.add("active")
        if (evt.key === "Enter") {
            clickedLogin(true)
        }
    }
    document.querySelector("#login-screen .warn").classList.add("soft-hidden");
}

function selectPrivacy(privacy) {
    const privacyChecks = document.querySelectorAll("#privacy li span.check")
    if (privacy.innerText === "Reservadamente") {
        messageToSend.type = "private_message";
        privacyChecks[0].classList.add("hidden")
        privacyChecks[1].classList.remove("hidden")
    } else {
        messageToSend.type = "message";
        privacyChecks[1].classList.add("hidden")
        privacyChecks[0].classList.remove("hidden")
    }
    updateDestination()
}

function showSidebar(bol) {
    const rightDiv = document.getElementById("right")
    const overlay = document.getElementById("overlay")
    const sidebar = document.getElementById("sidebar")
    if (bol) {
        rightDiv.classList.remove("hidden");
        setTimeout(function () {
            overlay.style.opacity = 1;
            sidebar.style.right = "0";
        }, 50)
    } else {
        overlay.style.opacity = 0
        sidebar.style.right = "-249px"
        setTimeout(function () {
            rightDiv.classList.add("hidden");
        }, 300)
    }
}
function updateDestination() {
    const destination = document.getElementById("destination")
    if (messageToSend.type == "message") {
        destination.innerText = `Enviando para ${messageToSend.to} (Público)`
    } else {
        destination.innerText = `Enviando para ${messageToSend.to} (Reservadamente)`

    }
}