if (!window.console || !console.firebug){
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
    
    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}

Regions = function(){
  this.settings = null;
  this.templates = null;
  this.regions = null;
  
  
  function _getScript(url,success){
    var script=document.createElement('script');
    script.src=url;
    var head=document.getElementsByTagName('head')[0], 
        done=false;
    // Attach handlers for all browsers
    script.onload=script.onreadystatechange = function(){
      if ( !done && (!this.readyState
           || this.readyState == 'loaded' 
           || this.readyState == 'complete') ) {
        done=true;
        success();
      }
    };
    head.appendChild(script);
  }
  
  function _load_libs(contd){
    console.log(arguments.callee);
    // TODO decide if to load stuff
    console.log('loading jquery');
    _getScript('http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js',
      function() {
        console.log('success loading jquery');
        console.log('loading underscore');
        _getScript('http://github.com/documentcloud/underscore/raw/master/underscore-min.js',
          function(){
            console.log('success loading underscore');
            console.log('loading cookies');
            _getScript('http://cookies.googlecode.com/svn/trunk/jquery.cookies.js',
              function() {
                console.log('done loading cookies');
                contd();
              });
          });
      });
  }
  
  function _load_stylesheet(){
     var b = document.createElement("link");
     b.href = "http://github.com/thinkcreate/proto-regions/raw/master/css/regions.css";
     b.rel = "stylesheet";
     b.type = "text/css";
     document.getElementsByTagName("head")[0].appendChild(b);
     var e = setInterval(function () {
                            clearInterval(e);
                          },50)
  }
  
  function _settings(){
    s = $.cookies.get('settings')||{};
    // settings for spec. host and page 
    // var s = {
    //     "login":"true",
    //     "promo":"promo1"
    // }
    return s;
  }
  
  function _templates(){
    return {
      state_option:_.template('\
        <option value="<%= state %>" <%= selected ? "selected" : ""  %>>\
          <%= state %>\
        </option>'),
      region_select:_.template("\
        <label for=''><%= region %></label>\
        <select name='<%= region %>' class='region'>\
          <%= options %>\
        </select>\
      "),
      toolbar:_.template('\
        <div id="toolbar">\
          <%= regions %>\
        </div>\
      ')
    }
  }
  
  function _regions(){
    console.log(arguments.callee);
    var regions = [];
    $(".is").each(function(ix){
      var klasses = this.className.split(/ +/);
      var is_ix = klasses.indexOf("is");
      var region = klasses[is_ix-1];
      var state = klasses[is_ix+1];
      if(region && state){
        var known_region = _.detect(regions, function(r){ return r.id == region; });
        if(known_region){
          known_region.states.push(state);
        }else{
          regions.push({id:region,states:[state]});
        }
      } 
    })
    return regions;
  }
  
  function _init_toolbar(){
    // console.log(templates.state_option);
    var all_region_select = _.reduce(this.regions,'',function(result,region){
      var options = _.reduce(region.states, '', function(memo, s){
          var is_selected = (this.settings[region.id] == s && region.states.indexOf(s));
          return memo + this.templates.state_option({state:s, selected:is_selected});
      });
      return result + this.templates.region_select({region:region.id, options:options});
    });
    var toolbar = this.templates.toolbar({regions:all_region_select});
    $('body').prepend(toolbar);
    // console.log(toolbar);
  }
  
  function _bind_events(){
    $("#toolbar select").change(function(event){
      select = event.target;
      option = select.options[select.selectedIndex];
      // console.log("region:"+select.name+", state:"+option.value);
      activate(select.name, option.value);
    })
  }
  
  function activate(region, state){
    console.log(arguments.callee);
    console.log('setting %s to %s', region, state);
    r = '.'+region+'.is.';
    if($(r).css('display', 'none'));
    s = '.'+region+'.is.'+state;
    if($(s).css('display', 'block'))
      save(region, state);
  }
  
  function save(region,state){
    // settings = $.cookies.get('settings')||{};
    settings[region]=state;
    // console.log("saving settings");
    // console.log(settings);
    $.cookies.set('settings', settings);
  }
  
  function init(){
    console.log("doing an init");
    _load_libs(function(){
      console.log("after loading libs");
      _load_stylesheet();
      this.settings = _settings();
      this.templates = _templates();
      this.regions = _regions();
      console.log("found regions");
      console.log(regions);
      _init_toolbar(settings);
      _bind_events();
      
      _.each(_.keys($.cookies.get('settings')), function(k){
        activate(k, settings[k]);
      });
    });
  }
  
  // function change(){}
  // function verify(){}
  return{
    init:init,
    activate:activate
  }
}();