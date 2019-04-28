import { me } from "appbit";
import clock from "clock";
import document from "document";
import { display } from "display";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import * as fs from "fs";
import { inbox } from "file-transfer";
//Heart Rate stuff
import { HeartRateSensor } from "heart-rate";

const SETTINGS_FILE = "settings.cbor";
const SETTINGS_TYPE = "cbor";

const labelTime = document.getElementById("labelTime");
const labelTimeShadow = document.getElementById("labelTimeShadow");
const imageBackground = document.getElementById("imageBackground");


// Get background 
const imageBackground = document.getElementById("imageBackground");

// Load Settings
let mySettings;
loadSettings();
me.onunload = saveSettings;

clock.granularity = "minutes";

clock.ontick = evt => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    hours = hours % 12 || 12;
  } else {
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  let timeString = `${hours}:${mins}`;
  labelTime.text = timeString;
  labelTimeShadow.text = timeString;
};

// HANDLER - Receiving file form companion
inbox.onnewfile = () => {
  let fileName;
  do {
    fileName = inbox.nextFile();
    console.log("An image was received from companion");
    if (fileName) {
      if (mySettings.bg && mySettings.bg !== "") {
        fs.unlinkSync(mySettings.bg);
      }
      mySettings.bg = `/private/data/${fileName}`;
      applySettings();
    }
  } while (fileName);
};

function loadSettings() {
  try {
    mySettings = fs.readFileSync(SETTINGS_FILE, SETTINGS_TYPE);
  } catch (ex) {
    mySettings = {};
  }
  applySettings();
}

function saveSettings() {
  fs.writeFileSync(SETTINGS_FILE, mySettings, SETTINGS_TYPE);
}


function applySettings() {
  if (mySettings.bg) {
    imageBackground.image = mySettings.bg;
  }
  display.on = true;
}


//HEART RATE///////////////////////

let hrLabel = document.getElementById("hrm");
hrLabel.text = "--";


// Create a new instance of the HeartRateSensor object
var hrm = new HeartRateSensor();

// Declare an event handler that will be called every time a new HR value is received.
hrm.onreading = function() {
  // Peek the current sensor values
  console.log("Current heart rate: " + hrm.heartRate);
  hrLabel.text = hrm.heartRate;
}

// Begin monitoring the sensor
hrm.start();

// And update the display every second
setInterval(updateDisplay, 1000);
