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
        default:
            break;
    }
}

function clickedLogin(active) {
    if (active) {
        const username = document.getElementById("username").value;
        requestUsername(username);
    }
}
function requestUsername(username) {
    const nameObject = { name: username }
    const usernameRequest = axios.post("https://mock-api.bootcamp.respondeai.com.br/api/v2/uol/participants", nameObject);
    usernameRequest.then(successfulLogin)
    usernameRequest.catch(receivedError)
}
function successfulLogin() {
    hideLoginScreen();
    //renderMessages();
    //keepAlive();
}
function hideLoginScreen() {
    const loginScreen = document.getElementById("login-screen")
    loginScreen.style.opacity = 0
    setTimeout(function () {
        loginScreen.classList.add("hidden")
    }, 500)
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