window.addEventListener("load", (event) => {
    console.log("Hello Gemini Realtime Demo!");

    setAvailableCamerasOptions();
    setAvailableMicrophoneOptions();
    initCameraButtonClick(); // Initialize the click handler for camera-button
});

const PROXY_URL = "ws://localhost:8080";
const PROJECT_ID = "consumer-genai-experiments";
const MODEL = "gemini-2.0-flash-exp";
const API_HOST = "us-central1-aiplatform.googleapis.com";

/*
const accessTokenInput = document.getElementById("token");
const projectInput = document.getElementById("project");
const systemInstructionsInput = document.getElementById("systemInstructions");

CookieJar.init("token");
CookieJar.init("project");
CookieJar.init("systemInstructions");

const disconnected = document.getElementById("disconnected");
const connecting = document.getElementById("connecting");
const connected = document.getElementById("connected");
const speaking = document.getElementById("speaking");

const micBtn = document.getElementById("micBtn");
const micOffBtn = document.getElementById("micOffBtn");
const cameraBtn = document.getElementById("cameraBtn");
const screenBtn = document.getElementById("screenBtn");

const cameraSelect = document.getElementById("cameraSource");
const micSelect = document.getElementById("audioSource");
*/

const geminiLiveApi = new GeminiLiveAPI(PROXY_URL, PROJECT_ID, MODEL, API_HOST);

geminiLiveApi.onErrorMessage = (message) => {
    showDialogWithMessage(message);
    setAppStatus("disconnected");
};

function getSelectedResponseModality() {
    // return "AUDIO";
    const radioButtons = document.querySelectorAll(
        'md-radio[name="responseModality"]',
    );

    let selectedValue;
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            selectedValue = radioButton.value;
            break;
        }
    }
    return selectedValue;
}

function getSystemInstructions() {
    return systemInstructionsInput.value;
}

function connectBtnClick() {
    setAppStatus("connecting");

    geminiLiveApi.responseModalities = getSelectedResponseModality();
    geminiLiveApi.systemInstructions = getSystemInstructions();

    geminiLiveApi.onConnectionStarted = () => {
        setAppStatus("connected");
        startAudioInput();
    };

    geminiLiveApi.setProjectId(projectInput.value);
    geminiLiveApi.connect(accessTokenInput.value);
}

const liveAudioOutputManager = new LiveAudioOutputManager();

geminiLiveApi.onReceiveResponse = (messageResponse) => {
    if (messageResponse.type == "AUDIO") {
        liveAudioOutputManager.playAudioChunk(messageResponse.data);
    } else if (messageResponse.type == "TEXT") {
        console.log("Gemini said: ", messageResponse.data);
        newModelMessage(messageResponse.data);
    }
};

const liveAudioInputManager = new LiveAudioInputManager();

liveAudioInputManager.onNewAudioRecordingChunk = (audioData) => {
    geminiLiveApi.sendAudioMessage(audioData);
};

/*
function addMessageToChat(message) {
    const textChat = document.getElementById("text-chat");
    const newParagraph = document.createElement("p");
    newParagraph.textContent = message;
    textChat.appendChild(newParagraph);
}

function newModelMessage(message) {
    addMessageToChat(">> " + message);

}
*/

function newModelMessage(message) {
    const textChat = document.getElementById("text-chat");
    let modelResponseContainer = textChat.querySelector(".model-response");

    if (!modelResponseContainer) {
        modelResponseContainer = document.createElement("div");
        modelResponseContainer.classList.add("model-response");
        textChat.appendChild(modelResponseContainer);

        const prefixSpan = document.createElement("span");
        prefixSpan.textContent = ">> ";
        prefixSpan.classList.add("prefix");
        modelResponseContainer.appendChild(prefixSpan);
    }

    const lines = formatMessage(message);
    lines.forEach((line) => {
        const messageSpan = document.createElement("span");
        messageSpan.textContent = line;
        messageSpan.classList.add("message-chunk");
        modelResponseContainer.appendChild(messageSpan);

        const lineBreak = document.createElement("br");
        modelResponseContainer.appendChild(lineBreak);
    });
    textChat.scrollTop = textChat.scrollHeight;
}

function formatMessage(message) {
    let formattedLines = [];
    let currentLine = "";

    const words = message.split(" ");
    words.forEach((word) => {
        // Check for bold marker (**) and break line if found
        if (word.startsWith("**") || word.endsWith("**")) {
            if(currentLine!=""){
                formattedLines.push(currentLine);
                currentLine="";
            }
           
            formattedLines.push(word);
            return;
        }
        //Check for semi-colon for code
        if (word.endsWith(";")) {
            currentLine += " "+word;
             formattedLines.push(currentLine);
             currentLine="";
             return;
        }
        currentLine += " " + word;
        
    });
    if (currentLine != "") {
         formattedLines.push(currentLine);
     }
    return formattedLines;
}

function addMessageToChat(message) {
    const textChat = document.getElementById("text-chat");
    const newParagraph = document.createElement("p");
    newParagraph.textContent = message;
    textChat.appendChild(newParagraph);
    textChat.scrollTop = textChat.scrollHeight;
}


function newUserMessage() {
    const textMessage = document.getElementById("text-message");
    addMessageToChat("User: " + textMessage.value);
    geminiLiveApi.sendTextMessage(textMessage.value);

    textMessage.value = "";
}

function startAudioInput() {
    liveAudioInputManager.connectMicrophone();
}

function stopAudioInput() {
    liveAudioInputManager.disconnectMicrophone();
}

function micBtnClick() {
    console.log("micBtnClick");
    stopAudioInput();
    micBtn.hidden = true;
    micOffBtn.hidden = false;
}

