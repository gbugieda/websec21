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


//let userName = "";



// Initialize Firebase & Ref variables
const app = initializeApp(firebaseConfig);
let db = rtdb.getDatabase(app);

let auth = fbauth.getAuth(app);
let currentUser = null;
let currentUserName = "";


let titleRef = rtdb.ref(db, "/");

let userRef = rtdb.child(titleRef,"users")
let currentChannel = "general";
let channelRef = rtdb.child(titleRef,"channels");
let channelNavRef = rtdb.child(titleRef,"channel-nav");
let channelCreatedRef = rtdb.ref(db, `/channels/${currentChannel}`);
let chatRef = rtdb.ref(db, `/channels/${currentChannel}/chats`);





/********* END FIREBASE CONNECTION CODE *********/






/********* START USER AUTHENTICATION *********/


//Login to discord
$("#login").on("click",function(){
  $('.discord').hide();
  $('.user-auth-reg').hide();
  $('.user-auth-reset').hide();
  $('#logout').hide();
  $(".user-auth-login").show();
  let email = $("#userEmail").val();
  let password = $("#userPassword").val()
  email = inputSanitize(email);


  fbauth.signInWithEmailAndPassword(auth, email, password).then(currUser=>{
    }).catch(function(error){
    let errorCode = error.code;
    let errorMsg = error.message;
    console.log(errorCode);
    console.log(errorMsg);
  })
})

//logout of discord
$("#logout").on("click",function(){
  console.log(auth.currentUser);
  let activeUserRef = rtdb.ref(db,`/users/${auth.currentUser.uid}/active`);
  rtdb.set(activeUserRef,false);
  fbauth.signOut(auth).then(()=>{
    console.log("sign out success");
  })
})




fbauth.onAuthStateChanged(auth, user=> {
  if (!!user) { //user is signed in
   let usernameRef = rtdb.ref(db,`/users/${auth.currentUser.uid}/username`)
   let activeUserRef = rtdb.ref(db,`/users/${auth.currentUser.uid}/active`);
   
   rtdb.get(usernameRef).then(ss=>{
     currentUserName = ss.val();
   })
    currentUser = auth.currentUser.uid;
    if (currentUserName == ""){
      currentUserName = auth.currentUser.displayName;
    }
    
    rtdb.set(activeUserRef,true);
    renderDiscord(currentUserName);
    loadChats();
    loadChannels();
    loadUsers();
    
  }
  else{ //user is signed out
    currentUser = null;

    $('.user-auth').find('input:text').val('');
    $('.user-auth').find('input:password').val('');
    $('.discord').hide();
    $('.user-info').hide();
    $('#logout').hide();
    $(".user-auth").show();
  }
});


//register new account
$("#register").on("click",function(){
  $(".user-auth-login").hide();
  $(".user-auth-reset").hide();
  $(".user-auth-reg").show();
  let email = $("#regEmail").val();
  let password = $("#regPassword").val();
  let username = $("#regUsername").val();
  email = inputSanitize(email);
  username = inputSanitize(username);
  currentUserName = username;
  currentUser = auth.currentUser;

   fbauth.createUserWithEmailAndPassword(auth, email, password,{displayName:username}).then(newUser=>{
    currentUser = auth;
    let uid = newUser.user.uid;
    let userObj = {"uid":uid,"username":username,active:true,"roles":{"user":true}};
    let userRef = rtdb.ref(db, `/users/${uid}`);
    rtdb.update(userRef,userObj);

    fbauth.updateProfile(auth.currentUser,{
      displayName: username,
      photoURL: ""
    }).then(function() {
    }, function(error) {
    });
    
    }).catch(function(error){
    let errorCode = error.code;
    let errorMsg = error.message;
    if (errorCode == "auth/weak-password"){
      alert("Password needs to be at least 6 characters!");
    }
    console.log(errorCode);
    console.log(errorMsg);
})

})


//reset password
$("#resetPassword").on("click",function(){
  $(".user-auth-login").hide();
  $(".user-auth-reg").hide();
  $(".user-auth-reset").show();
  let email = $("#userEmailReset").val();

  fbauth.sendPasswordResetEmail(auth, email)
  .then(() => {
    alert("Password reset email sent!");
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });

})

//DISCORD SHOW
function renderDiscord(username){
  //console.log(username);
  $(".user-auth").hide();
  $("<div class=user-info></div>").insertAfter( ".user-auth" );
  $("#logout").show();
  $(".user-info").append($( "<h3 class=header  id=screenName>USER: " + username + "</h3>" ));
  $(".discord").show();
  
}



/********* END USER AUTHENTICATION *********/

function loadChats(){
  console.log(currentChannel);
  rtdb.onValue(chatRef, ss=>{
    console.log("on value");
  let message = ss.val();
  //if (!!message){
     displayChats(message);
 // }
  })
} 

function loadUsers(){
  rtdb.onValue(userRef, ss=>{
    let users = ss.val();
    if (!!users){
       displayActiveUsers(users);
    }
})
} 

rtdb.onChildRemoved(chatRef, ss=>{
  $("#chatHist").empty();
})


rtdb.onValue(channelNavRef, ss=>{
  let channel = ss.val();
  if (!!channel){
    console.log(channel);
    displayChannels(channel);
  }
})
/*
$("#clear").on("click",function(){
  rtdb.set(chatRef,{});
})
*/

/* Sends msg to db */
$("#send").on("click",function(){
    let msg = $("#msg").val();
    msg = inputSanitize(msg);
    let msgObj = {"msg":msg,"user":auth.currentUser.displayName,"uid":auth.currentUser.uid,"edited":false};
    //let channelChatRef = rtdb.ref(db, `/${currentChannel}/chats`);
    rtdb.push(chatRef,msgObj);
    $("#msg").val('');
    console.log("before load chats");
    loadChats();
})


