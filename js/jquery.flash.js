/*
jquery.flash v1.3.2 -  18/02/10
(c)2009 Stephen Belanger - MIT/GPL.
http://docs.jquery.com/License
*/
// IE uses a 5 year old version of Javascript, so let's add the missing indexOf method in manually.
Array.prototype.indexOf = function(o,i){
	for(var j = this.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0; i < j && this[i] !== o; i++);
	return j <= i ? - 1 : i;
};

// IE also doesn't have navigator.plugins, it uses ActiveXObject instead. >.>
$.fn.extend({
	// Check if browser is IE.
	isie: function() { var p = navigator.plugins; return (p && p.length) ? false : true; },
});

// Ok, enough fixing of IE's inadequacies, let's get on with it!
$.fn.extend({
	// Check if browser has flash.
	hasflash: function() { return (this.flashversion) ? true : false; },
	// Check which version of flash is installed.
	flashversion: $(this).isie()
		? function() {
            try {
                var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
            } catch(e) {
                try {
                    var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                    return [6, 0, 21];
                } catch(e) {};
                try {
                    axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                } catch(e) {};
            }
            if (axo != null) {
                return axo.GetVariable("$version").split(" ")[1].split(",");
            }
		}
		: function() {
			var p = navigator.plugins;
            var f = p['Shockwave Flash'];
            if (f && f.description)
            	return f.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split(".");
            else if (p['Shockwave Flash 2.0'])
                return '2.0.0.11';
            else
            	return false;
		},
    flash: function (opt) {
		// Let's make some handy functions to minimize code repetition.
        function attr(a, b) { return ' ' + a + '="' + b + '"'; }
        function param(a, b) { return '<param name="' + a + '" value="' + b + '" />'; }
		
		// Don't even bother if we don't have Flash installed.
        if ($(this).hasflash()) {
        	// Get current version for express install checking.
        	var cv = $(this).flashversion();
        	
			// Finally, we're on to the REAL action.
		    $(this).each(function () {
		    	// Create a reference to the current item as a jquery object.
				var e = $(this);
				
				// Merge settings objects.
				var s = $.extend({
						'id': e.attr('id'),
						'class': e.attr('class'),
						'width': e.width(),
						'height': e.height(),
						'src': e.attr('href'),
						'classid': 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000',
						'pluginspace': 'http://get.adobe.com/flashplayer',
						'availattrs': ['id', 'class', 'width', 'height', 'src'],
						'availparams': ['src', 'bgcolor', 'quality', 'allowscriptaccess', 'allowfullscreen', 'flashvars', 'wmode'],
						'version': '9.0.24'
					}, opt);
				
				// Collect list of attributes and parameters to use.
				var a = s.availattrs;
                var b = s.availparams;
                
                // Get required version array.
				var rv = s.version.split('.');
				
				// Open output string.
				var o = '<object';
				
				// Set codebase, if not supplied in the settings.
                if (!s.codebase) {
                    s.codebase = 'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=' + rv.join(',');
                }
				
				// Use express install swf, if necessary.
                if (s.express) {
                    for (var i in cv) {
                        if (parseInt(cv[i]) > parseInt(rv[i])) {
                            break;
                        }
                        if (parseInt(cv[i]) < parseInt(rv[i])) {
                            s.src = s.express;
                        }
                    }
                }
				
				// Convert flashvars to query string.
                if (s.flashvars) {
                    s.flashvars = unescape($.param(s.flashvars));
                }
				
				// Set browser-specific attributes
                a = $(this).isie() ? a.concat(['classid', 'codebase']) : a.concat(['pluginspage']);
				
				// Add attributes to output buffer.
                for (k in a) {
                    var n = (k == a.indexOf('src')) ? 'data' : a[k];
                    o += s[a[k]] ? attr(n, s[a[k]]) : '';
                };
                o += '>';
				
				// Add parameters to output buffer.
                for (k in b) {
                    var n = (k == b.indexOf('src')) ? 'movie' : b[k];
                    o += s[b[k]] ? param(n, s[b[k]]) : '';
                };
				
				// Close and swap.
                o += '</object>';
                e.replaceWith(o);
        	});
        }
                
        return this;
    }
});
