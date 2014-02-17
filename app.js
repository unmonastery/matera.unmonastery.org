$(function(){

  var unMons = [
    {
      "name": "Kei Kreutler",
      "slug": "kei-kreutler",
      "email": "kei@ourmachine.net",
      "md5email": "d87e3342938497fd997c8fdc00dfe891"
    },
    {
      "name": "Ben Vickers",
      "slug": "ben-vickers",
      "email": "ben@vickers.tv",
      "md5email": "6fd3f132175cea545d2bb8eb9e05518a"
    },
    {
      "name": "Cristiano Siri",
      "slug": "cristiano-siri",
      "email": "cristiano.siri@gmail.com",
      "md5email": "c6dc44fe9be0fb0556fdfb6abf6b4fe8"
    },
    {
      "name": "Bembo Davies",
      "slug": "bembo-davies",
      "email": "bem.davies@gmail.com",
      "md5email": "e71846d61c43b5b9a1469b9632e6870"
    },
    {
      "name": "elf Pavlik",
      "slug": "elf-pavlik",
      "email": "perpetual-tripper@wwelves.org",
      "md5email": "f8a7b786c9f7b74164c6503173e92495"
    },
    {
      "name": "Katalin Hausner",
      "slug": "katalin-hausner",
      "email": "katalinhausel@gmail.com",
      "md5email": "b945907a201cea91efece7213e3e27b4"
    },
    {
      "name": "Marc Schneider",
      "slug": "marc-schneider",
      "email": "marc@mirelsol.org",
      "md5email": "7a3fd0312c38ae89119e9ae311740021"
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

  var crew = new Crew(unMons);


  var Router = Backbone.Router.extend({
    routes: {
      '': 'root',
      'people': 'people',
      'people/:slug': 'person',
      'projects': 'projects',
      'projects/:slug': 'project'
    },

    person: function(name){
      var profile = new Profile({ model: crew.findWhere({slug: name}) });
    }
  });

  Backbone.history.start({ pushState: true });

  var router = new Router();

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

    events: {
      'click a': 'showProfile'
    },

    initialize: function(){
      _.bindAll(this, 'render');
      this.render();
    },

    render: function(){
      this.collection.each(function(person){
        this.$el.append(JST.nameLink(person.toJSON()));
      }.bind(this));
    },

    showProfile: function(event){
      window.dbg = event;
      event.preventDefault();
      router.navigate(event.target.attributes.href.value, { trigger: true });
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
  var agentMenu = new AgentMenu({ model: agent });
  var crewVeiw = new CrewView({ collection: crew });

  // debug
  window.un = {
    agent: agent,
    crew: crew,
    router: router
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
