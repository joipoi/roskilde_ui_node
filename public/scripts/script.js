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

    const userSelects = document.querySelectorAll('.user-select');

    userSelects.forEach(select => {
        const selectedUser = select.getAttribute('data-user');

       Array.from(select.options).forEach(option => {
            if (option.value === selectedUser) {
                option.selected = true;
            }
        }); 
    });

    const categorySelects = document.querySelectorAll('.category-select');

    categorySelects.forEach(select => {
        const selectedCategory = select.getAttribute('data-category');

       Array.from(select.options).forEach(option => {
            if (option.value === selectedCategory) {
                option.selected = true;
            }
        }); 
    });

    const editable = document.querySelectorAll('[contenteditable]');

    //Forces copy paste to not inculde style
    editable.forEach(element => {
      element.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
      
        document.execCommand('insertText', false, text);
      });
    });

    
    


    document
      .getElementById("removeBtn")
      .addEventListener("click", toggleRemove);

      document
      .getElementById("saveBtn")
      .addEventListener("click", updateSongs);

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

      document
      .getElementById("removeFeedbackBtn")
      .addEventListener("click", removeFeedback);
     
  } else if (window.location.pathname === "/votes") {
    document
      .getElementById("userSelect")
      .addEventListener("change", makeVotesTable);

  } else if (window.location.pathname === "/userEditing") {

    const userEditingTable = document.getElementById("userEditingTable");
    document.getElementById("addUser").addEventListener("click", () => {
      addRow(userEditingTable);
    });
  }

});

function addRow(table) {
  const columnCount = table.rows[0].cells.length;
  const newRow = document.createElement("tr");
  const userSelect = document.querySelector('.user-select');
  const categorySelect = document.querySelector('.category-select');

  for (let i = 0; i < columnCount; i++) {
    const newCell = document.createElement("td");
  
    if(i == 3){
      const clonedSelect = userSelect.cloneNode(true);
      clonedSelect.removeAttribute('data-user');
      newCell.appendChild(clonedSelect);
    }
    if(i == 2){
      const clonedSelect = categorySelect.cloneNode(true);
      clonedSelect.removeAttribute('data-category');
      newCell.appendChild(clonedSelect);
    }
    newCell.setAttribute("contenteditable", "true");
    newCell.classList.add("tableCell");
    newRow.appendChild(newCell);

    newCell.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
    
      // Insert plain text at the caret position
      document.execCommand('insertText', false, text);
    });


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
      event.target.closest("td").remove();
    });
  }

  const symbolImg = document.createElement("svg");
  symbolImg.innerHTML =
    '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" ><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>';

  symbolCell.appendChild(symbolImg);
  newRow.appendChild(symbolCell);

  table.appendChild(newRow);
}

function markRowAsModified(event) {
  let cell = event.target;
  
  if(cell.className == "user-select" || cell.className == "category-select"){
    cell = cell.parentNode;
  }
  if (cell.classList.contains("tableCell")) {
    var row = cell.parentNode;
    if(row.dataset["id"]){

    if (!modifiedRowsList.includes(row)) {
      modifiedRowsList.push(row);
    }

    row.classList.add("changed");
    unsavedChangesEle.style.visibility = "visible";
  }
  }
  
}
function rowToSong(row) {
  let name = row.children[0].textContent;
  let artist = row.children[1].textContent;
  let category = row.children[2].children[0].value;
  let user = row.children[3].children[0].value;
  let song = {
    name: name,
    artist: artist,
    category: category,
    user: user
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
    console.log("rating = " + row.children[3].textContent);
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
 let parentRow = event.target.closest('tr');
  event.target.closest("td").remove();

  try {
    const response = await axios.post("/insertSong", rowToSong(parentRow));
  } catch (error) {
    console.error("Error :", error);
  }
 // clearModified();
}
async function updateSongs() {
  
  for(let row of modifiedRowsList){
    let song = rowToSong(row);
    song.id = row.dataset.id;
    
    try {
      const response = await axios.post("/editSong", song);
    } catch (error) {
      console.error("Error :", error);
    }
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
  if(password === ''){
    password = 'no-password';
  }
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
    document.getElementById("loginDisplay").innerHTML = "Login Failed for user: " + username;
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
  document.getElementById("feedbackList").innerHTML += "<li><p>" + text + "</p></li>";
  try {
    const response = await axios.post("/addFeedback", {
      text: text,
    });
    console.log("Response received:", response.data);
  } catch (error) {
    console.error("Error :", error);
  }
}

async function removeFeedback() {
  try {
    const response = await axios.post("/removeFeedback");
    document.getElementById("feedbackList").innerHTML = "";
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
