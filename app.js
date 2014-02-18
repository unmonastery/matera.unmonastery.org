$(function(){

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

  // FIXME !!!DRY!!!
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

  var partials = new Array('#profile','#sideNav');

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
      var index = new Index({ collection: crew });
      this.stretchIndex();
      // this.clearPartials(); **not working yet**
    },

    person: function(part){
      var profile = new Profile({ model: crew.findWhere({path: '/people/' + part}) });
      var sideNav = new SideNav({ collection: crew });
      this.removeIndex();
    },

    challenges: function(){
      var index = new Index({ collection: challenges });
      this.stretchIndex();
    },

    challenge: function(part){
      var profile = new Profile({ model: challenges.findWhere({path: '/challenges/' + part}) });
      var sideNav = new SideNav({ collection: challenges });
      this.removeIndex();
    },

    projects: function(){
      var index = new Index({ collection: projects });
      this.stretchIndex();
    },

    project: function(part){
      var profile = new Profile({ model: projects.findWhere({path: '/projects/' + part}) });
      var sideNav = new SideNav({ collection: projects });
      this.removeIndex();
    },

    peers: function(){
      var index = new Index({ collection: peers });
      this.stretchIndex();
    },

    peer: function(part){
      var profile = new Profile({ model: peers.findWhere({path: '/peers/' + part}) });
      var sideNav = new SideNav({ collection: peers });
      this.removeIndex();
    },
    removeIndex: function(){
      $('.main-column').removeClass('col-sm-12').addClass('col-xs-12 col-sm-9');
      $('#index').empty();
    },
    stretchIndex: function(){
      $('.main-column').removeClass('col-xs-12 col-sm-9').addClass('col-sm-12');
      this.clearPartials();
    },
    clearPartials: function(){
      $('#profile').empty();
      $('#sideNav').empty();
      /* for (var i=0;i<partials.length;i++)
            $([i]).empty(); *** Not working yet BUT not necessary if we only have one profile template for people, peers, etc. *** */
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
        router.navigate('', { trigger: true });
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

  var Index = Backbone.View.extend({
    el: '#index',

    events: {
      'click a': 'showProfile'
    },

    initialize: function(){
      _.bindAll(this, 'render');
      this.render();
    },

    render: function(){
      this.$el.html('');
      var row;
      this.collection.each(function(resource, index){
        if(index % 3 == 0){
          row = $('<div class="row"></div>');
          this.$el.append(row);
          window.foo = row;
        }
        row.append(JST.indexLink(resource.toJSON()));
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