function micOffBtnClick() {
    console.log("micOffBtnClick");
    startAudioInput();

    micBtn.hidden = false;
    micOffBtn.hidden = true;
}

/*
const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");

const liveVideoManager = new LiveVideoManager(videoElement, canvasElement);

const liveScreenManager = new LiveScreenManager(videoElement, canvasElement);

liveVideoManager.onNewFrame = (b64Image) => {
    geminiLiveApi.sendImageMessage(b64Image);
};

liveScreenManager.onNewFrame = (b64Image) => {
    geminiLiveApi.sendImageMessage(b64Image);
};
*/

function startCameraCapture() {
    liveScreenManager.stopCapture();
    liveVideoManager.startWebcam();
}

function startScreenCapture() {
    liveVideoManager.stopWebcam();
    liveScreenManager.startCapture();
}

function cameraBtnClick() {
    startCameraCapture();
    console.log("cameraBtnClick");
}

function screenShareBtnClick() {
    startScreenCapture();
    console.log("screenShareBtnClick");
}

function newCameraSelected() {
    console.log("newCameraSelected ", cameraSelect.value);
    liveVideoManager.updateWebcamDevice(cameraSelect.value);
}

function newMicSelected() {
    console.log("newMicSelected", micSelect.value);
    liveAudioInputManager.updateMicrophoneDevice(micSelect.value);
}

function disconnectBtnClick() {
    setAppStatus("disconnected");
    geminiLiveApi.disconnect();
    stopAudioInput();
}

function showDialogWithMessage(messageText) {
    const dialog = document.getElementById("dialog");
    const dialogMessage = document.getElementById("dialogMessage");
    dialogMessage.innerHTML = messageText;
    dialog.show();
}

async function getAvailableDevices(deviceType) {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    const devices = [];
    allDevices.forEach((device) => {
        if (device.kind === deviceType) {
            devices.push({
                id: device.deviceId,
                name: device.label || device.deviceId,
            });
        }
    });
    return devices;
}

async function getAvailableCameras() {
    return await this.getAvailableDevices("videoinput");
}

async function getAvailableAudioInputs() {
    return await this.getAvailableDevices("audioinput");
}

function setMaterialSelect(allOptions, selectElement) {
    allOptions.forEach((optionData) => {
        const option = document.createElement("md-select-option");
        option.value = optionData.id;

        const slotDiv = document.createElement("div");
        slotDiv.slot = "headline";
        slotDiv.innerHTML = optionData.name;
        option.appendChild(slotDiv);

        selectElement.appendChild(option);
    });
}

async function setAvailableCamerasOptions() {
    const cameras = await getAvailableCameras();
    const videoSelect = document.getElementById("cameraSource");
    setMaterialSelect(cameras, videoSelect);
}

async function setAvailableMicrophoneOptions() {
    const mics = await getAvailableAudioInputs();
    const audioSelect = document.getElementById("audioSource");
    setMaterialSelect(mics, audioSelect);
}

function setAppStatus(status) {
    disconnected.hidden = true;
    connecting.hidden = true;
    connected.hidden = true;
    speaking.hidden = true;

    switch (status) {
        case "disconnected":
            disconnected.hidden = false;
            break;
        case "connecting":
            connecting.hidden = false;
            break;
        case "connected":
            connected.hidden = false;
            break;
        case "speaking":
            speaking.hidden = false;
            break;
        default:
    }
}

function initCameraButtonClick() {
    const styleCircle = document.getElementById("camera-button");
    let isConnectedToGemini = false; // Track the connection status

    styleCircle.addEventListener("click", () => {
        console.log("Record Circle Clicked!");

        if (!isConnectedToGemini) {
            console.log("Connecting to Gemini Live API...");
            //Check if LiveMediaManager is available and instantiated
            /*
            if (typeof LiveMediaManager !== 'undefined' && LiveMediaManager.instance) {
                console.log("LiveMediaManager instance found.");
                const mediaManager = LiveMediaManager.instance;

                //Check if geminiLiveAPI is set
                if (!mediaManager.geminiLiveAPI) {
                    console.error("GeminiLiveAPI is not initiated. Run initGeminiLiveAPI() first.");
                    return;
                }

                //check if the gemini websocket is connected
                if (mediaManager.geminiLiveAPI.connected) {
                    console.log("Gemini Websocket is already connected");
                } else {
                    mediaManager.geminiLiveAPI.connect();
                }
            } else {
                console.error("LiveMediaManager is not available or not instantiated. Please ensure it's loaded and initialized.");
                return;
            }
            */
            styleCircle.style.backgroundColor = "red";
            isConnectedToGemini = true;
        } else {
            console.log("Disconnecting from Gemini Live API...");

            //Check if LiveMediaManager is available and instantiated
            /*
            if (typeof LiveMediaManager !== 'undefined' && LiveMediaManager.instance) {
                console.log("LiveMediaManager instance found.");
                const mediaManager = LiveMediaManager.instance;

                 //Check if geminiLiveAPI is set
                if (!mediaManager.geminiLiveAPI) {
                    console.error("GeminiLiveAPI is not initiated. Run initGeminiLiveAPI() first.");
                    return;
                }
                 //check if the gemini websocket is connected
                if (mediaManager.geminiLiveAPI.connected) {
                    mediaManager.geminiLiveAPI.disconnect();
                } else {
                    console.log("Gemini Websocket is already disconnected");
                }
            }else {
                console.error("LiveMediaManager is not available or not instantiated. Please ensure it's loaded and initialized.");
                return;
            }
            */

            styleCircle.style.backgroundColor = "white"; // Reset to original color
            isConnectedToGemini = false;
        }
    });
}