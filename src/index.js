const video = document.querySelector('.webcam');
const canvas = document.querySelector('.video');
const context = canvas.getContext('2d');
const faceCanvas = document.querySelector('.face');
const faceContext = faceCanvas.getContext('2d');
const faceDetector = new FaceDetector();
const inputs = document.querySelectorAll('.controls input[type="range"]');

const options = {
 SIZE: 10,
 SCALE: 1.3 
}

function handleOption(){
 options[this.name] = parseFloat(this.value);
}

inputs.forEach(input => input.addEventListener('input', handleOption));


// populate users video
async function populateVideo(){
 const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: 1300, height: 760 }
 });
 video.srcObject = stream;
 await video.play();
 // size the canvases to the be same size as video
 canvas.width = video.videoWidth;
 canvas.height = video.videoHeight;
 faceCanvas.width = video.videoWidth;
 faceCanvas.height = video.videoHeight;
}

async function detectFace(){
 const faces = await faceDetector.detect(video);
 //console.log(faces.length);

 // ask the browser when the next animation frame is
 // and tell it to run detectFace
 faces.forEach(drawFace);
 faces.forEach(censor);
 requestAnimationFrame(detectFace)
}

function drawFace(face){
 const { width, height, top, left } = face.boundingBox;
 context.clearRect(0, 0, canvas.width, canvas.height);
 context.strokeStyle = '#ffc662';
 context.lineWidth = 2;
 context.strokeRect(left, top, width, height);
}

function censor({ boundingBox: face}){
  faceContext.imageSmoothingEnabled = false;
  faceContext.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
  // draw the face
  faceContext.drawImage(
   // 5 source args
   video,  // where does the source come from
   face.x, // where do we start the source pull from
   face.y,
   face.width,
   face.height,

   // 4 draw args
   face.x, // where we start drawing x & y
   face.y,
   options.SIZE,
   options.SIZE
  );

  const width = face.width * options.SCALE;
  const height = face.height * options.SCALE;
  faceContext.drawImage(
   // 5 source args
   faceCanvas,  // source
   face.x, // where do we start the source pull from
   face.y,
   options.SIZE,
   options.SIZE,

   // 4 draw args
   face.x - (width - face.width) / 2, // where we start drawing x & y
   face.y - (height - face.height) / 2,
   width,
   height
  );
}

populateVideo().then(detectFace)