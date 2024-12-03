var tableDiv;
var adminTable;
var userTable;
var resultTable;
var isAdmin;
var modifiedRowsList = [];
//todo change nav menu depending on if admin or not.

///
///user.html functions
///

//initalizes the user.html page
function initUserPage() {
   userTable = document.getElementById("userTable");

    getUsername()
      .then(function(response) {
        var username = response;
        console.log("in initUserPage function, username = " + username)
        document.getElementById("userLoggedIn").innerHTML = "Logged in as: " + username;
      })
      .catch(function(error) {
        // Handle any errors that occur during the getUsername function
        console.error("Error:", error);
      });

    generateBlankUserTable();
     document.getElementById("confirmVotesBtn").addEventListener("click", function() {
            if (confirm("Are you sure you want to confirm the votes?")) {
            for(var i = 0; i < modifiedRowsList.length; i++) {
                        modifiedRowsList[i].style.backgroundColor = "";
                       }
                confirmVotes();
            }
        });
    document.getElementById("yearSelect").addEventListener("change", function(e){
        GetSongsFromYear(e.target.value, userTable);
    });
}

function generateBlankUserTable() {

    for(var i = 0; i < 50; i++) {
         var row = userTable.insertRow(userTable.length);

          for(var j = 0; j < 4; j++) {
                 var cell = row.insertCell(j);
                 if(j == 3) {
                    cell.contentEditable = true;
                     cell.addEventListener("input", markRowAsModified);
                 }
             }

    }

    for(let i = 0; i < 4; i++) {
        userTable.rows[0].getElementsByTagName("th")[i].addEventListener("click", function(){
            sortTable(i, userTable);
        });
    }

    GetSongsFromYear(document.getElementById("yearSelect").value, userTable);

}


///
///admin.html functions
///

//initalizes the admin.html page
 function initAdminPage() {
 if(getCookie("userID") !== "3") {
    window.location.replace("/login");
 }
 adminTable = document.getElementById("adminTable");

 generateBlankAdminTable();

    document.getElementById("yearSelect").addEventListener("change", function(e){
        GetSongsFromYear(e.target.value, adminTable);
    });
 }

function generateBlankAdminTable() {

  for (var i = 0; i < 50; i++) {
    var row = adminTable.insertRow(adminTable.length);
    row.className = "tableRow";

    for (var j = 0; j < 3; j++) {
      var cell = row.insertCell(j);
      cell.contentEditable = true;
      cell.addEventListener("input", markRowAsModified);

    }
    }
  var confirmBtn = document.getElementById("confirmButton");
  confirmBtn.addEventListener("click", function(e){
  updateAdminTableInDatabase(modifiedRowsList);
    for(var i = 0; i < modifiedRowsList.length; i++) {
        modifiedRowsList[i].style.backgroundColor = "";
    }
  });

    for (let i = 0; i < 3; i++) {
    adminTable.rows[0].getElementsByTagName("th")[i].addEventListener("click", function () {
      sortTable(i, adminTable);
    });
    }

  GetSongsFromYear(document.getElementById("yearSelect").value, adminTable);
}

function markRowAsModified(event) {
  var cell = event.target;
  var row = cell.parentNode;
  if(!modifiedRowsList.includes(row)) {
    modifiedRowsList.push(row);
  }
  // Change the color of the modified row
  row.style.backgroundColor = "#730f11";
}

