//
// Brightcove Media API
//
// Refer to Brightcove's Media API documentation for
// available methods, parameters for those methods and
// return values
// http://docs.brightcove.com/en/media
//
// Examples:
//
//  initialize the api (must be done before any API call):
//      brightcoveAPI("init", { token: "..." });
//      OR
//      brightcoveAPI({ token: "..." });
//      OR
//      window.brightcoveAPI.defaults.token = "...";
//  
//  call an API method with no parameters:
//      brightcoveAPI("find_all_videos", function(result) { ...do something... });
//  call an API method with parameters:
//      brightcoveAPI("find_video_by_id", { video_id = '123123121' }, function(result) { ...do something... });
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
        throw "This brightcove API requires jQuery: http://jquery.com";
    }

    var opts = {};
    var methods = {
        init: function (options) {
            opts = $.extend({}, window.brightcoveAPI.defaults, options);
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

    window.brightcoveAPI = function (method) {
        if (typeof method === 'object' || !method) {
            methods.init.apply(this, arguments);
        }
        else if (methods[method]) {
            methods[method].apply(this, [].slice.call(arguments, 1));
        }
        else {
            if (!opts.token) {
                throw "To use the brightcove API you must set your Media API token.";
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
                var errStr = "brightcove API error (" + result.code + ") for '" + method + "': " + result.error + ".";
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

})(jQuery);

window.brightcoveAPI.defaults = {
    token: null,
    apiUrl: "http://api.brightcove.com/services/library"
};