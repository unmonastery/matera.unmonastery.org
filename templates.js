this["JST"] = this["JST"] || {};

this["JST"]["agentMenu"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n  <img src=\"";
  if (stack1 = helpers.avatar) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.avatar); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" />\n";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n  <button type=\"button\" class=\"btn btn-default navbar-btn navbar-right sign-in\">Sign in</button>\n";
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.authenticated), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n";
  return buffer;
  });

this["JST"]["indexLink"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"col-sm-4 index-grid\">\n	<a href=\"";
  if (stack1 = helpers.path) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.path); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"list-group-item\">\n		<img class=\"img-thumbnail\" src=\"";
  if (stack1 = helpers.avatar) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.avatar); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"\">";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>\n</div>";
  return buffer;
  });

this["JST"]["nameLink"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<!-- FIXME add class: active -->\n<a href=\"";
  if (stack1 = helpers.path) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.path); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"list-group-item\">";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>\n";
  return buffer;
  });

this["JST"]["navbar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div class=\"navbar navbar-fixed-top\" role=\"navigation\">\n\n  <div class=\"container\">\n    <div class=\"navbar-header\">\n      <button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".navbar-collapse\">\n        <span class=\"sr-only\">Toggle navigation</span>\n        <span class=\"icon-bar\"></span>\n        <span class=\"icon-bar\"></span>\n        <span class=\"icon-bar\"></span>\n      </button>\n    </div>\n\n    <div class=\"collapse navbar-collapse\">\n      <ul class=\"nav navbar-nav\">\n        <!--<li><img class=\"img-sm\" src=\"images/unMonastery.png\"></li>-->\n        <li>\n          <a class=\"navbar-brand\" href=\"#\">unMonastery<img class=\"logo\" src=\"assets/images/unMonastery.png\"></a>\n        </li>\n        <li><a href=\"#projects\">Projects</a></li>\n        <li><a href=\"#people\">People</a></li>\n        <li><a href=\"#peers\">Peers</a></li>\n        <li><a href=\"#blog\">Blog</a></li>\n      </ul>\n\n  	<!--<button type=\"button\" class=\"btn btn-default navbar-btn navbar-right sign-in\">Sign in</button>-->\n\n      <div id=\"agentMenu\">\n\n           <div class=\"dropdown\" role=\"menu\"> \n\n           <img class=\"navbar-right avatar\" src=\"http://www.gravatar.com/avatar\" data-toggle=\"dropdown\">               \n\n              <ul class=\"dropdown-menu dropdown-menu-right logout\" role=\"menu\">\n                <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\">Preferences</a></li>\n                <li role=\"presentation\" class=\"divider\"></li>\n                <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" href=\"#\">Log out</a></li>\n              </ul>\n\n          </div>\n      </div>\n\n    </div><!-- /.nav-collapse -->\n  </div><!-- /.container -->\n</div><!-- /.navbar -->";
  });

this["JST"]["profile"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "	<div class=\"jumbotron\">\n		<img class=\"img-thumbnail\" src=\"";
  if (stack1 = helpers.avatar) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.avatar); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n			<h1>";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</h1>\n			<p>A little bit about yourself.</p>\n	</div>\n\n    <div class=\"row\">\n        <div class=\"col-md-4\">\n          <h2>Challenges</h2>\n          <p>Fill this in with the <a href=\"http://unmonastery.eu/index.php/goals/challenges-matera/\" target=\"_blank\">challenges</a> you're addressing while in Matera.<p>\n          <p><a class=\"btn btn-default\" href=\"#\" role=\"button\">View details &raquo;</a></p>\n        </div><!--/span-->\n        <div class=\"col-md-4\">\n          <h2>Projects</h2>\n          <p>Links to the project(s) on which you're working.</p>\n          <p><a class=\"btn btn-default\" href=\"#\" role=\"button\">View details &raquo;</a></p>\n        </div><!--/span-->\n        <div class=\"col-md-4\">\n          <h2>Peers</h2>\n          <p>Because we can't do it alone. Links please.</p>\n        </div><!--/span-->\n    </div><!--/row-->";
  return buffer;
  });

this["JST"]["sidebar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "        <div class=\"col-xs-6 col-sm-3 sidebar-offcanvas\" id=\"sidebar\" role=\"navigation\">\n\n        <form role=\"search\">\n          <div class=\"form-group\">\n            <input type=\"text\" class=\"form-control\" placeholder=\"Search\">\n          </div>\n        </form>\n\n\n\n          <div class=\"list-group\">\n            <a href=\"#\" class=\"list-group-item active\">[Name]</a>\n            <a href=\"#\" class=\"list-group-item\">[Name]</a>\n            <a href=\"#\" class=\"list-group-item\">[Name]</a>\n            <a href=\"#\" class=\"list-group-item\">[Name]</a>\n            <a href=\"#\" class=\"list-group-item\">[Name]</a>\n            <a href=\"#\" class=\"list-group-item\">[Name]</a>\n            <a href=\"#\" class=\"list-group-item\">[Name]</a>\n            <a href=\"#\" class=\"list-group-item\">[Name]</a>\n            <a href=\"#\" class=\"list-group-item\">[Name]</a>\n            <a href=\"#\" class=\"list-group-item\">[Name]</a>\n            <a href=\"#\" class=\"list-group-item\">[Name]</a>\n          </div>\n        </div><!--/span-->\n      </div><!--/row-->";
  });