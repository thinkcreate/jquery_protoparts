(function($) {
  if (!window.console || !console.firebug){
      var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
      "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

      window.console = {};
      for (var i = 0; i < names.length; ++i)
          window.console[names[i]] = function() {}
  }
  
  $.fn.protoparts = function(options) {
    // settings = $.extend({
    //   optionOne: 'defaultValue',
    //   optionTwo: { partOne: 'defaultValue' }
    // }, options);
    
    return this.each(function() {
      var $this = $(this);
      
      var parts, active_states;
      parts = active_states = {};
      
      function states_from_url(){
        var result = {};
        var hash = window.location.hash.slice(1);
        if(hash == ''){
          return {};
        }
        
        var pairs = hash.split('&');
        $.each(pairs, function(ix,pair){
            var temp = pair.split('=');
            result[temp[0]] = temp[1];
        });
        return result;
      }
      
      function url(active_states){
        var base_url = window.location.toString();
        if(window.location.hash != ""){
          base_url = base_url.split(window.location.hash)[0];
        }
        var hash = "";
        $.each(active_states, function(k,v){
          hash += (k+"="+v+"&");
        });
        hash = hash.slice(0, hash.length-1);
        
        return base_url+"#"+hash;
      }
      
      function find_parts(){
        // find all parts
        var _parts = {};
        $(".is").each(function(ix){
          var klasses = this.className.split(/ +/);
          var is_ix = klasses.indexOf("is");
          var part = klasses[is_ix-1];
          var state = klasses[is_ix+1];

          if (_parts[part] && _parts[part].indexOf(state) == -1){
            _parts[part].push(state);
          } else {
            _parts[part] = [state];
          }
        });
        return _parts;
      }
      
      function activate_state(part, state){
        var part_states = parts[part];
        
        //TODO handle no part, no state
        $.each(part_states, function(a, st){
          $('.'+part+'.is.'+st).css('display', 'none');
        });
        $('.'+part+'.is.'+state).css('display', 'block');
        
        // save states
        active_states[part] = state;
        $.cookies.set('active_states', active_states);
        $("#pp_bar .permalink").attr("href", url(active_states));
      }
      
      
      parts = find_parts();
      // read active states from cookie and url
      active_states = $.cookies.get('active_states') || {};
      $.each(states_from_url(), function(k,v){
        active_states[k] = v;
      });
      $.each(active_states, function(k, v){
        if(!parts[k]){
          delete active_states[k];
        }
      });
      
      console.log('states: '+active_states);
      
      // draw bar
      var selects = '';
      $.each(parts, function(part, part_states){
        var active_state = active_states[part] ? active_states[part] : part_states[0];
        
        var options = '';
        $.each(part_states, function(a, st){
          selected = (active_state == st ? "selected" : "");
          options += '\
          <option value="'+st+'" '+selected+'   >\
            '+st+'\
          </option>\
          ';
        });
        
        selects += '\
          <label for="">'+part+'</label>\
          <select name="'+part+'" class="part">\
          '+options+'\
          </select>\
        ';
        
        console.log('drawing bar');
      });
      
      $('body').prepend('<div id="pp_bar">\
          <a href="'+url(active_states)+'" class="permalink">\
            <span>link</span>\
          </a>\
        '+selects+'</div>'
      );
      
      // init all parts
      $.each(parts, function(part, part_states){
        var active_state = active_states[part] ? active_states[part] : part_states[0];
        
        activate_state(part, active_state);
      });
      
      
      // activate pp-bar
      $("#pp_bar select").change(function(event){
        select = event.target;
        option = select.options[select.selectedIndex];
        console.log("part:"+select.name+", state:"+option.value);
        activate_state(select.name, option.value);
      })
    });
  };
})(jQuery);