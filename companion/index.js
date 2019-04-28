import { device } from "peer";
import { settingsStorage } from "settings";
import { outbox } from "file-transfer";
import { Image } from "image";

settingsStorage.setItem("screenWidth", device.screen.width);
settingsStorage.setItem("screenHeight", device.screen.height);

settingsStorage.onchange = function(evt) {
  if (evt.key === "background-image") {
    compressAndTransferImage(evt.newValue);
    //let imageData = JSON.parse(evt.newValue);
    // We now have our image data in: imageData.imageUri
    console.log("An image was selected")
  }
}

function compressAndTransferImage(settingsValue) {
  const imageData = JSON.parse(settingsValue);
  Image.from(imageData.imageUri)
    .then(image =>
      image.export("image/jpeg", {
        background: "#FFFFFF",
        quality: 40
      })
    )
    .then(buffer => outbox.enqueue(`${Date.now()}.jpg`, buffer))
    .then(fileTransfer => {
      console.log(`Enqueued ${fileTransfer.name}`);
    });
}
