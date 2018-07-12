/*!
 * vue-matomo v0.1.8
 * (c) 2018 Dennis Ruhe
 * Released under the MIT License.
 */

var bootstrap = function (options) {
  var host = options.host;
  var filename = host + '/piwik.js';

  var scriptPromise = new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = filename;

    var head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(script);

    script.onload = resolve;
    script.onerror = reject;
  });

  scriptPromise.catch(function (error) {
    console.error('Error loading script', error);
  });

  return scriptPromise
};

function install (Vue, options) {
  if ( options === void 0 ) options = {};

  bootstrap(options)
    .then(function () {
      var host = options.host;
      var siteId = options.siteId;
      var matomo = window.Piwik.getTracker(host + '/piwik.php', siteId);

      // Assign matomo to Vue
      Vue.prototype.$piwik = matomo;
      Vue.prototype.$matomo = matomo;

      if (options.requireConsent) {
        matomo.requireConsent();
      }

      // Register first page view
      if (options.trackInitialView) {
          matomo.trackPageView();
      }

      // Track page navigations if router is specified
      if (options.router) {
        options.router.afterEach(function (to, from) {
          // Unfortunately the window location is not yet updated here
          // We need to make our own ulr using the data provided by the router
          var loc = window.location;

          // Protocol may or may not contain a colon
          var protocol = loc.protocol;
          if (protocol.slice(-1) !== ':') {
            protocol += ':';
          }

          var url = protocol + '//' + loc.host + to.path;

          matomo.setCustomUrl(url);
          matomo.trackPageView(to.name);
        });
      }
    });
}

export default install;
