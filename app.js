$(function(){

  var unMons = [
    {
      "name": "Kei Kreutler",
      "email": "kei@ourmachine.net",
      "md5email": "d87e3342938497fd997c8fdc00dfe891"
    },
    {
      "name": "Ben Vickers",
      "email": "ben@vickers.tv"
    },
    {
      "name": "Cristiano Siri",
      "email": "cristiano.siri@gmail.com"
    },
    {
      "name": "Bembo Davies",
      "email": "bem.davies@gmail.com"
    },
    {
      "name": "elf Pavlik",
      "email": "perpetual-tripper@wwelves.org"
    },
    {
      "name": "Katalin Hausner",
      "email": "katalinhausel@gmail.com"
    },
    {
      "name": "Marc Schneider",
      "email": "marc@mirelsol.org"
    }
  ];

  var Person = Backbone.Model.extend({
    initialize: function(){
      _.bindAll(this, 'setAvatar');
      this.on('change:md5email', this.setAvatar);
      if(this.get('md5email')){
        this.setAvatar();
      }
    },

    setAvatar: function(){
      this.set('avatar', 'http://gravatar.com/avatar/' + this.get('md5email'));
    }
  });

  var Crew = Backbone.Collection.extend({
    model: Person
  });

  var AgentMenu = Backbone.View.extend({
    el: '#agentMenu',

    events: {
      'click .sign-in': 'login'
    },

    initialize: function(){
      _.bindAll(this, 'render');
      this.model.on('change:authenticated', this.render);
      this.render();
    },

    render: function(){
      var partial = JST.agentMenu(this.model.toJSON());
      this.$el.html(partial);
    },

    login: function(){
      navigator.id.request();
    }
  });

  var CrewView = Backbone.View.extend({
    el: '#crew',

    initialize: function(){
      _.bindAll(this, 'render');
      this.render();
    },

    render: function(){
      this.collection.each(function(person){
        this.$el.append(JST.nameLink(person.toJSON()));
      }.bind(this));
    }
  });

  var Profile = Backbone.View.extend({
    el: '#profile',

    initialize: function(){
      _.bindAll(this, 'render');
      this.render();
    },

    render: function(){
      var partial = JST.profile(this.model.toJSON());
      this.$el.html(partial);
    }
  });

  var agent = new Person();
  var crew = new Crew(unMons);
  var agentMenu = new AgentMenu({ model: agent });
  var crewVeiw = new CrewView({ collection: crew });
  var profile = new Profile({ model: crew.at(0) });

  // debug
  window.un = {
    agent: agent,
    crew: crew
  };

  var login = function(assertion){
    agent.assertion = assertion;
    superagent.post('http://localhost:9000/auth/login')
    .withCredentials()
    .send({ assertion: assertion })
    .end(function(response){
      var data = JSON.parse(response.text);
      console.log('Persona.onlogin()', data);
      agent.set(data);
      agent.set('authenticated', true);
    });
  };

  var logout =  function(){
    // FIXME decide if needs to sent assertion!
    superagent.post('http://localhost:9000/auth/logout')
    .withCredentials()
    .send({ assertion: agent.assertion })
    .end(function(response){
      console.log('Persona.onlogout()', response);
      agent.set('authenticated', false);
    });
  };

  // mozilla persona
  navigator.id.watch({
    loggedInagent: null,
    onlogin: login,
    onlogout: logout
  });

});
