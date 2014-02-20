$(function(){

  var Person = Backbone.Model.extend({
    id: '@id',

    initialize: function(){
      _.bindAll(this, 'setAvatar');
      this.on('change:description', this.save);
      this.on('change:email', this.setAvatar);
      if(this.get('email')){
        this.setAvatar();
      }
    },

    setAvatar: function(){
      this.set('image', 'http://gravatar.com/avatar/' + md5(this.get('email')));
    },

    //FIXME override Backbone.sync
    save: function(){
      superagent.put('http://localhost:9000' + this.attributes.path)
      .withCredentials()
      .send(this.toJSON())
      .end(function(response){ console.log('UPDATE: ', response); });
    }

  });

  // FIXME !!!DRY!!!
  var Crew = Backbone.Collection.extend({
    model: Person
  });

  var crew = new Crew(data.people);

  var Project = Backbone.Model.extend({
  });

  var Projects = Backbone.Collection.extend({
    model: Project
  });

  var projects = new Projects(data.projects);

  var Router = Backbone.Router.extend({
    routes: {
      '': 'root',
      'people': 'people',
      'people/:part': 'person',
      'projects': 'projects',
      'projects/:part': 'project'
    },

    people: function(){
      var sideNav = new SideNav({ collection: crew });
    },

    person: function(part){
      var profile = new Profile({
        model: crew.findWhere({path: '/people/' + part})
      });
    },

    projects: function(){
      var sideNav = new SideNav({ collection: projects });
    },

    project: function(part){
      var profile = new Profile({ model: projects.findWhere({path: '/projects/' + part}) });
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
        var data = resource.toJSON();
        this.$el.append(JST.nameLink(data));
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
      if(this.model.attributes.email === agent.attributes.email){
        var description = this.$el.find('[property=description]').hallo();
        description.hallo();
        description.bind('hallodeactivated', function(event, data){
          this.model.set('description', event.target.innerHTML);
        }.bind(this));
      }
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
