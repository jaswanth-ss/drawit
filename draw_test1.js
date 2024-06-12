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
let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let c = canvas.getContext("2d");
let r = 1;
c.lineWidth = 2 * r;
let drawing = [];
let colour = 0;
indRef.on("value", update);
// function update(snapshot) {
//     let undo = snapshot.val();
//     if (undo >= 0) {
//         indRef.once('value').then(function (snapshots) {
//             let index = snapshots.val();
//             database.ref("drawings/" + index).once('value').then(function (snap) {
//                 let data = snap.val();
//                 console.log(data)
//                 if(data != null){
//                 for(let i=0;i<Object.keys(data).length;i++){
//                   let point={
//                     x:data[i].x,
//                     y:data[i].y
//                   };
//                   drawing.push(point);
//                 }
//                 redraw();
//               }
//             });
//             index = index + 1;
//             database.ref("drawings/" + index).remove();
//         });
//     }
// }
let img_arr = [];
async function update(snapshot) {
  try {
    let index = snapshot.val();
    if (index >= 0) {
      let undo = await undoRef
        .once("value")
        .then((snapshots) => snapshots.val());
      if (undo >= 0) {
        console.log(index);
        index = index + 1;
      }
      if (undo == 0) {
        index = 1;
      }
      if (index !== null) {
        let snap = await database.ref("drawings/" + index).once("value");
        let data = snap.val();

        if (data !== null) {
          Object.keys(data).forEach((key) => {
            let point = {
              x: data[key].x,
              y: data[key].y,
            };
            drawing.push(point);
          });

          draw(drawing[0].x, drawing[0].y);
          if (undo > 0) {
            undo212();
            database.ref("drawings/" + index).remove();
          } else {
            redraw(0);
          }
          img_arr.push(c.getImageData(0, 0, innerWidth, innerHeight));
          drawing = [];
        }

        //await database.ref("drawings/" + index).remove();
      }
    }
  } catch (error) {
    console.error("Error in update:", error);
  }
}

function draw(x, y, a) {
  c.lineTo(x, y);
  c.stroke();
  c.beginPath();
  c.arc(x, y, r, 0, 2 * Math.PI, false);
  c.fill();
  c.beginPath();
  c.moveTo(x, y);
  if (a == 1) {
    c.fillStyle = "#FFFFFF";
    c.strokeStyle = "#FFFFFF";
  } else {
    c.strokeStyle = "black";
    c.fillStyle = "black";
  }
}

function redraw(a) {
  for (let i = 0; i < drawing.length; i++) {
    draw(drawing[i].x, drawing[i].y, a);
  }
  c.beginPath();
}

