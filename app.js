$(function(){

  API_URL = 'http://localhost:9000';

  Handlebars.registerHelper('tmd', function(content){
    if(content[window.lang]) {
      return markdown.toHTML(content[window.lang]);
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
      this.on('change:image', this.save);
      this.on('change:video', this.save);
      this.on('change:video', this.setOembed);
      this.on('change:email', this.setAvatar);
      if(!this.get('image') && this.get('email')){
        this.setAvatar();
      }
      if(this.get('video')){
        this.setOembed();
      }
    },

    setAvatar: function(){
      this.set('image', 'http://gravatar.com/avatar/' + md5(this.get('email')), { silent: true });
    },

    setOembed: function(){
      if(this.get('video')){
        superagent.post(API_URL + '/oembed')
        .send({ url: this.get('video') })
        .end(function(response){
          var scaled = response.text.replace('width="1280"', 'width="640"').replace('height="720"', 'height="360"');
          //FIXME
          scaled = response.text.replace('width="960"', 'width="640"').replace('height="540"', 'height="360"');
          this.set('oembed', scaled);
        }.bind(this));
      } else {
        this.unset('oembed');
      }
    },

    //FIXME override Backbone.sync
    save: function(){
      superagent.put(API_URL + '/' + this.id)
      .withCredentials()
      .send(this.toJSON())
      .end(function(response){ console.log('UPDATE: ', response); });
    }
  });

  var router;

  // FIXME !!!DRY!!!
  var Crew = Backbone.Collection.extend({
    model: Person,
    url: API_URL + '/people',

    initialize: function(){
      this.on('reset', function(){
        console.log('People loaded!');
        router.refresh(); // FIXME
      });
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
      this.on('change:image', this.save);
      this.on('change:video', this.save);
      this.on('change:video', this.setOembed);
      if(this.get('video')){
        this.setOembed();
      }
    },

    setAvatar: function(){
      //FIXME
    },

    setOembed: function(){
      if(this.get('video')){
        superagent.post(API_URL + '/oembed')
        .send({ url: this.get('video') })
        .end(function(response){
          var scaled = response.text.replace('width="1280"', 'width="640"').replace('height="720"', 'height="360"');
          //FIXME
          scaled = response.text.replace('width="960"', 'width="640"').replace('height="540"', 'height="360"');
          this.set('oembed', scaled);
        }.bind(this));
      } else {
        this.unset('oembed');
      }
    },

    //FIXME override Backbone.sync
    save: function(){
      superagent.put(API_URL + '/' + this.id)
      .withCredentials()
      .send(this.toJSON())
      .end(function(response){ console.log('UPDATE: ', response); });
    }
  });

  var Projects = Backbone.Collection.extend({
    model: Project,

    url: API_URL + '/projects',

    initialize: function(){
      this.on('reset', function(){
        console.log('People loaded!');
        router.refresh(); // FIXME
      });
      this.fetch({ reset: true });
    }
  });

  var projects = new Projects();

  var Page = Backbone.Model.extend({
    idAttribute: '@id',

    defaults: {
      description: {}
    },

    initialize: function(){
      this.on('change:description', this.save);
    },

    save: function(){
      console.log('Page.save');
      superagent.put(API_URL + '/' + this.id)
      .withCredentials()
      .send(this.toJSON())
      .end(function(response){ console.log('UPDATE: ', response); });
    }
  });

  var Pages = Backbone.Collection.extend({
    model: Page,

    url: API_URL + '/pages',

    initialize: function(){
      this.on('reset', function(){
        console.log('Pages loaded!');
        router.refresh(); // FIXME
      });
      this.fetch({ reset: true });
    }
  });

  var pages = new Pages();

  var Router = Backbone.Router.extend({
    routes: {
      ':lang': 'root',
      ':lang/people': 'people',
      ':lang/people/:part': 'person',
      ':lang/projects': 'projects',
      ':lang/projects/:part': 'project',
      ':lang/pages': 'pages',
      ':lang/pages/:part': 'page',
      ':lang/news': 'blog',
      ':lang/news/:part': 'article',
      ':lang/:part': 'page'
    },

    root: function(lang){
      this.clearPage();
    },

    people: function(){
      var index = new Index({ collection: crew });
      this.stretchIndex();
      this.clearPage();
    },

    person: function(lang, part){
      var profile = new Profile({ model: crew.findWhere({'@id': 'people/' + part}) });
      var sideNav = new SideNav({ collection: crew });
      this.removeIndex();
      this.clearPage();
    },

    projects: function(){
      var index = new Index({ collection: projects });
      this.stretchIndex();
      this.clearPage();
    },

    project: function(lang, part){
      var profile = new Profile({ model: projects.findWhere({'@id': 'projects/' + part}) });
      var sideNav = new SideNav({ collection: projects });
      this.removeIndex();
      this.clearPage();
    },

    pages: function(){
      // FIXME
      console.log('Router.pages');
    },

    page: function(lang, part){
      var pageView = new PageView({ model: pages.findWhere({'@id': 'pages/' + part}) });
      $('#sidebar').hide(); // FIXME
      if(part !== 'events') {
        $('#calendar').remove(); //FIXME clears hardcoded calendar frame
      }
      this.removeIndex();
      this.clearPartials();
    },

    blog: function(){
      // FIXME
      console.log('Router.blog');
    },

    article: function(lang, part){
      var pageView = new PageView({ model: pages.findWhere({'@id': 'news/' + part}) });
      $('#sidebar').hide(); // FIXME
      this.removeIndex();
      this.clearPartials();
    },

    clearPage: function(){
      $('#page').find('[property="description"]').empty();
      $('#calendar').remove(); //FIXME clears hardcoded calendar frame
      $('#sidebar').show(); // FIXME
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
    },

    refresh: function() {
      var _tmp = Backbone.history.fragment;
      this.navigate( _tmp + (new Date()).getTime() );
      this.navigate( _tmp, { trigger:true } );
    }

  });

  Backbone.history.start({ pushState: true });

  router = new Router();

  var Nav = Backbone.View.extend({
    el: '.nav',

    structure: {
      en: {
        root: { url: '/en', label: 'unMonastery:Matera' },
        news: { url: 'http://en-news.unmonastery.org', label: 'News'},
        overview: { url: '/en/sitemap', label: 'Overview'},
          about: { url: '/en/pages/about', label: 'About'},
          challenges: { url: '/en/challenges', label: 'Challenges'},
          wishlist: { url: '/en/pages/wishlist', label: 'Wishlist'},
          faq: { url: '/en/pages/faq', label: 'FAQ'},
        community: { url: '/en/sitemap', label: 'Community'},
          peers: { url: '/en/peers', label: 'Peers'},
          people: { url: '/en/people', label: 'People'},
          events: { url: '/en/events', label: 'Events'},
        projects: { url: '/en/projects', label: 'Projects'},
        visiting: { url: '/en/pages/visiting', label: 'Visiting'},
      },
      it: {
        root: { url: '/it', label: 'unMonastery:Matera' },
        news: { url: 'http://it-news.unmonastery.org', label: 'News'},
        overview: { url: '/it/sitemap', label: 'Su di noi'},
          about: { url: '/it/pages/about', label: 'Informazioni generali'},
          challenges: { url: '/it/challenges', label: 'Sfide'},
          wishlist: { url: '/it/pages/wishlist', label: 'Lista dei desideri'},
          faq: { url: '/it/pages/faq', label: 'Domande frequenti'},
        community: { url: '/it/sitemap', label: 'Comunità'},
          peers: { url: '/it/peers', label: 'Amici'},
          people: { url: '/it/people', label: 'Persone'},
          events: { url: '/it/events', label: 'Eventi'},
        projects: { url: '/it/projects', label: 'Progetti'},
        visiting: { url: '/it/pages/visiting', label: 'Visitarci'},
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
      var href = event.target.attributes.href.value;
      if(!href.match('http://')){
        event.preventDefault();
        if(href.split('/')[2] !== 'sitemap'){
          router.navigate(href, { trigger: true });
        }
      }
    }
  });

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
      this.collection.on('reset', this.render);
      this.render();
    },

    render: function(){
      this.$el.html('');
      var row;
      this.collection.each(function(resource, index){
        if(index % 3 === 0){
          row = $('<div class="row"></div>');
          this.$el.append(row);
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
      if(this.model){ // FIXME sometimes called before loading data
        this.model.on('change:oembed remove:oembed', this.render);
        this.render();
      }
    },

    render: function(){
      var partial = JST.profile(this.model.toJSON());
      this.$el.html(partial);
      var editable = false;
      if(agent.get('email')){
        if(this.model.get('email') === agent.get('email') ||
           this.model.get('founder') === agent.get('@id')) { //FIXME support for multiple founders
          editable = true;
        }
      }
      if(editable){
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
          var rendered = markdown.toHTML(marked);
          $(description).html(rendered);
          if (rendered.replace(/^\s+|\s+$/g, '') === '') this.render();
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
              this.render();
            }
          }
        }.bind(this));

        // edit image
        var image = this.$el.find('[property=image]');
        var input = $('<input value="' + image.attr('src')  + '" style="width: 100%" />');
        image.bind('click', function(event){
          input.insertAfter(image);
          input.focus();
        }.bind(this));
        input.bind('blur', function(){
          this.model.set('image', input.val());
          input.detach();
          image.attr('src', input.val());
        }.bind(this));
      }
    }
  });

  var PageView = Backbone.View.extend({
    el: '#page',

    initialize: function(){
      _.bindAll(this, 'render');
      if(this.model){ // FIXME sometimes called before loading data
        this.render();
      }
    },

    render: function(){
      var description = this.$el.find('[property=description]');
      var content = this.model.get('description');
      if(content){
        if(content[window.lang]){
          $(description).html(markdown.toHTML(this.model.get('description')[window.lang]));
        } else {
          $(description).html('no content yet :(');
        }
      }
      if(this.model.id === 'pages/events'){
        // FIXME temporalry event calendar
        this.$el.append('<iframe id=calendar src="https://www.google.com/calendar/embed?src=74ul0d0i6oc3mp8g2e0o0h28sc%40group.calendar.google.com&ctz=Europe/Rome" style="border: 0" width="800" height="600" frameborder="0" scrolling="no"></iframe>');
      }
      // FIXME move to graph data!
      var editors = [
        'perpetual-tripper@wwelves.org',
        'kei@ourmachine.net',
        'ben@vickers.tv',
        'cristiano.siri@gmail.com'
      ];
      // FIXME make sure only one editor at a time ;)
      if(_.contains(editors, agent.get('email'))){
        var editor = $('<textarea style="width: 100%; height: 12em;"></textarea>');
        description.bind('click', function(event){
          if($(event.target)[0] === editor[0]){
            return event.stopPropagation();
          }
          $(description).empty();
          $(description).append(editor);
          $(editor).val(this.model.get('description')[lang]);
          $(editor).focus();
        }.bind(this));
        editor.bind('blur', function(){
          //debugger;
          var marked = editor.val();
          var desc = _.clone(this.model.get('description'));
          desc[lang] = marked;
          this.model.set('description', desc);
          $(editor).detach();
          var rendered = markdown.toHTML(marked);
          $(description).html(rendered);
          if (rendered.replace(/^\s+|\s+$/g, '') === '') this.render();
        }.bind(this));
      }
    }
  });

  var agent = new Person();
  var agentMenu = new AgentMenu({ model: agent });

  // route on initial load
  window.lang = 'it';
  if(window.location.pathname === '/'){
    router.navigate(window.lang, { trigger: true });
  } else {
    window.lang = window.location.pathname.split('/')[1];
    router.refresh();
  }
  var nav = new Nav();

  // debug
  window.un = {
    agent: agent,
    crew: crew,
    projects: projects,
    pages: pages,
    router: router
  };

  var login = function(assertion){
    superagent.post(API_URL + '/auth/login')
    .withCredentials()
    .send({ assertion: assertion })
    .end(function(response){
      if(response.status === 200){
        var data = JSON.parse(response.text);
        console.log('Persona.onlogin()', data);
        agent.set(data);
        agent.set('authenticated', true);
        var crewMember = crew.findWhere({ email: agent.get('email') });
        if(crewMember){
          agent.set('@id', crewMember.get('@id'));
        }
      } else {
        // FIXME handle case of 403 etc.
      }
    });
  };

  var logout =  function(){
    // FIXME decide if needs to sent assertion!
    superagent.post(API_URL + '/auth/logout')
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
