const firebaseConfig = {
  apiKey: "AIzaSyBSBMsHx_wAlBXjDFSTIua8bjJ9-6jfPRw",
  authDomain: "draw-f06ad.firebaseapp.com",
  projectId: "draw-f06ad",
  storageBucket: "draw-f06ad.appspot.com",
  messagingSenderId: "40349375329",
  appId: "1:40349375329:web:9af734b551177b33220320",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
let drawingsRef = database.ref("drawings");
let indRef = database.ref("index");
let undoRef = database.ref("undo");
undoRef.set(-1);
indRef.set(-1);
drawingsRef.remove(function (error) {
  if (error) {
    console.error("Data could not be removed.", error);
  } else {
    console.log("Data removed successfully.");
  }
});
let ind = -1;
let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let c = canvas.getContext("2d");
let drawing = [];
let def_r = 1;
r = def_r;
let min_r = 0.5;
let max_r = 100;
c.lineWidth = 2 * r;
let mouse = {
  x: 0,
  y: 0,
};
let engage = false;
let img_arr = [];
c.canvas.willReadFrequently = true;
canvas.addEventListener("mousedown", function (event) {
  if (event.target.classList[0] == "canvas_area") {
    engage = true;
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    draw(mouse.x, mouse.y);
    drawing.push(mouse);
    undoRef.set(-1);
  }
});

canvas.addEventListener("mouseup", function (event) {
  if (event.target.classList[0] == "canvas_area") {
    engage = false;
    img_arr.push(c.getImageData(0, 0, innerWidth, innerHeight));
    ind += 1;
    c.beginPath();
    storeImageDataInFirebase(ind);
    drawing = [];
  }
});

function undo() {
  ind -= 1;
  if (ind >= -1) {
    indRef.set(ind);
    undoRef.set(ind + 1);
  }
  img_arr.pop();
  if (ind >= 0) {
    c.putImageData(img_arr[img_arr.length - 1], 0, 0);
  } else {
    c.clearRect(0, 0, innerWidth, innerHeight);
    return;
  }
}

function storeImageDataInFirebase(ind) {
  var drawingsRef = database.ref("drawings");
  indRef.set(ind);
}

function clearscreen() {
  c.clearRect(0, 0, innerWidth, innerHeight);
  ind = -1;
  img_arr = [];
  indRef.set(-1);
  var drawingsRef = database.ref("drawings");
  drawingsRef.remove(function (error) {
    if (error) {
      console.error("Data could not be removed.", error);
    } else {
      console.log("Data removed successfully.");
    }
  });
}
function draw(x, y) {
  c.lineTo(x, y);
  c.stroke();
  c.beginPath();
  c.arc(x, y, r, 0, 2 * Math.PI, false);
  c.fill();
  c.beginPath();
  c.moveTo(x, y);
}
document.getElementById("size").innerText = r;
document.getElementById("dec").addEventListener("click", function () {
  if (r - 1 < min_r) r = min_r;
  else if (r - 1 > 11) r = r - 5;
  else r -= 1;
  document.getElementById("size").innerText = r;
  c.lineWidth = 2 * r;
});
document.getElementById("inc").addEventListener("click", function () {
  if (r == 0.5) r = 1;
  else if (r + 1 < 11) r = r + 1;
  else if (r + 1 >= 11 && r + 5 < max_r) r = r + 5;
  else r = max_r;
  document.getElementById("size").innerText = r;
  c.lineWidth = 2 * r;
});
const colorButtons = document
  .getElementById("colors")
  .getElementsByTagName("button");

for (let i = 0; i < colorButtons.length; i++) {
  colorButtons[i].addEventListener("click", (e) => {
    for (let j = 0; j < colorButtons.length; j++) {
      colorButtons[j].style.border = "2.5px solid white";
    }
    const computedStyle = window.getComputedStyle(e.target);
    e.target.style.border = "2.5px solid black";
    const backgroundColor = computedStyle.backgroundColor;
    c.strokeStyle = backgroundColor;
    c.fillStyle = backgroundColor;
  });
}

document.getElementById("undo_btn").addEventListener("click", undo);

// canvas.addEventListener("mousemove", function (event) {
//   if (engage) {
//     mouse.x = event.clientX;
//     mouse.y = event.clientY;
//     draw(mouse.x, mouse.y);
//     drawingsRef.child(ind).set(mouse, function (error) {
//       if (error) {
//         console.error("Data could not be saved.", error);
//       } else {
//         console.log("Data saved successfully.");
//       }
//     });
//   }
// });
canvas.addEventListener("mousemove", function (event) {
  if (engage) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    draw(mouse.x, mouse.y);
    var coordinatesRef = drawingsRef.child(ind + 1).push(); // Generates a unique key
    coordinatesRef.set(mouse, function (error) {
      if (error) {
        console.error("Data could not be saved.", error);
      } else {
        console.log("Data saved successfully.");
      }
    });
  }
});
