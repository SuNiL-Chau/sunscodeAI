import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// loader function while waiting for response
function loader(ele) {
  ele.textContent = "";
  loadInterval = setInterval(() => {
    ele.textContent += ".";
    ele.textContent === "...." ? (ele.textContent = "") : null;
  }, 300);
}

// type text animation function
function typeText(ele, txt) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < txt.length) {
      ele.innerHTML += txt.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// generate unique id function to generae id for each msg
function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);
  return `id=${timeStamp}-${hexaDecimalString}`;
}

// function to create chat stripe which checks if its ai or us and takes value and unique id to generate
function chatStripe(isAi, val, uid) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img 
            src=${isAi ? bot : user} 
            alt="${isAi ? "bot" : "user"}" 
          />
        </div>
        <div class="message" id=${uid}>${val}</div>
      </div>
    </div>
  `;
}

// submit function
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  
  // user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  // bot's chat stripe
  const uid = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uid);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const msgDiv = document.getElementById(uid);

  loader(msgDiv);

  const response = await fetch("https://sunscode.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  msgDiv.innerHTML = " ";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    typeText(msgDiv, parsedData);
  } else {
    const err = await response.text();

    msgDiv.innerHTML = "Something went wrong";
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);

form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});