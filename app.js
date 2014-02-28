$(function(){

  window.lang = 'en';

  Handlebars.registerHelper('tmd', function(content){
    if(content[lang]) {
      return markdown.toHTML(content[lang]);
    } else {
      return 'no content yet :(';
    }
  });

  Handlebars.registerHelper('l', function(path){
    return '/' + window.lang + '/' + path;
  });

  var Person = Backbone.Model.extend({
    idAttribute: '@id',

    defaults: {
      description: {}
    },

    initialize: function(){
      _.bindAll(this, 'setAvatar', 'setOembed');
      this.on('change:description', this.save);
      this.on('change:video', this.save);
      this.on('change:video', this.setOembed);
      this.on('change:email', this.setAvatar);
      if(this.get('email')){
        this.setAvatar();
      }
      if(this.get('video')){
        this.setOembed();
      }
    },

    setAvatar: function(){
      this.set('image', 'http://gravatar.com/avatar/' + md5(this.get('email')));
    },

    setOembed: function(){
      if(this.get('video')){
        superagent.post('http://localhost:9000/oembed')
        .send({ url: this.get('video') })
        .end(function(response){
          var scaled = response.text.replace('width="1280"', 'width="640"').replace('height="720"', 'height="360"');
          this.set('oembed', scaled);
        }.bind(this));
      } else {
        this.unset('oembed');
      }
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

    defaults: {
      description: {}
    },

    initialize: function(){
      _.bindAll(this, 'setAvatar', 'setOembed');
      this.on('change:description', this.save);
      this.on('change:email', this.setAvatar);
      this.on('change:video', this.save);
      this.on('change:video', this.setOembed);
      if(this.get('email')){
        this.setAvatar();
      }
      if(this.get('video')){
        this.setOembed();
      }
    },

    setAvatar: function(){
      this.set('image', 'http://gravatar.com/avatar/' + md5(this.get('email')));
    },

    setOembed: function(){
      if(this.get('video')){
        superagent.post('http://localhost:9000/oembed')
        .send({ url: this.get('video') })
        .end(function(response){
          var scaled = response.text.replace('width="1280"', 'width="640"').replace('height="720"', 'height="360"');
          this.set('oembed', scaled);
        }.bind(this));
      } else {
        this.unset('oembed');
      }
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
      ':lang': 'root',
      ':lang/people': 'people',
      ':lang/people/:part': 'person',
      ':lang/projects': 'projects',
      ':lang/projects/:part': 'project',
    },

    root: function(lang){
    },

    people: function(){
      var index = new Index({ collection: crew });
      this.stretchIndex();
    },

    person: function(lang, part){
      var profile = new Profile({ model: crew.findWhere({'@id': 'people/' + part}) });
      var sideNav = new SideNav({ collection: crew });
      this.removeIndex();
    },

    projects: function(){
      var index = new Index({ collection: projects });
      this.stretchIndex();
    },

    project: function(lang, part){
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
  router.navigate(window.lang, { trigger: true });

  var Nav = Backbone.View.extend({
    el: '.nav',

    structure: {
      en: {
        root: { url: '/en' },
        people: { url: '/en/people', label: 'People'},
        projects: { url: '/en/projects', label: 'Projects'}
      },
      it: {
        root: { url: '/it' },
        people: { url: '/it/people', label: 'Persone'},
        projects: { url: '/it/projects', label: 'Progetti'}
      }
    },

    events: {
      'click': 'navigate'
    },

    initialize: function(){
      this.render();
    },

    render: function(){
      this.$el.html(JST.nav(this.structure[window.lang]));
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

  function getLangPath(lang){
    var pathElements = Backbone.history.location.pathname.split('/');
    pathElements[1] = lang;
    return pathElements.join('/');
  }

  function getLang(href){
    return href.split('/')[1];
  }

  var LangSwitch = Backbone.View.extend({
    el: '.language',

    events: {
      'click': 'switch'
    },

    initialize: function(){
      _.bindAll(this, 'render');
      this.render();
      router.on('route', this.render);
    },

    render: function(){
      this.$el.html(JST.langSwitch({
        en: getLangPath('en'),
        it: getLangPath('it')
      }));
    },

    switch: function(event){
      event.preventDefault();
      var lang = getLang($(event.target).attr('href'));
      window.lang = lang;
      nav.render();
      router.navigate(getLangPath(lang).replace(/^\//, ''), { trigger: true });
    }
  });

  var langSwitch = new LangSwitch();

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
      this.model.on('change:oembed remove:oembed', this.render);
      this.render();
    },

    render: function(){
      var partial = JST.profile(this.model.toJSON());
      this.$el.html(partial);
      if(this.model.get('email') === agent.get('email') ||
         this.model.get('founder') === agent.get('@id')) { //FIXME support for multiple founders
        // edit description
        var description = this.$el.find('[property=description]');
        var editor = $('<textarea style="width: 100%; height: 12em;"></textarea>');
        description.bind('click', function(event){
          // ignore clicks on editor
          if($(event.target)[0] === editor[0]){
            return event.stopPropagation();
          }
          $(description).empty();
          $(description).append(editor);
          $(editor).val(this.model.get('description')[lang]);
          $(editor).focus();
        }.bind(this));
        editor.bind('blur', function(){
          var marked = editor.val();
          this.model.get('description')[lang] = marked;
          this.model.trigger('change:description');
          $(editor).detach();
          $(description).html(markdown.toHTML(marked));
        }.bind(this));

        // edit video
        var video = this.$el.find('.video');
        video.attr('contenteditable', true);
        video.bind('blur', function(){
          var url = video.find('a').attr('href');
          if(url){
            this.model.set('video', url);
          } else {
            url = video.html().replace(/^\s+|\s+$/g, '').replace(/^<.*>|<.*>$/g, '');
            if(url.match(/^http[s]*:\/\//)){
              this.model.set('video', url);
            } else {
              this.model.unset('video');
            }
          }
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
    projects: projects,
    router: router
  };

  var login = function(assertion){
    superagent.post('http://localhost:9000/auth/login')
    .withCredentials()
    .send({ assertion: assertion })
    .end(function(response){
      var data = JSON.parse(response.text);
      console.log('Persona.onlogin()', data);
      agent.set(data);
      agent.set('authenticated', true);
      var crewMember = crew.findWhere({ email: agent.get('email') });
      if(crewMember){
        agent.set('@id', crewMember.get('@id'));
      }
    });
  };

  var logout =  function(){
    // FIXME decide if needs to sent assertion!
    superagent.post('http://localhost:9000/auth/logout')
    .withCredentials()
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
