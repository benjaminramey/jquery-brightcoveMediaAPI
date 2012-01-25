// jQuery Brightcove Media API Wrapper
// Ben Ramey <ben.ramey@gmail.com>
//
// Refer to Brightcove's Media API documentation for
// available methods, parameters for those methods and
// return values
// http://docs.brightcove.com/en/media
//
// Examples:
//
//  initialize the api (must be done before any API call):
//      $.bcMediaAPI("init", { token: "..." });
//      OR
//      $.bcMediaAPI({ token: "..." });
//  
//  call an API method with no parameters:
//      $.bcMediaAPI("find_all_videos", function(result) { ...do something... });
//  call an API method with parameters:
//      $.bcMediaAPI("find_video_by_id", { video_id = '123123121' }, function(result) { ...do something... });
//
// API extensions:
//  video_exists:
//      description: returns true or false depending on whether the specified video exists or not
//      parameters:
//          options: same as for "search_videos" API call
//          callback: callback function to handle result of query
//
(function ($) {
    if (!$) {
        throw "This Brightcove Media API requires jQuery: http://jquery.com";
    }
	
	var defaults = {
		token: null,
		apiUrl: "http://api.brightcove.com/services/library"
	};
    var opts = {};
    var methods = {
        init: function (options) {
            opts = $.extend({}, defaults, options);
        },
        video_exists: function (options, callback) {
            if (typeof options == "function") {
                callback = options;
                options = {};
            }

            var callbackWrap = function (result) {
                callback.apply(this, [result.items.length > 0]);
            };

            doApiCall("search_videos", options, callbackWrap);
        }
    };

    var bcMediaAPI, _bcMediaAPI
	bcMediaAPI = function (method) {
        if (typeof method === 'object' || !method) {
            methods.init.apply(this, arguments);
        }
        else if (methods[method]) {
            methods[method].apply(this, [].slice.call(arguments, 1));
        }
        else {
            if (!opts.token) {
                throw "To use the Brightcove Media API you must set your Media API token.";
            }

            var options, callback;
            if (arguments.length > 1) {
                options = arguments[1];
            }
            if (arguments.length == 2) {
                callback = arguments[2];
            }

            doApiCall(method, options, callback);
        }
    };

    // private functions
    function doApiCall(method, options, callback) {
        if (typeof options == "function") {
            callback = options;
            options = {};
        }
        else {
            options = options || {};
            callback = callback || function (result) { };
        }

        var data = $.extend(options, { command: method, token: opts.token });
        $.ajax({
            url: opts.apiUrl,
            data: data,
            dataType: "jsonp",
            success: wrapCallback(callback)
        });
    }

    function wrapCallback(origCallback) {
        return function (result) {
            if (result.error) {
                var errStr = "Brightcove Media API error (" + result.code + ") for '" + method + "': " + result.error + ".";
                if (result.errors) {
                    for (var key in result.errors) {
                        errStr += " (" + result.errors[key].code + ") " + result.errors[key].error + ".";
                    }
                }
                throw errStr;
            }
            else {
                origCallback.apply(this, [result]);
            }
        };
    }
	
    bcMediaAPI.noConflict = function () {
        if ($.bcMediaAPI === bcMediaAPI) {
            $.bcMediaAPI = _bcMediaAPI;
        }
        return bcMediaAPI;
    };

    if ($.bcMediaAPI) {
        _bcMediaAPI = $.bcMediaAPI;
    }

    $.bcMediaAPI = bcMediaAPI;
})(jQuery);