//fills either user or admin table with DB data
function fillTable(tableData, targetTable) {
    clearTable(targetTable);
    if (targetTable == userTable) {
        fetchUserVotesByYear(getCookie("userID"), document.getElementById("yearSelect").value)
            .then(function(jsonResponse) {
                var ratingArray = jsonResponse;
                for (var row = 0; row < tableData.length; row++) {
                    targetTable.rows[row+1].getElementsByTagName("td")[0].innerHTML = tableData[row].name;
                    targetTable.rows[row+1].getElementsByTagName("td")[1].innerHTML = tableData[row].artist;
                    targetTable.rows[row+1].getElementsByTagName("td")[2].innerHTML = tableData[row].category;

                    targetTable.rows[row+1].setAttribute('data-id', tableData[row].songID);

                    if(ratingArray[row] === undefined) {
                        targetTable.rows[row+1].getElementsByTagName("td")[3].innerHTML = "";
                    }else {
                        targetTable.rows[row+1].getElementsByTagName("td")[3].innerHTML = ratingArray[row];
                    }
                }
            })
            .catch(function(error) {
                console.error(error);
            });
    } else {
        for (var row = 0; row < tableData.length; row++) {
            targetTable.rows[row+1].getElementsByTagName("td")[0].innerHTML = tableData[row].name;
            targetTable.rows[row+1].getElementsByTagName("td")[1].innerHTML = tableData[row].artist;
            targetTable.rows[row+1].getElementsByTagName("td")[2].innerHTML = tableData[row].category;
            targetTable.rows[row+1].setAttribute('data-id', tableData[row].songID);
        }
    }
}
///
///votes.html functions
///
function initVotePage() {
console.log("test");
 document.getElementById("yearSelect").addEventListener("change", function(e){
    fetchVoteTable(document.getElementById("userSelect").value, e.target.value);
 });
 document.getElementById("userSelect").addEventListener("change", function(e){
    fetchVoteTable(e.target.value, document.getElementById("yearSelect").value);
 });

 fetchVoteTable(document.getElementById("userSelect").value, document.getElementById("yearSelect").value);


}

function fillVoteTable(data) {
    let votesTable = document.getElementById("votesTable");

    // Clear existing rows in the table
    while (votesTable.rows.length > 1) {
        votesTable.deleteRow(1);
    }

    // Add new rows with the updated data
    for (let row = 0; row < data.length; row++) {
        // Create a new table row
        let newRow = votesTable.insertRow(-1);

        // Insert cells for the new row and set their innerHTML
        let nameCell = newRow.insertCell(0);
        nameCell.innerHTML = data[row].name;

        let usernameCell = newRow.insertCell(1);
        usernameCell.innerHTML = data[row].username;

        let ratingCell = newRow.insertCell(2);
        ratingCell.innerHTML = data[row].rating;
    }
}

///
///Results.html functions
///
function initResultsPage() {
  resultTable = document.getElementById("resultTable");

 generateBlankResultTable();

    document.getElementById("yearSelect").addEventListener("change", function(e){
       GetResultsFromYear(e.target.value);
    });
 }

function generateBlankResultTable() {

    for(var i = 0; i < 15; i++) {
         var row = resultTable.insertRow(resultTable.length);

          for(var j = 0; j < 5; j++) {
                 var cell = row.insertCell(j);
             }

    }

    for(let i = 0; i < 5; i++) {
        resultTable.rows[0].getElementsByTagName("th")[i].addEventListener("click", function(){
            sortTable(i, resultTable);
        });
    }
    GetResultsFromYear(document.getElementById("yearSelect").value);

}
function fillResultsTable(tableData) {
console.log("tabledata =  " + tableData);
    for(var row = 0; row < tableData.length; row++) {
                resultTable.rows[row+1].getElementsByTagName("td")[0].innerHTML = tableData[row].name;
                resultTable.rows[row+1].getElementsByTagName("td")[1].innerHTML = tableData[row].artist;
                resultTable.rows[row+1].getElementsByTagName("td")[2].innerHTML = tableData[row].category;
                resultTable.rows[row+1].getElementsByTagName("td")[3].innerHTML = tableData[row].total_rating;
                 resultTable.rows[row+1].getElementsByTagName("td")[4].innerHTML = row+1;
                resultTable.rows[row+1].setAttribute('data-id', tableData[row].songID);
         }
}

///
///userEditing.html functions
///
function userEditingInit() {
    generateUserEditingTable();

       updateBtn = document.getElementById("updateBtn");
        updateBtn.addEventListener("click", function(){
               updateUser();
                for(var i = 0; i < modifiedRowsList.length; i++) {
                modifiedRowsList[i].style.backgroundColor = "";
                }
                });
}

function generateUserEditingTable() {
    var table = document.getElementById("userEditingTable");


    for(var i = 0; i < 30; i++) {
         var row = table.insertRow(table.length);

          for(var j = 0; j < 2; j++) {
                 var cell = row.insertCell(j);
                   cell.contentEditable = true;
                   cell.addEventListener("input", markRowAsModified);

             }

    }

    GetAllUsers();
}

