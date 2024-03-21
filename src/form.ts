export default `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Talk to Agent</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    />

    <style>
      @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300&display=swap");
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: "Montserrat", sans-serif;
      }

      html,
      body {
        height: 100%;
        margin: 0;
      }

      #app {
        width: 100%;
        height: 100%;
        /* background-color: #444653; */
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }

      .sideBar {
        display: flex;
        flex-direction: column;
        position: relative;
        top: 0;
        left: 0;
        height: 100%;
        width: 18%;
        background-color: #202123;
        justify-content: center;
        text-align: center;
        padding: 20px;
      }

      .heading {
        width: 100%;
        text-align: center;
      }

      .heading p {
        font-size: 20px;
        font-weight: 700;
        color: white;
      }

      .newChatButton {
        font-size: 16px;
        width: 80%;
        margin: 20px auto;
        padding: 5px;
        position: relative;
        display: flex; /* Use flexbox to align content */
        justify-content: center; /* Center content horizontally */
        align-items: flex-start;
        text-align: center;
        color: white;
        background-color: #202123;
        border: 2px solid white;
      }

      .mainChatContainer {
        background-color: #444653;
        display: flex;
        flex-direction: column;
        position: relative;
        top: 0;
        right: 0;
        height: 100%;
        width: 82%;
        /* background-color: #f1f1f1; */
        /* border-right: 1px solid #ccc; */
        padding: 20px;
      }

      @media only screen and (max-width: 600px) {
        .heading {
          margin: 2%;
          width: 95%;
          text-align: center;
        }

        h2 {
          color: white;
          font-size: 15px;
        }
      }

      #chat_container {
        /* margin-top: 1%; */
        flex: 1;
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        background-color: #444653;
        display: flex;
        flex-direction: column;
        /* gappingBWStripes  */
        gap: 5px;

        -ms-overflow-style: none;
        scrollbar-width: none;

        padding-bottom: 20px;
        scroll-behavior: smooth;
      }

      /* hides scrollbar */
      #chat_container::-webkit-scrollbar {
        display: none;
      }

      .wrapper {
        width: 100%;
        padding: 10px;
        justify-content: center;
        align-items: center;
        display: flex;
      }

      .ai {
        background: #40414f;
      }

      .chat {
        width: 100%;
        margin: 0 auto;

        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: center;

        /* gappingFromProfilePicture&Text */
        gap: 10px;
      }

      .profile {
        width: 30px;
        height: 30px;
        border-radius: 5px;

        background: #5436da;

        display: flex;
        justify-content: center;
        align-items: center;
      }

      .ai .profile {
        background: #10a37f;
      }

      .profile img {
        width: 60%;
        height: 60%;
        object-fit: contain;
      }

      .message {
        flex: 1;

        color: #dcdcdc;
        font-size: 18px;

        max-width: 100%;
        overflow-x: scroll;

        /*
   * white space refers to any spaces, tabs, or newline characters that are used to format the CSS code
   * specifies how white space within an element should be handled. It is similar to the "pre" value, which tells the browser to treat all white space as significant and to preserve it exactly as it appears in the source code.
   * The pre-wrap value allows the browser to wrap long lines of text onto multiple lines if necessary.
   * The default value for the white-space property in CSS is "normal". This tells the browser to collapse multiple white space characters into a single space, and to wrap text onto multiple lines as needed to fit within its container.
  */
        white-space: pre-wrap;

        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      /* hides scrollbar */
      .message::-webkit-scrollbar {
        display: none;
      }

      .ask-form {
        width: 100%;
        /* max-width: 1280px; */
        padding: 10px;
        background-color: #3f414e;
        /* margin-bottom: 5px; */
        display: flex;
        flex-direction: row;
        gap: 10px;
        border-radius: 10px;
      }

      textarea {
        width: 100%;
        color: #fff;
        font-size: 18px;
        padding: 5px;
        background: transparent;
        border-radius: 10px;
        border: none;
        outline: none;
      }

      .submitBtn {
        /* outline: 0; */
        border: none;
        cursor: pointer;
        background-color: #3f414e;
        padding: 6px;
      }

      .submitBtn:hover {
        background-color: black;
        border-radius: 10px;
      }

      form img {
        width: 25px;
        height: 25px;
      }

      .footer {
        width: 100%;
        position: relative;
        height: 100%;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: flex-end;
      }

      .footer p {
        position: absolute;
        bottom: 0;
        font-size: 12px;
        font-weight: 700;
        color: white;
        padding-bottom: 20px;
      }

      .github-link {
        color: inherit;
        text-decoration: none;
      }

      /* styles for screens smaller than 768px */
      @media (min-width: 768px) {
        .mobileFooter {
          display: none;
        }
      }

      /* styles for screens smaller than 768px */
      @media (max-width: 768px) {
        #app {
          flex-direction: column;
        }

        .sideBar {
          display: none;
        }

        .mainChatContainer {
          width: 100%;
          padding: 25px;
          margin: 0;
        }

        textarea {
          font-size: 15px;
        }

        .message {
          font-size: 15px;
        }

        .ask-form {
          padding: 8px;
        }

        .wrapper {
          padding: 8px;
        }
      }
    </style>
  </head>

  <body>
    <div id="app">
      <!-- <div class="container"> -->
      <div class="sideBar">
        <div class="heading">
          <p>Let's chat with AI ... ?</p>
        </div>

        <div id="newChatButton">+ New Chat</div>
      </div>

      <div class="mainChatContainer">
        <div id="chat_container"></div>
        <form class="ask-form">
          <textarea
            name="prompt"
            rows="1"
            cols="1"
            placeholder="Just ask ... ?"
          ></textarea>
          <button type="submit" class="submitBtn">
            <i class="fa fa-send-o" style="font-size: 18px; color: white"></i>
          </button>
          <!-- <button type="submit"><img src="/assets/send.svg" /></button> -->
        </form>
      </div>

      <!-- </div> -->
    </div>
    <script type="module">

      const form = document.querySelector("form");
      const chatContainer = document.querySelector("#chat_container");
      const newChatButton = document.getElementById("newChatButton");

      let loadInterval;

      function loader(element) {
        element.textContent = "";

        loadInterval = setInterval(() => {
          element.textContent += ".";

          if (element.textContent === "....") {
            element.textContent = "";
          }
        }, 300);
      }

      // functionToTypeTextByAi
      function typeText(element, text) {
        let index = 0;

        let interval = setInterval(() => {
          if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
          } else {
            clearInterval(interval);
          }
        }, 20);
      }

      // functionToGenerateUID
      function generateUniqueId() {
        const timeStamp = Date.now();
        const randomNumber = Math.random();
        const hexadecimalString = randomNumber.toString(16);

        return \`id-\${timeStamp}-\${hexadecimalString}\`;
      }

      // functionToGenerateChatStripesForUser/Ai
      function chatStripe(isAi, value, uniqueId) {
        return \`
    <div class="wrapper \${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
        </div>
        <div class="message" id=\${uniqueId}>\${value}</div>
      </div>
    </div>
    \`;
      }

      // fucntionOnHandleSubmit
      const handleSubmit = async (e) => {
        e.preventDefault();

        // collectingAskedQuestionFromFromData
        const data = new FormData(form);

        // checkingPurpose
        console.log({ data });

        // generatingUIDForUser
        const uniqueIdUser = generateUniqueId();

        // user's chatstripe
        chatContainer.innerHTML += chatStripe(
          false,
          data.get("prompt"),
          uniqueIdUser
        );

        // clearFormInput
        form.reset();

        // bot's chatstripe
        const uniqueIdAi = generateUniqueId();
        chatContainer.innerHTML += chatStripe(true, "", uniqueIdAi);

        // to focus scroll to the bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // specific message div
        const messageDiv = document.getElementById(uniqueIdAi);

        // messageDiv.innerHTML = "..."
        loader(messageDiv);

        // fetchingDataFromServer
        const response = await fetch(
          // provideDeployedServerSideLink
          "/message?message=" + data.get("prompt"),
        );

        clearInterval(loadInterval);

        // stopTheDotAction
        messageDiv.innerHTML = "";

        // ifFetchedDataIsOkay
        // https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
        if (response.ok) {
          // actualData/Response
          const data = await response.json();
          // parsingData
          const parseData = data;
          typeText(messageDiv, parseData);
        } else {
          // errorHandling
          const error = await response.text();
          messageDiv.innerHTML = "Something went wrong !";
          alert(error);
        }
      };

      // addEventListenerForSubmitButton
      form.addEventListener("submit", handleSubmit);

      // addEventListenerForSubmitButtonWRTEnterKey
      form.addEventListener("keyup", (e) => {
        if (e.keyCode === 13) {
          handleSubmit(e);
        }
      });

      const resetContainers = () => {
        form.reset();
      };

      newChatButton.addEventListener("click", resetContainers);

    </script>
  </body>
</html>`;