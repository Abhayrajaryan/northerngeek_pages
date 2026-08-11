/* FormSubmit shared behaviour */
(function () {
  "use strict";

  function init() {
    var forms = document.querySelectorAll('form[action*="formsubmit.co"]');
    forms.forEach(function (form) {
      var next = form.querySelector('input[name="_next"]');
      if (!next) {
        next = document.createElement("input");
        next.type = "hidden";
        next.name = "_next";
        form.appendChild(next);
      }
      // Resolve "thanks/" one directory above the current page (e.g. /site/contact/ -> /site/thanks/).
      // Using the URL constructor lets the browser do the relative resolution so this works
      // regardless of hosting root (custom domain, GitHub Pages project subpath, local dev, etc.)
      next.value = new URL("../thanks/", window.location.href).href;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
