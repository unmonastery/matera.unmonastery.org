$(function(){

  var Person = Backbone.Model.extend({
    initialize: function(){
      _.bindAll(this, 'setAvatar');
      this.on('change:md5email', this.setAvatar);
    },

    setAvatar: function(){
      this.set('avatar', 'http://gravatar.com/avatar/' + this.get('md5email'));
    }
  });

  var AgentMenu = Backbone.View.extend({
    el: '#agentMenu',

    initialize: function(){
      _.bindAll(this, 'render');
      this.model.on('change:avatar', this.render);
    },

    render: function(){
      var partial = JST.agentMenu(this.model.toJSON());
      this.$el.html(partial);
    }
  });

  var agent = new Person();
  var agentMenu = new AgentMenu({ model: agent });

  $('.sign-in').on('click', function(){ navigator.id.request(); });

  var login = function(assertion){
    agent.assertion = assertion;
    $.post('http://localhost:9000/auth/login', { assertion: assertion }, function(response){
      console.log('Persona.onlogin()', response);
      agent.set(response);
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

  // debug
  window.agent = agent;
});
