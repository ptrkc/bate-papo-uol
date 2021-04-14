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
            console.log("working")
            clickedLogin(event.target.classList.contains("active"));
            break;
        default:
            break;
    }
}

function clickedLogin(active) {
    if (active) {
        const loginScreen = document.getElementById("login-screen")
        loginScreen.style.opacity = 0
        setTimeout(function () {
            loginScreen.classList.add("hidden")
        }, 500)
    }
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
}