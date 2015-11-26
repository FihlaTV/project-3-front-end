$(init);

function init(){

	displayHomes();
	checkLoginState();

	$('section').hide();
	$('section#home-page').show();

	$( "body" ).find('form').on('submit', submitForm);

  $( "body" ).find('a#forgot-password').on('click', function(){
    $('section').hide();
    $('section#forgot-password').show();
  });

	$( "nav" ).find('#logout').on('click', function(){
		logout();
	});

  var from,to,subject,text;
  
  $("#send_email").click(function() {      
    to=$("#to").val();
    subject=$("#subject").val();
    text=$("#content").val();
    $("#message").text("Sending E-mail...Please wait");
    $.get("http://localhost:3000/send",{to:to,subject:subject,text:text},function(data){
      console.log(data);
      if(data=="sent")
      {
        return $("#message").empty().html("Email is been sent at "+to+" . Please check inbox !");
      }
      else return $("#message").empty().html("There was a problem sending the email.");
    });
  });

	var nav = document.querySelector('nav')

	nav.addEventListener('click', function(e){
    if(e.target != e.currentTarget){
      e.preventDefault();
      if(e.target.getAttribute('data-name') === 'home-page'){
        var data = e.target.getAttribute('data-name'), url = '/';
      } else {
        var data = e.target.getAttribute('data-name'), url = data;
      } 
      history.pushState(data, null, url);

      var page = data;

      switch(page) {
      	case 'home-page':
      		document.title = "Home | Pet Sitters";
      		$('section').hide();
      		$('section#' + page).show();
      		break;
      	case 'homes':
      		document.title = "Find A House Sit | Pet Sitters";
      		$('section').hide();
      		$('section#' + page).show();
      		break;
      	case 'sign-up':
      		document.title = "Sign Up | Pet Sitters";
      		$('section').hide();
      		$('section#' + page).show();
      		break;
      	case 'login':
      		document.title = "Login | Pet Sitters";
      		$('section').hide();
      		$('section#' + page).show();
      		break;
        case 'user-profile':
          document.title = "Profile | Pet Sitters";
          $('section').hide();
          $('section#' + page).show();
          getUserDetails()
          break;
      	case 'show-user':
      		document.title = "User Profile | Pet Sitters";
      		$('section').hide();
      		$('section#' + page).show();
      		break;
      	case 'edit-user':
      		document.title = "Edit Profile | Pet Sitters";
      		$('section').hide();
      		$('section#' + page).show();
          populateInputs();
      		break;
      	case 'show-home-profile':
      		document.title = "Home Profile | Pet Sitters";
      		$('section').hide();
      		$('section#' + page).show();
      		break;
      	case 'home-signup':
      		document.title = "Add A Home | Pet Sitters";
      		$('section').hide();
      		$('section#' + page).show();
      		break;
      	case 'home-edit':
      		document.title = "Edit A Home | Pet Sitters";
      		$('section').hide();
      		$('section#' + page).show();
      		break;
      }
    }
    e.stopPropagation();
  }, false);

	window.addEventListener('popstate', function(e){

    var page = e.state;

    switch(page) {
    	case 'home-page':
    		document.title = "Home | Pet Sitters";
    		$('section').hide();
    		$('section#' + page).show();
    		break;
    	case 'homes':
    		document.title = "Find A House Sit | Pet Sitters";
    		$('section').hide();
    		$('section#' + page).show();
    		break;
    	case 'sign-up':
    		document.title = "Sign Up | Pet Sitters";
    		$('section').hide();
    		$('section#' + page).show();
    		break;
    	case 'login':
    		document.title = "Login | Pet Sitters";
    		$('section').hide();
    		$('section#' + page).show();
    		break;
      case 'user-profile':
        document.title = "Profile | Pet Sitters";
        $('section').hide();
        $('section#' + page).show();
        getUserDetails()
        break;
    	case 'show-user':
    		document.title = "User Profile | Pet Sitters";
    		$('section').hide();
    		$('section#' + page).show();
    		break;
    	case 'edit-user':
    		document.title = "Edit Profile | Pet Sitters";
    		$('section').hide();
    		$('section#' + page).show();
        populateInputs();
    		break;
    	case 'show-home-profile':
    		document.title = "Home Profile | Pet Sitters";
    		$('section').hide();
    		$('section#' + page).show();
    		break;
    	case 'home-signup':
    		document.title = "Add A Home | Pet Sitters";
    		$('section').hide();
    		$('section#' + page).show();
    		break;
    	case 'home-edit':
    		document.title = "Edit A Home | Pet Sitters";
    		$('section').hide();
    		$('section#' + page).show();
    		break;
    }
  });
}

function getUserEmail(){
  ajaxRequest("get", "http://localhost:3000/users/info", false, function(data){
    return populateEmail(data.user);
  });
}