function fillUserEditingTable(tableData) {
var targetTable = document.getElementById('userEditingTable');
    clearTable(targetTable);
        for (var row = 0; row < tableData.length; row++) {
            targetTable.rows[row+1].getElementsByTagName("td")[0].innerHTML = tableData[row].username;
            targetTable.rows[row+1].getElementsByTagName("td")[1].innerHTML = tableData[row].password;
            targetTable.rows[row+1].setAttribute('data-id', tableData[row].userID);
        }
}

///
///http request functions
///
function fetchUserVotesByYear(userID, year) {
  return new Promise(function(resolve, reject) {
    var xhttp;
    var data = userID + "," + year;

    xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
          var jsonResponse = JSON.parse(xhttp.responseText);
          resolve(jsonResponse);
        } else {
          reject("Error: " + xhttp.status);
        }
      }
    };

    xhttp.open("POST", "getVotes", true);
    xhttp.send(data);
  });
}

function fetchVoteTable(userID, year) {
       var xhttp;
       var data = userID + "," + year;

              xhttp = new XMLHttpRequest();

              xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                var jsonResponse = JSON.parse(xhttp.responseText);

                   fillVoteTable(jsonResponse);

                }
              };
              xhttp.open("POST", "getVoteTable", true);
              xhttp.send(data);
}

function GetSongsFromYear(year, targetTable){
          var xhttp;

          xhttp = new XMLHttpRequest();

          xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(xhttp.responseText);
                    fillTable(jsonResponse, targetTable);
            }
          };
          xhttp.open("POST", "selectFromYear", true);
          xhttp.send(year);
}

function updateAdminTableInDatabase(modifiedTable) {

    let httpText = "";

    for(var i = 0; i < modifiedTable.length; i++ ) {
    var row = modifiedTable[i];

            var name = sanitizeUserInput(row.getElementsByTagName("td")[0].innerHTML);
            var artist = sanitizeUserInput(row.getElementsByTagName("td")[1].innerHTML);
            var category = sanitizeUserInput(row.getElementsByTagName("td")[2].innerHTML);
            var year = document.getElementById("yearSelect").value;
            var songID = row.getAttribute('data-id');

            httpText += '{"name": "' + name +  '", "artist": "' + artist +  '", "category": "' + category +  '", "year": "' + year +  '", "songID": "' + songID +  '"}, ';
    }

      var xhttp;

      xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
         var jsonResponse = JSON.parse(xhttp.responseText);
        GetSongsFromYear(document.getElementById("yearSelect").value,adminTable)

        }
      };
      xhttp.open("POST", "updateDB", true);
      xhttp.send(httpText);
}

function confirmVotes() {
  // Get the rows of the user table
  const rows = userTable.rows;

  // Initialize an empty data array
  const data = [];

  // Loop through the rows of the table and build the data array
  for (let i = 1; i < getIndexOfFirstEmptyRowInColumn(userTable, 0); i++) {
    // Get the rating, song ID, and user ID from the table row
    const rating = sanitizeUserInput(rows[i].getElementsByTagName("td")[3].innerHTML);
    const songID = sanitizeUserInput(rows[i].getAttribute('data-id'));
    const userID = getCookie("userID");

    // Add the data to the data array in JSON format
    data.push({ rating, songID, userID });
  }

  // Send the data to the server via a POST request using fetch
  fetch("confirmVotes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    // Handle the server response here if needed
  })
  .catch(error => {
    console.error("There was a problem with the fetch operation:", error);
  });
}

function getUsername() {
  return new Promise(function(resolve, reject) {
    var userID = getCookie("userID");
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
        console.log("in getUsername function, responseText = " + xhttp.responseText);
          resolve(xhttp.responseText);
        } else {
          reject("Error: " + xhttp.status);
        }
      }
    };

    xhttp.open("POST", "getUsername", true);
    xhttp.send(userID);
  });
}


function GetResultsFromYear(year){
          var xhttp;

          xhttp = new XMLHttpRequest();

          xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(xhttp.responseText);
                    fillResultsTable(jsonResponse);
            }
          };
          xhttp.open("POST", "getResults", true);
          xhttp.send(year);
}

