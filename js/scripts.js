const nameObject = {};
const messageToSend = {
    from: "",
    to: "Todos",
    text: "",
    type: "message" // ou "private_message" para o bônus
}
let lastMessages;
document.addEventListener("click", evaluateClick)

loginScreen();

function evaluateClick(event) {
    let clickedItem;
    console.clear()
    console.log(event.target)
    console.log(event)
    console.log(event.target.parentNode.parentNode.id)

    if (event.target.id !== "") {
        clickedItem = event.target.id;
    } else if (event.target.classList.contains("clicable-area")) {
        clickedItem = event.target.parentNode.parentNode.id
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
        case "participant":
            //selectPartiticipant(event);
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
function selectPartiticipant(participant) {
    //console.log(participant)
}
function sendMessage() {
    const messageInput = document.getElementById("message")
    if (messageInput.value !== "") {
        messageToSend.text = messageInput.value
        console.log(messageToSend);
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
    let participantsHTML = `
    <li>
        <div class="clicable-area"></div>
        <ion-icon name="people"></ion-icon>
        <span class="participant">Todos</span>
        <span class="check"></span>
    </li>
    `
    let participant;
    const participantsArray = response.data
    for (let i = 0; i < participantsArray.length; i++) {
        participant = `
                <li>
                    <div class="clicable-area"></div>
                    <ion-icon name="person-circle"></ion-icon>
                    <span class="participant">${participantsArray[i].name}</span>
                    <span class="check hidden"></span>
                </li>                
                `
        participantsHTML += participant
    }
    const participants = document.getElementById("participants");
    participants.innerHTML = participantsHTML;
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
                <li class="status"><span class="time">(${messagesArray[i].time})</span> <span class="participant">${messagesArray[i].from}</span> ${messagesArray[i].text}</li>
                `
                    messagesHTML += message
                    break;
                case "message":
                    message = `
                <li><span class="time">(${messagesArray[i].time})</span> <span class="participant">${messagesArray[i].from}</span>
                    para <span class="participant">${messagesArray[i].to}</span>: ${messagesArray[i].text}</li>
                `
                    messagesHTML += message
                    break;
                case "private_message":
                    if (messagesArray[i].to === "Todos" || messagesArray[i].to === nameObject.name || messagesArray[i].from === nameObject.name) {
                        message = `
                    <li class="private"><span class="time">(${messagesArray[i].time})</span> <span class="participant">${messagesArray[i].from}</span>
                reservadamente para <span class="participant">${messagesArray[i].to}</span>: ${messagesArray[i].text}</li>
                `
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
    const usernameInput = document.getElementById("username");
    usernameInput.value = "";
    usernameInput.focus();
    document.querySelector("#login-screen span").classList.remove("soft-hidden");
}
function loginScreen() {
    const usernameInput = document.getElementById("username")
    const loginButton = document.getElementById("login-button")
    usernameInput.addEventListener("keyup", function () { checkInput(usernameInput, loginButton) });
    checkInput(usernameInput, loginButton);
}

function checkInput(input, button) {
    if (input.value === "") {
        button.classList.remove("active")
    } else {
        button.classList.add("active")
    }
    document.querySelector("#login-screen span").classList.add("soft-hidden");
}

function selectPrivacy(privacy) {
    if (privacy.innerText === "Reservadamente") {
        messageToSend.type = "private_message";
    } else {
        messageToSend.type = "message";
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