function populateEmail(user){
  $("#to").val(user.local.email);
}

function checkLoginState(){
	if(getToken() !== null) loggedInState();
  else loggedOutState();
}

function loggedInState(){
  console.log("logged in");
  $('div#logged-out').hide();
  $('div#logged-in').show();
  ajaxRequest("get", "http://localhost:3000/users/info", false, function(data){
    console.log(data);
    if(data.user.local.home.length > 0) {
      $('a#edit-home').show();
      $('a#add-home').hide();
    } else {
      $('a#add-home').show();
      $('a#edit-home').hide();
    }
  });
}

function loggedOutState(){
  console.log("logged out");
  $('div#logged-out').show();
  $('div#logged-in').hide();
  displayIndex();
}

function submitForm(){
	event.preventDefault();
	var $form = $(this)
	var method = $form.attr('method');
	var url = "http://localhost:3000" + $form.attr('action');
	var isFileUpload = $form.attr("enctype") === 'multipart/form-data';
	var data = $form.serialize();

	if(isFileUpload) {
		data = new FormData($form[0]);
	};

	if($(this).attr('action') === '/signup') {
		$('section').hide();
		$('section#edit-user').show();
	}

	else if($(this).attr('action') === '/login') {
		$('section').hide();
		$('section#user-profile').show();
	}

  else if($(this).attr('action') === '/api/homes') {
    $('section').hide();
    $('section#homes').show();
  }

  $(this).trigger("reset");
	return ajaxRequest(method, url, data, authenticationSuccessful, isFileUpload);
}

function getUserDetails(){
	ajaxRequest("get", "http://localhost:3000/users/info", false, function(data){
    console.log(data);
    $("#profile-username").text(data.user.local.first_name + " " + data.user.local.last_name);
    $("#show-user-pic").html('<img width="250px" src="' + data.user.local.image_url + '" />');
		$("#show-user-bio").html(data.user.local.bio);
    return data;
	});
}

function populateInputs(){
  ajaxRequest("get", "http://localhost:3000/users/info", false, function(data){
    console.log(data);
    $("#edit-user-id").val(data.user._id);
    $("#edit-user-first-name").val(data.user.local.first_name);
    $("#edit-user-last-name").val(data.user.local.last_name);
    return;
  });
}

function users(){
	event.preventDefault();
	return getUsers();
}

function logout(){	
	removeToken();
	return loggedOutState();
}

function displayHomes() {
	$('#search').keyup(function(){
	  var searchField = $('#search').val();
	  var myExp = new RegExp(searchField, 'i');
	  ajaxRequest("get", "http://localhost:3000/users", false, function(data){
	    var output = '<div class="ui link cards">';
	    $.each(data.users, function(i, user){
        if(user.local.home.length > 0 ) {
  	    	var image_url = "https://s3-eu-west-1.amazonaws.com/wdi16-project-3/" + user.local.home[0].home_image
  	      if((user.local.home[0].address.search(myExp) != -1) || (user.local.home[0].postcode.search(myExp) != -1)) {
  	        output +='<div class="card">';
            output +='<div class="image">';
  	        output +='<img src="' + image_url + '" />';
            output +='</div>';
            output +='<div class="content">';
            output +='<div class="header">' + user.local.home[0].address + '</div>';
  	        output +='<div class="meta">' + user.local.home[0].postcode + '</div>';
  	        output +='<div class="description">' + user.local.home[0].description + '</div>';
            output +='</div>'
  	        output +='</div>';
          }
	      }
	    });
	    output += '</div>';
	    $('#update').html(output);
      if($('#search').val() === "") $('#update').empty();
	  });
	});
}

function displayIndex(){
	$('section').hide();
	$('section#home-page').show();
}

function authenticationSuccessful(data) {
	if(data.token){
		return setToken(data.token);
	}
}

function setToken(token) {
	localStorage.setItem("token", token);
  checkLoginState();
  populateInputs();
  return getUserDetails();
}

function getToken() {
	return localStorage.getItem("token");
}

function removeToken() {
	return localStorage.removeItem("token");
}

function setRequestHeader(xhr, settings) {
	var token = getToken();
	if(token) return xhr.setRequestHeader('Authorization', 'Bearer ' + token);
}

function ajaxRequest(method, url, data, callback, isFileUpload) {

	var options = {
		method: method,
		url: url,
		data: data,
		beforeSend: setRequestHeader
	};

	if(isFileUpload) {
		options.cache = false;
		options.enctype = 'multipart/form-data';
		options.processData = false;
		options.contentType = false;
	};

	return $.ajax(options)
	.done(function(data){
		callback(data);
	})
	.fail(function(data){
		console.log(data.responseJSON.message);
	});
}