function GetAllUsers(){
          var xhttp;

          xhttp = new XMLHttpRequest();

          xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
            var jsonResponse = JSON.parse(xhttp.responseText);
                    fillUserEditingTable(jsonResponse);
            }
          };
          xhttp.open("POST", "getAllUsers", true);
          xhttp.send();
}

function updateUser() {
           var userData = [];

           for (var i = 0; i < modifiedRowsList.length; i++) {
             var row = modifiedRowsList[i];
             var cells = row.getElementsByTagName('td');
             var userID = row.getAttribute('data-id');
             var username = cells[0].innerText;
             var password = cells[1].innerText;
             var user = {
               username: username,
               password: password,
               userID: userID
             };
             userData.push(user);
           }
           var jsonData = JSON.stringify(userData);
           console.log(jsonData);

           var xhttp;
           xhttp = new XMLHttpRequest();

           xhttp.onreadystatechange = function() {
             if (this.readyState == 4 && this.status == 200) {
              //GetAllUsers(); callbacks maybe?
             }
           };
           xhttp.open("POST", "updateUser", true);
           xhttp.send(jsonData);
}
///
///helper functions
///



function getCookie(cname) {
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookie = decodedCookie.split(';').find(c => c.trim().startsWith(cname));
  if (cookie) {
    return cookie.substring(cookie.indexOf("=")+1);
  }
  throw new Error(`Cookie "${cname}" not found.`);
}

function attemptLogin() {
  const usernameInput = document.querySelector("#usernameInput");
  const passwordInput = document.querySelector("#passwordInput");

  const data = {
    username: usernameInput.value,
    password: passwordInput.value
  };

  fetch("login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Network response was not ok. Status: " + response.status);
    }
  }).then(data => {
    if (data !== -1) {
      document.cookie = "userID=" + data;
      var userID = getCookie("userID");
      if(userID === "3") {//THIS IS A PROBLEM BECAUE 3 IS JUST THE USERID FOR ADMIN ON MY COMPUTER
        window.location.replace("/admin");
      }else {
       window.location.replace("/user");
      }

    } else {
      alert("Login failed");
    }
  }).catch(error => {
    console.error("Error during login:", error);
    alert("Login failed");
  }).finally(() => {
  });
}



//stops the program from breaking when { or } is input
function sanitizeUserInput(input) {

    return input.replace('{', '§').replace('}', '§');
}

//sort an html table either alphabetically or numerically. n = index of clicked element. (stole this from the internet)
function sortTable(n,targetTable ) {
    var rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    dir = "asc";

    var nonEmptyRows = getIndexOfFirstEmptyRowInColumn(targetTable, n);

    while (switching) {
      switching = false;
      rows = targetTable.rows;
      for (i = 1; i < nonEmptyRows-1; i++) {
        shouldSwitch = false;

        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];

        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;
      } else {
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }

function clearTable(targetTable) {
  for (var row = 1; row < targetTable.rows.length; row++) {
    var cells = targetTable.rows[row].querySelectorAll("td");
    for (var col = 0; col < cells.length; col++) {
      cells[col].textContent = "";
    }
    targetTable.rows[row].setAttribute('data-id', "");
  }
}

function getIndexOfFirstEmptyRowInColumn(tableElement, columnIndex) {
  const rows = tableElement.rows;
  const numRows = rows.length;

  for (let i = 1; i < numRows - 1; i++) {
    const cellValue = rows[i].cells[columnIndex].textContent.trim();

    if (cellValue === "") {
      return i;
    }
  }

  console.error(`No empty rows found in column ${columnIndex}`);
  return -1;
}
function clearTableRow(index) {
              const cells = adminTable.rows[index].querySelectorAll('td');
              cells.forEach(cell => {
                        cell.textContent = '';
                      });
}
function setAsSelected(rowObj) {
    //if a row is selected already, make it white so as to de-select
    if(selectedRow != null) {
        selectedRow.style.backgroundColor = "white";
    }
    selectedRow = rowObj;
    selectedRow.style.backgroundColor = "#997f7d";
}
 function toggleNavMenu() {
      var navMenu = document.getElementById("navMenu");
      var navIcon = document.querySelector(".nav-icon");

      navMenu.classList.toggle("active");
      navIcon.style.display = navMenu.classList.contains("active") ? "none" : "block";
    }

