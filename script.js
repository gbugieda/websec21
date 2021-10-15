/********* START FIREBASE CONNECTION CODE *********/
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import * as rtdb from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";
import * as fbauth from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmaP-2H6R9Osnui1piG8URHOiN4UaXat4",
  authDomain: "websec21-chatapp.firebaseapp.com",
  databaseURL: "https://websec21-chatapp-default-rtdb.firebaseio.com",
  projectId: "websec21-chatapp",
  storageBucket: "websec21-chatapp.appspot.com",
  messagingSenderId: "332741772190",
  appId: "1:332741772190:web:aaa0db201b1a651b914c8f"
};

// Initialize Firebase & Ref variables
const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);
let titleRef = rtdb.ref(db, "/");
let chatRef = rtdb.child(titleRef,"chats")
let userRef = rtdb.child(titleRef,"users")
let userId = "anonymous"
let userFlag = 0;
let auth = fbauth.getAuth(app);

/********* END FIREBASE CONNECTION CODE *********/






/********* START USER AUTHENTICATION *********/
$("#login").on("click",function(){
  //show login options and hide register options
  $(".user-auth-reg").hide();
  $(".user-auth-login").show()();

  //signInWithEmailAndPassword
  //retrieve username
  /*
  let tempUid = $("#uid").val();
  if (tempUid.trim().length == 0){ //empty string or only spaces
    alert("Please enter an actual username!")
  }
  else{
    userId = $("#uid").val();
    $(".user-auth-login").hide(); //hide enter userID section
    $( "<h3 class=header >USER: " + userId + "</h3>" ).insertAfter( ".user-auth" );
    $(".discord").show();
    userFlag = 1;
  }
  */
})




$("#register").on("click",function(){
  //$(".user-auth-login").hide();
  //$(".user-auth-reg").show();
  let email = $("#regEmail").val();
  let password = $("#regPassword").val();
  let username = $("#regUsername").val();

  fbauth.createUserWithEmailAndPassword(auth, email, password).then(userData=>{
    
    let uid = userData.user.uid;
    let userObj = {"uid":uid,"username":username,"roles":{"user":true}};
    rtdb.push(userRef,userObj);

    }).catch(function(error){
    let errorCode = error.code;
    let errorMsg = error.message;
    if (errorCode == "auth/weak-password"){
      alert("Password needs to be at least 6 characters!");
    }
    console.log(errorCode);
    console.log(errorMsg);
  })
  $(".user-auth").hide();
  $( "<h3 class=header >USER: " + username + "</h3>" ).insertAfter( ".user-auth" );
  $(".discord").show();
  userFlag = 1;

})


/*
fbauth().createUserWithEmailAndPassword(email,password).catch(function(error){
  let errorCode = error.code;
  let errorMsg = error.message;
  console.log(errorCode);
  console.log(errorMsg);
})
*/
/********* END USER AUTHENTICATION *********/


rtdb.onValue(chatRef, ss=>{
  let message = ss.val();
  if (!!message){
    displayChats(message);
  }
})
rtdb.onChildRemoved(chatRef, ss=>{
  $("#chatHist").empty();
})



$("#clear").on("click",function(){
  rtdb.set(chatRef,{});
})

/* Sends msg to db */
$("#send").on("click",function(){
  if (userFlag == 1){
    let date = getDate();
    let msg = $("#msg").val();
    let msgObj = {"msg":msg,"user":userId,"date":date};
    rtdb.push(chatRef,msgObj);
    $("#msg").val('');
  }
  else{
    alert("You must enter a username before sending a message!");
    $("#msg").val('');
  }
  
})



//TODO: If current content editable is insecure, adapt this function to fix security issues
function editMessage(evt, msgId){
  //get userID from database
  //check if user id matches msg ID
  //if so, allow edit, if not don't allow
  //if (evt.target === evt.currentTarget && $(`[data-id=${msgId}]`).children("#editMsg").length == 0){
   // console.log(child(String(msgId)));
    //$(`[data-id=${msgId}]`).hide();
   // $(`[data-id=${msgId}]`).append(`<input type="text" id="editMsg" name="msg" >`);
   // $(`[data-id=${msgId}]`).children().show();
  //}
}

function displayChats(chatObj){
  $("#chatHist").empty(); //empty list on page
  let divide = ": "
  Object.keys(chatObj).map(chatID=>{
    //CHECK W/ PROF if I leave following code like this, can someone change plaintext only to true, thus incurring security issue
    let $li = $(`<li class="chatElem"  data-id=${chatID}><span class=header> ${chatObj[chatID]["user"]}${divide}</span><span contenteditable='plaintext-only'> ${chatObj[chatID]["msg"]}</span></li>`);
    $("#chatHist").append($li);
    $li.click((event)=>{
      let clickedChat = $(event.currentTarget).attr("data-id");
      editMessage(event,clickedChat);
     // alert("here");
    })
   // $("#chatHist").append(`<li class="chatElem" data-id=${chatID}><span class=header> ${chatObj[chatID]["user"]}</span>` + ": " + `${chatObj[chatID]["msg"]}</li>`);
  })
  //With date below:
  
  //$("#chatHist").append(`<li><span class=header> ${chatObj[chatID]["user"]}</span>` + ": " + `${chatObj[chatID]["msg"]}` + '(' + `<i>${chatObj[chatID]["date"]}` + ')' + `</i></li>`);
  //alert("here");

}

function getDate(){
  let date = new Date();
  let month = date.getMonth();
  let day = date.getDate();
  let year = date.getFullYear();
  let res = month + '/' + day + '/' + year;
  return res;
  
}

//if user authenticates, then block discord display none, hide user auth