function loadChannels(){
  rtdb.onValue(channelCreatedRef, ss=>{
    let message = ss.val();
    //if (!!message){
      displayChats(message);
    //}
  })
}


$("#addChannel").on("click",function(){
  let channelName = $("#addChannelBox").val();
  channelName = channelSanitize(channelName);
  let currChannel = channelName;
  //currentChannel = currChannel;
  channelCreatedRef = rtdb.ref(db, `/channels/${currChannel}`);
  chatRef = rtdb.ref(db, `/channels/${currentChannel}/chats`);
  let navRef = rtdb.ref(db,`/channel-nav/${currChannel}/`);
  //call load chat function, 
 // let channelInfoRef = rtdb.ref(db, `/channels/${currentChannel}/info`);
  rtdb.push(navRef,{"active":true});
  loadChannels();
  loadChats();

})






function editMessage(evt, msgId){

  if (evt.target === evt.currentTarget && $(`[data-id=${msgId}]`).children("#editMsg").length == 0){
   $(`[data-id=${msgId}]`).children(`#${msgId}text-user`).append(`<input type="text" id="editMsg" name="msg">`);
   $(`[data-id=${msgId}]`).children(`#${msgId}text-user`).append(`<button id=editChat>Make Edit</button>`);
   $(`[data-id=${msgId}]`).children(`#${msgId}text-user`).append(`<button id=cancelEditChat>Cancel</button>`);

  console.log(auth.currentUser);
  let userRoleRef = rtdb.ref(db, `/users/${auth.currentUser.uid}/roles`);
  rtdb.get(userRoleRef).then(ss=>{
    let userData = ss.val();
    if (userData.admin === true){
       $(`[data-id=${msgId}]`).children(`#${msgId}text-user`).append(`<button id=deleteChat>Delete</button>`);
       $("#deleteChat").on("click",function(){
        console.log("DEL");
        let editRef = rtdb.ref(db, `/channels/${currentChannel}/chats/${msgId}`);
        rtdb.set(editRef,{});
        loadChats();
      });
    }});
  
   
   $("#editChat").on("click",function(){
     //console.log("here edit click");
    let editedMsg = $("#editMsg").val();
    editedMsg = inputSanitize(editedMsg);
    //alert(editedMsg);
    let editRef = rtdb.ref(db, `/channels/${currentChannel}/chats/${msgId}`);
    rtdb.update(editRef,{"msg":editedMsg,"edited":true});
    //$(`[data-id=${msgId}]`).children("#").append(`<small>  (edited) </small>`);
    loadChats();
   });

   $("#cancelEditChat").on("click",function(){
    $(`[data-id=${msgId}]`).children(`#${msgId}text-user`).find("button").remove();
    $(`[data-id=${msgId}]`).children(`#${msgId}text-user`).find("input").remove();
  });

  }
}

function displayChannels(channelObj){
  $("#channelList").empty(); //empty list on page

  Object.keys(channelObj).map(channelID=>{
    console.log(channelID);
    let $li = $(`<button class="channelElem" id=${channelID}></button>`);
    $("#channelList").append($li);
    $(`#${channelID}`).text(`${channelID}`);
    $li.click((event)=>{
      
      //let clickedChat = $(event.currentTarget).attr("data-id");
      currentChannel = $(event.currentTarget).attr("id");
      alert(currentChannel);
      chatRef = rtdb.ref(db, `/channels/${currentChannel}/chats`);
      loadChats();
    })

  })


}
function displayChats(chatObj){
  $("#chatHist").empty(); //empty list on page
  let divide = ": "
  if(chatObj != null){
  Object.keys(chatObj).map(chatID=>{
    let $div = $(`<div class="chatElem"  data-id=${chatID}>
    <span class=header id="${chatID}chatUserName"></span>
    <text id="${chatID}text-user"> </text></div>`);

    $("#chatHist").append($div);
    console.log(chatID);
    $(`#${chatID}chatUserName`).text(`${chatObj[chatID]["user"]}${divide}`);
    $(`#${chatID}text-user`).text(`${chatObj[chatID]["msg"]}`);
    if ( chatObj[chatID]["edited"] === true){
      console.log("HERE");
      $(`[data-id=${chatID}]`).children(`#${chatID}text-user`).append(`<small>  (edited)</small>`);
    }
    $('#chatHist').scrollTop($('#chatHist').height());
    $div.click((event)=>{
      let clickedChat = $(event.currentTarget).attr("data-id");
      editMessage(event,clickedChat);

    })
  })
 
}

}


function displayActiveUsers(userObj){
  $("#activeUsersList").empty(); //empty list on page
  if(userObj != null){
    Object.keys(userObj).map(userID=>{
      let userIdRef = rtdb.ref(db, `/users/${userID}`);
      rtdb.get(userIdRef).then(ss=>{
        let userData = ss.val();
        if (userData.active == true){
          console.log(userData.username);
          console.log("time");
          let $div = $(`<div class="activeUserElem">${userData.username}</button>`);
          $("#activeUsersList").append($div);
        }
      })

    })
  }
}






/********* HELPER FUNCTIONS *********/
function channelSanitize(name){
  let sanitizedName = name.replace(/\s/g, '-').toLowerCase();
  console.log(sanitizedName);
  sanitizedName = inputSanitize(sanitizedName);

  console.log(sanitizedName);
  return sanitizedName;
}


function inputSanitize(str) {
  return str.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');
}

/********* HELPER FUNCTIONS *********/