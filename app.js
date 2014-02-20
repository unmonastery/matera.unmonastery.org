$(function(){

  var Person = Backbone.Model.extend({
    idAttribute: '@id',

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
      superagent.put('http://localhost:9000/' + this.id)
      .withCredentials()
      .send(this.toJSON())
      .end(function(response){ console.log('UPDATE: ', response); });
    }
  });

  // FIXME !!!DRY!!!
  var Crew = Backbone.Collection.extend({
    model: Person,
    url: 'http://localhost:9000/people',

    initialize: function(){
      this.on('reset', function(){ console.log('People loaded!'); });
      this.fetch({ reset: true });
    }
  });

  var crew = new Crew();

  var Project = Backbone.Model.extend({
    idAttribute: '@id',

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
      superagent.put('http://localhost:9000/' + this.id)
      .withCredentials()
      .send(this.toJSON())
      .end(function(response){ console.log('UPDATE: ', response); });
    }
  });

  var Projects = Backbone.Collection.extend({
    model: Project,
    url: 'http://localhost:9000/projects',

    initialize: function(){
      this.on('reset', function(){ console.log('People loaded!'); });
      this.fetch({ reset: true });
    }
  });

  var projects = new Projects();

  var partials = new Array('#profile','#sideNav');

  var Router = Backbone.Router.extend({
    routes: {
      '': 'root',
      'people': 'people',
      'people/:part': 'person',
      'projects': 'projects',
      'projects/:part': 'project'
    },

    people: function(){
      var index = new Index({ collection: crew });
      this.stretchIndex();
    },

    person: function(part){
      var profile = new Profile({ model: crew.findWhere({'@id': 'people/' + part}) });
      var sideNav = new SideNav({ collection: crew });
      this.removeIndex();
    },

    projects: function(){
      var index = new Index({ collection: projects });
      this.stretchIndex();
    },

    project: function(part){
      var profile = new Profile({ model: projects.findWhere({'@id': 'projects/' + part}) });
      var sideNav = new SideNav({ collection: projects });
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
        var data = resource.toJSON();
        data.path = data["@id"]; //FIXME hbs seems not to handle @id / @type
        this.$el.append(JST.nameLink(data));
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
        if(index % 3 === 0){
          row = $('<div class="row"></div>');
          this.$el.append(row);
          window.foo = row;
        }
        var data = resource.toJSON();
        data.path = data["@id"]; //FIXME hbs seems not to handle @id / @type
        row.append(JST.indexLink(data));
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
