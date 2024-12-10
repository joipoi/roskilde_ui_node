let modifiedRowsList = [];
let unsavedChangesEle;
let adminTable;
let userTable;

window.addEventListener("load", (event) => {
  if (window.location.pathname === "/admin") {
    adminTable = document.getElementById("adminTable");
    adminTable.addEventListener("input", markRowAsModified);

    unsavedChangesEle = document.getElementById("unsaved");
    document.getElementById("newRowBtn").addEventListener("click", () => {
      addRow(adminTable);
    });

    document
      .getElementById("removeBtn")
      .addEventListener("click", toggleRemove);

    adminTable.addEventListener("click", function (event) {
      if (event.target.closest(".removeCell")) {
        const row = event.target.closest("tr");
        const songID = row.dataset.id;
        removeRow(songID);
      }
    });
  } else if (
    window.location.pathname === "/login" ||
    window.location.pathname === "/"
  ) {
    const loginButton = document.querySelector("#loginButton");
    document.addEventListener("keypress", handleKeyPress);
    loginButton.addEventListener("click", () => {
      let username = document.getElementById("usernameInput").value;
      let password = document.getElementById("passwordInput").value;
      login(username, password);
    });
    function handleKeyPress(event) {
      if (event.keyCode === 13) {
        let username = document.getElementById("usernameInput").value;
        let password = document.getElementById("passwordInput").value;
        login(username, password);
      }
    }
  } else if (window.location.pathname === "/user") {
    userTable = document.getElementById("userTable");
    document.getElementById("confirmVotesBtn").addEventListener("click", () => {
      updateVotes(getVotes());
    });
  } else if (window.location.pathname === "/feedback") {
    document
      .getElementById("feedbackBtn")
      .addEventListener("click", addFeedback);
  } else if (window.location.pathname === "/votes") {
    document
      .getElementById("userSelect")
      .addEventListener("change", makeVotesTable);
  } else if (window.location.pathname === "/userEditing") {
    document.getElementById("addUser").addEventListener("click", () => {
      const userEditingTable = document.getElementById("userEditingTable");
      addRow(userEditingTable);
    });
  }

  console.log("page loaded");
});

function addRow(table) {
  const columnCount = table.rows[0].cells.length;
  const newRow = document.createElement("tr");

  for (let i = 0; i < columnCount; i++) {
    const newCell = document.createElement("td");
    newCell.setAttribute("contenteditable", "true");
    newCell.classList.add("tableCell");
    newRow.appendChild(newCell);
  }
  const symbolCell = document.createElement("td");
  symbolCell.className = "symbol-cell";

  const tableId = table.id;
  if (tableId === "adminTable") {
    symbolCell.addEventListener("click", insertSong);
  } else if (tableId === "userEditingTable") {
    symbolCell.addEventListener("click", (event) => {
      const row = event.target.closest("tr");
      const username = row.children[0].textContent.trim();
      const password = row.children[1].textContent.trim();

      registerUser(username, password);
    });
  }

  const symbolImg = document.createElement("svg");
  symbolImg.innerHTML =
    '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" ><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>';

  symbolCell.appendChild(symbolImg);
  newRow.appendChild(symbolCell);

  table.appendChild(newRow);
}

function setAsSelected(rowObj) {
  if (selectedRow != null) {
    selectedRow.style.backgroundColor = "white";
  }
  selectedRow = rowObj;
  selectedRow.style.backgroundColor = "#997f7d";
}

function markRowAsModified(event) {
  var cell = event.target;
  if (cell.classList.contains("tableCell")) {
    var row = cell.parentNode;

    if (!modifiedRowsList.includes(row)) {
      modifiedRowsList.push(row);
    }

    row.classList.add("changed");
  }
  unsavedChangesEle.style.visibility = "visible";
}
function rowToSong(row) {
  let name = row.children[0].textContent;
  let artist = row.children[1].textContent;
  let category = row.children[2].textContent;

  let song = {
    name: name,
    artist: artist,
    category: category,
  };

  return song;
}
function clearModified() {
  modifiedRowsList.forEach((row) => {
    row.classList.remove("changed");
  });
  modifiedRowsList = [];
  unsavedChangesEle.style.visibility = "hidden";
}
function toggleRemove() {
  const adminTBody = document.getElementById("adminTBody");

  const rowsArray = Array.from(adminTBody.rows);

  rowsArray.forEach((row) => {
    let removeCell = row.querySelector(".removeCell");
    if (removeCell.style.display === "none") {
      removeCell.style.display = "table-cell"; // or "block" depending on your layout
    } else {
      removeCell.style.display = "none";
    }
  });
}
function getVotes() {
  let votes = [];
  const rowsArray = Array.from(document.getElementById("userTbody").rows);

  rowsArray.forEach((row) => {
    let vote = {
      songID: row.dataset.id,
      rating: row.children[3].textContent,
    };
    votes.push(vote);
  });
  return votes;
}

function makeVotesTable(event) {
  getVotesByUserID(event.target.value).then((data) => {
    const tableBody = document.querySelector("#votesTable tbody");
    tableBody.innerHTML = "";

    data.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td class="tableCell">${item.name}</td>
          <td class="tableCell">${item.username}</td>
          <td class="tableCell">${item.rating}</td>
      `;
      tableBody.appendChild(row);
    });
  });
}

//post requests

async function insertSong(event) {
  let parentRow = event.target.parentNode.parentNode.parentNode;
  console.log(parentRow);
  event.target.parentNode.remove();

  try {
    const response = await axios.post("/insertSong", rowToSong(parentRow));
    console.log("Response received:", response.data);
  } catch (error) {
    console.error("Error :", error);
  }
  clearModified();
}

async function removeRow(songID) {
  const rows = adminTable.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    if (rows[i].dataset.id === songID) {
      rows[i].remove();
    }
  }
  try {
    const response = await axios.post("/deleteSong", { songID: songID });
    console.log("Response received:", response.data);
  } catch (error) {
    console.error("Error :", error);
  }
  clearModified();
}
async function login(username, password) {
  try {
    const response = await axios.post("/login", {
      username: username,
      password: password,
    });
    console.log("Response received:", response.data);
    if (response.data.success === true) {
      if (username == "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/user";
      }
    }
  } catch (error) {
    console.error("Error :", error);
  }
}

async function registerUser(username, password) {
  try {
    const response = await axios.post("/registerUser", {
      username: username,
      password: password,
    });
    console.log("Response received:", response.data);
  } catch (error) {
    console.error("Error :", error);
  }
}

async function updateVotes(votes) {
  try {
    const response = await axios.post("/updateVotes", {
      votes: votes,
    });
    console.log("Response received:", response.data);
  } catch (error) {
    console.error("Error :", error);
  }
}
async function addFeedback() {
  let text = document.getElementById("feedbackTextarea").value;
  try {
    const response = await axios.post("/addFeedback", {
      text: text,
    });
    console.log("Response received:", response.data);
  } catch (error) {
    console.error("Error :", error);
  }
}

async function getVotesByUserID(userID) {
  try {
    const response = await axios.post("/getVotesByUserID", {
      userID: userID,
    });
    return response.data.response;
  } catch (error) {
    console.error("Error :", error);
  }
}
