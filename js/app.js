$(init);

function setPageState(page) {
  if(page === 'user-profile') getUserDetails();
  if(page === 'edit-user') populateInputs();
  if(page === 'home-edit') populateHomeInputs();

  document.title = $page.split('-').map(function(elem) {
    return elem[0].toUpperCase() + elem.substr(1);
  }).join(" ") + " | Pet Sitters";

  $('section').hide();
  $('section#' + page).show();
}

function init(){

	displayHomes();
	checkLoginState();

	$('section').hide();
	$('section#home-page').show();

	$('body').find('form').on('submit', submitForm);

	$('nav').find('#logout').on('click', function(){
		logout();
	});

  var from,to,subject,text;

  $("#send_email").click(function() {
    to=$("#to").val();
    subject=$("#subject").val();
    text=$("#content").val();
    $("#message").text("Sending E-mail...Please wait");
    $.get("https://project-3-api.herokuapp.com/send",{to:to,subject:subject,text:text},function(data){
      console.log(data);
      if(data=="sent")
      {
        return $("#message").empty().html("Email is been sent at "+to+" . Please check inbox !");
      }
      else return $("#message").empty().html("There was a problem sending the email.");
    });
  });

	var $navLinks = $('nav a');

	$navLinks.on('click', function(e){

    e.preventDefault();

    var page = $(this).data('name');
    var url = page === 'home-page' ? '/' : page;
    history.pushState(page, null, url);

    setPageState(page);
    e.stopPropagation();
  }, false);

	$(window).on('popstate', function(e){

    var page = e.state;
    setPageState(page);

  });

  // // INIT GOOGLEMAPS HERE
  // initMap();

}

// function initMap() {

//   // find user's post code
//   var postCode = $('section#show-home-profile div.meta').text().replace('Post code: ', '');
//   // get lat lng from post code
//   var geocoder = new google.maps.Geocoder();

//   geocoder.geocode({ address: postCode }, function(res, status) {
//     var location = res[0].geometry.location;
//       // init map
//     var mapElement = $('#map')[0];
//     var map = new google.maps.Map(mapElement, {
//       center: location,
//       zoom: 12
//     });

//     // place marker
//     var marker = new google.maps.Marker({
//       position: location,
//       map: map,
//       animation: google.maps.Animation.DROP
//     });
//   });
// }

function getUserEmail(){
  ajaxRequest("get", "https://project-3-api.herokuapp.com/users/info", false, function(data){
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
  ajaxRequest("get", "https://project-3-api.herokuapp.com/users/info", false, function(data){
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
	var url = "https://thawing-escarpment-4012.herokuapp.com" + $form.attr('action');
  if($form.find('[name=_id]').length > 0) { url += '/' + $form.find('[name=_id]').val(); }
	var isFileUpload = $form.attr("enctype") === 'multipart/form-data';
	var data = $form.serialize();

	if(isFileUpload) {
		data = new FormData($form[0]);
	};

	if(($form.attr('action') === '/signup') && authenticationSuccessful(data)) {
		$('section').hide();
		$('section#edit-user').show();
	}

	else if(($form.attr('action') === '/login') && authenticationSuccessful(data)) {
		$('section').hide();
		$('section#user-profile').show();
	}

  else if($form.attr('action') === '/api/homes') {
    $('section').hide();
    $('section#homes').show();
  }

  else if($form.attr('action') === '/users/:id') {
    $('section').hide();
    $('section#user-profile').show();
  }

  else if($form.attr('action') === '/api/homes/:id') {
    $('section').hide();
    $('section#homes').show();
  }

  $form.trigger("reset");
	return ajaxRequest(method, url, data, authenticationSuccessful, isFileUpload);
}

function getUserDetails(){
	ajaxRequest("get", "https://project-3-api.herokuapp.com/users/info", false, function(data){
    $("#profile-username").text(data.user.local.first_name + " " + data.user.local.last_name);
    // $("#show-user-pic").html('<img width="250px" src="' + data.user.local.image_url + '" />');
		$("#show-user-bio").html(data.user.local.bio);
    return data;
	});
}

function populateInputs(){
  ajaxRequest("get", "https://project-3-api.herokuapp.com/users/info", false, function(data){
    $("form.edit-user [name=_id]").val(data.user._id);
    $("#edit-user-first-name").val(data.user.local.first_name);
    $("#edit-user-last-name").val(data.user.local.last_name);
    return;
  });
}

function populateHomeInputs(){
  ajaxRequest("get", "https://project-3-api.herokuapp.com/users/info", false, function(data){
    $("form.edit-home [name=_id]").val(data.user.local.home[0]._id);
    $("#home-type").val(data.user.local.home[0].type);
    $("#home-description").val(data.user.local.home[0].description);
    $("#home-postcode").val(data.user.local.home[0].postcode);
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
	  ajaxRequest("get", "https://project-3-api.herokuapp.com/users", false, function(data){
	    var output = '<div class="ui link cards">';
	    $.each(data.users, function(i, user){
        if(user.local.home.length > 0 ) {
  	    	var image_url = "https://s3-eu-west-1.amazonaws.com/wdi16-project-3/" + user.local.home[0].home_image
  	      if((user.local.home[0].address.search(myExp) != -1) || (user.local.home[0].postcode.search(myExp) != -1)) {
  	        output +='<div class="card" id="' + user.local.home[0]._id + '">';
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

      $(document).on('click', '.card', function () {
        displayHome(this.id);
      });
	  });
	});
}


function displayHome(id){
  ajaxRequest("get", "https://project-3-api.herokuapp.com/users", false, function(data){
    $.each(data.users, function(i, user){
      if((user.local.home.length > 0) && id === user.local.home[0]._id){
        var image_url = "https://s3-eu-west-1.amazonaws.com/wdi16-project-3/" + user.local.home[0].home_image;
        $('section').hide();
        $('section#show-home-profile').show();
        $('.home-type').html(user.local.home[0].type);
        $('.home-image').html('<img width="250px" src="' + image_url + '" />');
        $('.description').html(user.local.home[0].description);
        $('.address').html(user.local.home[0].address);
        $('.postcode').html(user.local.home[0].postcode);
        $.each(user.local.home[0].pets, function(i, pet){
          $('.pets').append(pet)
        });
        $('.date_from').html(user.local.home[0].date_from);
        $('.date_to').html(user.local.home[0].date_to);
        $('#to').val(user.local.email);
      }
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
