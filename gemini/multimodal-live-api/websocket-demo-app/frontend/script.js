const PROXY_URL = "ws://localhost:8080";
const PROJECT_ID = "consumer-genai-experiments";
const MODEL = "gemini-2.0-flash-exp";
const API_HOST = "us-central1-aiplatform.googleapis.com";

const prompt = "You are an expert photographer who knows how to adjust phone camera \
                 for best pictures. Please describe what scene you see now such as indoor or outdoor \
                 here are some other scene options: city, office, nature, beach. \
                 please also suggest camera filter style, here are the suggestion rules: \
                 for outdoor and nature scene, apply a Vibrant/Warm style. \
                 for indoor scene, apply a Cool style. for city scene, apply modern style \
                 please response in the following format: \
                 Scene: Indoor && Style: Cool \
                 Scene: Outdoor && Style: Vibrant ";

const accessTokenInput = { value: "ya29.A0AeXRPp5VSVxNaP3sCJ-x-TmzVqtqTw8zskX04UsLzXOA60_vKMYqDoob_XGFam-Uxqnkhhe4m36usRvtPUHgkX56ocF2d1YeTfUWajqezGJkgLOpWPVsPKAJBa8TsAEQHII00Opo-Q9fBnj5pzC8cjQ8ZJ04H-MlEK3gfGDiZ4KT9gJzkEmoMQhOVKl0kZesyU8KHW3l8YFIVQaCgYKAWUSARMSFQHGX2Miq7YWJqTLFxE67Y4KjRa9Iw0213"}
const projectInput = {value: PROJECT_ID};
const systemInstructionsInput = {value: prompt}

//for mobile.html
let cameraButtonMobile = null;

const geminiLiveApi = new GeminiLiveAPI(PROXY_URL, PROJECT_ID, MODEL, API_HOST);

geminiLiveApi.onErrorMessage = (message) => {
    showDialogWithMessage(message);
    setAppStatus("disconnected");
};

const disconnected = document.getElementById("disconnected");

window.addEventListener("load", (event) => {
    console.log("Hello Gemini Realtime Demo!");

    setAvailableCamerasOptions();
    setAvailableMicrophoneOptions();
    initCameraButtonClick(); // Initialize the click handler for camera-button
});

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

function getSelectedResponseModality() {
    // return "AUDIO";
    const radioButtons = document.querySelectorAll(
        'md-radio[name="responseModality"]',
    );

    if (radioButtons.length === 0) {
        return "TEXT"; // Return "TEXT" if no radio buttons found
    }

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
        
        // Switch to mobile case
        // newModelMessage(messageResponse.data);
        //update the UI
        updateSceneStyle(messageResponse.data)
    }
};

const liveAudioInputManager = new LiveAudioInputManager();

liveAudioInputManager.onNewAudioRecordingChunk = (audioData) => {
    geminiLiveApi.sendAudioMessage(audioData);
};

function newModelMessage(message) {
    // addMessageToChat(">> " + message);
    console.log(">> " + message);

}

/*
function addMessageToChat(message) {
    const textChat = document.getElementById("text-chat");
    const newParagraph = document.createElement("p");
    newParagraph.textContent = message;
    textChat.appendChild(newParagraph);
}

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
*/ 


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
    let isCameraOpen = false; // Track if the camera is open

    styleCircle.addEventListener("click", () => {
        console.log("Camera Button Clicked!");

        if (!isConnectedToGemini) {
            console.log("Connecting to Gemini Live API...");
            
            //Check that the user has logged in
            if (!accessTokenInput) {
                showDialogWithMessage("Access Token is missing. Please set the access_token environment variable.");
                return;
            }        
            
            connectBtnClick(); // Connect to Gemini Live API
            
            console.log("Connected to Gemini Live API!");
            styleCircle.style.backgroundColor = "red";
            isConnectedToGemini = true;
            

            //Open the browser camera
            if(!isCameraOpen){
                isCameraOpen = true;
                startCameraCapture();// Open the browser camera
            }
           
        } else {
            console.log("Disconnecting from Gemini Live API...");

            disconnectBtnClick(); // Disconnect from Gemini Live API
            styleCircle.style.backgroundColor = "white"; // Reset to original color
            isConnectedToGemini = false;
            isCameraOpen = false;

            liveVideoManager.stopWebcam();//stop the camera
        }
    });
}

function updateSceneStyle(message) {
    const sceneValueSpan = document.getElementById('scene-value');
    const styleValueSpan = document.getElementById('style-value');

    if (!sceneValueSpan || !styleValueSpan){
        return;
    }

    // Expected format: "Scene: Outdoor && Style: Vibrant"
    const sceneMatch = message.match(/Scene:\s*(\w+)/);
    const styleMatch = message.match(/Style:\s*([\w,\s]+)/);

    if (sceneMatch && sceneMatch[1]) {
        sceneValueSpan.textContent = sceneMatch[1].trim();
    }

    if (styleMatch && styleMatch[1]) {
        styleValueSpan.textContent = styleMatch[1].trim();
    }
}