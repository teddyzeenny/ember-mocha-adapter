(function() {
  var done, doneTimeout, countAsync;

  done = null;
  doneTimeout = null;
  countAsync = 0;

  Ember.Test.MochaAdapter = Ember.Test.Adapter.extend({
    asyncStart: function() {
      countAsync++;
      clearTimeout(doneTimeout);
    },
    asyncEnd: function() {
      countAsync--;
      if (done && countAsync === 0) {
        doneTimeout = setTimeout(function() {
          done();
          done = null;
        });
      }
    },
    exception: function(reason) {
      var error;

      error = new Error(reason);
      if (done) {
        done(error);
      } else {
        setTimeout(function() {
          throw error;
        });
      }
    }
  });


  // Overwrite the default Mocha
  // methods to get rid of manually taking
  // care of the `done()` callback

  var oldBefore, oldBeforeEach,
      oldAfter, oldAfterEach, oldIt;

  oldBefore = window.before;
  window.before = fixAsync(oldBefore);

  oldBeforeEach = window.beforeEach;
  window.beforeEach = fixAsync(oldBeforeEach);

  oldAfter = window.after;
  window.after = fixAsync(oldAfter);

  oldAfterEach = window.afterEach;
  window.afterEach = fixAsync(oldAfterEach);



  function fixAsync(method) {
    return function(fn) {
      if (fn.length === 1) {
      return method(fn);
      }
      return method(function(d) {
        done = d;
        fn();
        if (countAsync === 0) {
          d();
          done = null;
        }
      });
    };
  }

  oldIt = window.it;

  window.it = function(desc, fn) {
    if (fn.length === 1) {
      return oldIt(desc, fn);
    }
    return oldIt(desc, function(d) {
      done = d;
      fn();
      if (countAsync === 0) {
        d();
        done = null;
      }
    });
  };

}());
