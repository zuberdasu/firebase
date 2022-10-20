const chocs = {};
let chocNames = [];

//untangle the data
function formatData(data) {
  //defensive check
  if (!data) {
    throw new Error("You sent some bad data!");
  }

  const { mars, snickers, twix, bounty } = data;

  return [
    { label: "Mars", value: mars },
    { label: "Snickers", value: snickers },
    { label: "Twix", value: twix },
    { label: "Bounty", value: bounty },
  ];
}

//draw the graph
function drawGraph(data, mountNodeSelector = "#chart svg") {
  nv.addGraph(function () {
    const chart = nv.models
      .pieChart()
      .x((d) => d.label)
      .y((d) => d.value)
      .showLabels(true);

    d3.select(mountNodeSelector)
      .datum(data)
      .transition()
      .duration(350)
      .call(chart);

    return chart;
  });
}

//google setup
const firebaseConfig = {
  apiKey: "AIzaSyDdml58uyTsaxxqEZy8Vj73k6AAJOGWDYE",
  authDomain: "fir-79747.firebaseapp.com",
  projectId: "fir-79747",
  storageBucket: "fir-79747.appspot.com",
  messagingSenderId: "636265311954",
  appId: "1:636265311954:web:e2f15cb342fad2b495470b",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const chocsCollectionRef = db.collection("chocs");

//getting intial data
chocsCollectionRef.get().then((snapshot) => {
  snapshot.forEach((childSnapshot) => {
    //makes list of moods from the server
    const { id } = childSnapshot;
    chocNames.push(id);

    //get the data
    const { value } = childSnapshot.data();
    chocs[id] = value;
  });

  drawGraph(formatData(chocs));
});

//get updates
chocsCollectionRef.onSnapshot((snapshot) => {
  snapshot.docChanges().forEach(function (change) {
    chocs[change.doc.id] = change.doc.data().value;
  });

  drawGraph(formatData(chocs));
});

//updating google
async function incrementField(field) {
  //defensive check
  if (typeof field !== "string") {
    throw new Error("Sorry, bad field");
  }

  //update google
  try {
    await chocsCollectionRef.doc(field).update({ value: chocs[field] + 1 });
  } catch (error) {
    console.log(error);
  }
}

//interface
const controlsRef = document.getElementById("controls");

controlsRef.addEventListener("click", (e) => {
  incrementField(e.target.id);
});
