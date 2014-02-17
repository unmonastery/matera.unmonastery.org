$(function(){

  var data = {
    people: [
      {
        "name": "Kei Kreutler",
        "path": "/people/kei-kreutler",
        "email": "kei@ourmachine.net",
        "md5email": "d87e3342938497fd997c8fdc00dfe891"
      },
      {
        "name": "Ben Vickers",
        "path": "/people/ben-vickers",
        "email": "ben@vickers.tv",
        "md5email": "6fd3f132175cea545d2bb8eb9e05518a"
      },
      {
        "name": "Cristiano Siri",
        "path": "/people/cristiano-siri",
        "email": "cristiano.siri@gmail.com",
        "md5email": "c6dc44fe9be0fb0556fdfb6abf6b4fe8"
      },
      {
        "name": "Bembo Davies",
        "path": "/people/bembo-davies",
        "email": "bem.davies@gmail.com",
        "md5email": "e71846d61c43b5b9a1469b9632e6870"
      },
      {
        "name": "elf Pavlik",
        "path": "/people/elf-pavlik",
        "email": "perpetual-tripper@wwelves.org",
        "md5email": "f8a7b786c9f7b74164c6503173e92495"
      },
      {
        "name": "Katalin Hausner",
        "path": "/people/katalin-hausner",
        "email": "katalinhausel@gmail.com",
        "md5email": "b945907a201cea91efece7213e3e27b4"
      },
      {
        "name": "Marc Schneider",
        "path": "/people/marc-schneider",
        "email": "marc@mirelsol.org",
        "md5email": "7a3fd0312c38ae89119e9ae311740021"
      }
    ],
    challenges: [
      {
        "name": "Cross-generation spaces",
        "path": "/challenges/cross-generation-spaces"
      }
    ],
    projects: [
      {
        "name": "Ninux Matera",
        "path": "/projects/ninux-matera"
      },
      {
        "name": "Solar Tracker",
        "path": "/projects/solar-tracker"
      },
      {
        "name": "Community Interface",
        "path": "/projects/community-interface"
      },
      {
        "name": "Social Dramaturgy",
        "path": "/projects/social-dramaturgy"
      },
    ],
    peers: [
      {
        "name": "Casa Netural",
        "path": "/peers/casa-netural"
      }
    ]
  };

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

  var crew = new Crew(data.people);

  var Challenge = Backbone.Model.extend({
  });

  var Challenges = Backbone.Collection.extend({
    model: Challenge
  });

  var challenges = new Challenges(data.challenges);

  var Project = Backbone.Model.extend({
  });

  var Projects = Backbone.Collection.extend({
    model: Project
  });

  var projects = new Projects(data.projects);

  var Peer = Backbone.Model.extend({
  });

  var Peers = Backbone.Collection.extend({
    model: Peer
  });

  var peers = new Peers(data.peers);

  var Router = Backbone.Router.extend({
    routes: {
      '': 'root',
      'people': 'people',
      'people/:part': 'person',
      'challenges': 'challenges',
      'challenges/:part': 'challenge',
      'projects': 'projects',
      'projects/:part': 'project',
      'peers': 'peers',
      'peers/:part': 'peer'
    },

    people: function(){
      var sideNav = new SideNav({ collection: crew });
    },

    person: function(part){
      var profile = new Profile({ model: crew.findWhere({path: '/people/' + part}) });
    },

    challenges: function(){
      var sideNav = new SideNav({ collection: challenges });
    },

    challenge: function(part){
      var profile = new Profile({ model: challenges.findWhere({path: '/challenges/' + part}) });
    },

    projects: function(){
      var sideNav = new SideNav({ collection: projects });
    },

    project: function(part){
      var profile = new Profile({ model: projects.findWhere({path: '/projects/' + part}) });
    },

    peers: function(){
      var sideNav = new SideNav({ collection: peers });
    },

    peer: function(part){
      var profile = new Profile({ model: peers.findWhere({path: '/peers/' + part}) });
    }
  });

  Backbone.history.start({ pushState: true });

  var router = new Router();

  var Nav = Backbone.View.extend({
    el: '.nav',

    events: {
      'click': 'navigate'
    },

    navigate: function(event){
      event.preventDefault();
      if(event.target.attributes.href){
        router.navigate(event.target.attributes.href.value, { trigger: true });
      } else {
        rotuer.navigate('', { trigger: true });
      }
    }
  });

  var nav = new Nav();

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

  var SideNav = Backbone.View.extend({
    el: '#sideNav',

    events: {
      'click a': 'showProfile'
    },

    initialize: function(){
      _.bindAll(this, 'render');
      this.render();
    },

    render: function(){
      this.$el.html('');
      this.collection.each(function(resource){
        this.$el.append(JST.nameLink(resource.toJSON()));
      }.bind(this));
    },

    showProfile: function(event){
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
