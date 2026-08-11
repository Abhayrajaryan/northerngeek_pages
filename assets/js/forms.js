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
      next.value = new URL("../thanks/", window.location.href).href;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
