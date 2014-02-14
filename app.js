$(function(){

  window.agent = {};

  $('.sign-in').on('click', function(){ navigator.id.request(); });

  var login = function(assertion){
    agent.assertion = assertion;
    $.post('http://localhost:9000/auth/login', { assertion: assertion }, function(response){
      console.log('Persona.onlogin()', response);
      agent = response;
      agent.authenticated = true;

    });
  };

  var logout =  function(){
    $.post('http://localhost:9000/auth/logout', { assertion: agent.assertion }, function(response){
      console.log('Persona.onlogout()', response);
      agent.authenticated = false;
    });
  };

  // mozilla persona
  navigator.id.watch({
    loggedInagent: null,
    onlogin: login,
    onlogout: logout
  });
});
