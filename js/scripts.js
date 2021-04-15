const nameObject = {};

document.addEventListener("click", evaluateClick)

loginScreen();

function evaluateClick(event) {
    let clickedItem;
    if (event.target.id !== "") {
        console.log("id do elemento: " + event.target.id)
        clickedItem = event.target.id;
    } else {
        console.log("id do pai: " + event.target.parentNode.id,)
        clickedItem = event.target.parentNode.id;
    }
    switch (clickedItem) {
        case "login-button":
            clickedLogin(event.target.classList.contains("active"));
            break;
        case "send":
            sendMessage();
            break;
        default:
            break;
    }
}
function sendMessage() {
    const messageInput = document.getElementById("message")
    const messageToSend = {
        from: nameObject.name,
        to: "Todos",
        text: messageInput.value,
        type: "message" // ou "private_message" para o bônus
    }
    sendRequest = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/messages", messageToSend);
    sendRequest.then(requestMessages);
    messageInput.value = ""
    messageInput.focus();
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
    hideLoginScreen();
    requestMessagesLoop();
    keepAlive();
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
    for (let i = 0; i < messagesArray.length; i++) {
        switch (messagesArray[i].type) {
            case "status":
                message = `
                <li class="status"><span class="time">(${messagesArray[i].time})</span> <span class="username">${messagesArray[i].from}</span> ${messagesArray[i].text}</li>
                `
                messagesHTML += message
                break;
            case "message":
                message = `
                <li><span class="time">(${messagesArray[i].time})</span> <span class="username">${messagesArray[i].from}</span>
                    para <span class="username">${messagesArray[i].to}</span>: ${messagesArray[i].text}</li>
                `
                messagesHTML += message
                break;
            case "private_message":
                if (messagesArray[i].to === nameObject.name) {
                    message = `
                    <li class="private"><span class="time">(${messagesArray[i].time})</span> <span class="username">${messagesArray[i].from}</span>
                reservadamente para <span class="username">${messagesArray[i].to}</span>: ${messagesArray[i].text}</li>
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
    window.scrollTo(0, document.body.scrollHeight);
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