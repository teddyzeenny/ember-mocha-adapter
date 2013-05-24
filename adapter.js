(function() {
  var done, doneTimeout, countAsync;

  done = null;
  doneTimeout = null;
  isAsync = false;

  Ember.Test.MochaAdapter = Ember.Test.Adapter.extend({
    init: function() {
      this._super();
      window.mocha.ui('ember-bdd');
    },
    asyncStart: function() {
      isAsync = true;
      clearTimeout(doneTimeout);
    },
    asyncEnd: function() {
      isAsync = false;
      if (done) {
        doneTimeout = setTimeout(function() {
          if (!isAsync) {
            done();
          }
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


  function fixAsync(suites, methodName) {
    return function(fn) {
      if (fn.length === 1) {
        suites[0][methodName](fn);
      } else {
        suites[0][methodName](function(d) {
          invoke(fn, d);
        });
      }
    };
  }

  function invoke(fn, d) {
    done = d;
    fn();
    if (!isAsync) {
      d();
      done = null;
    }
  }

  var emberBdd = function(suite) {
    var suites = [suite];

    suite.on('pre-require', function(context, file, mocha) {

      context.before = fixAsync(suites, 'beforeAll');

      context.after = fixAsync(suites, 'afterAll');

      context.beforeEach = fixAsync(suites, 'beforeEach');

      context.afterEach = fixAsync(suites, 'afterEach');

      /**
       * Describe a specification or test-case
       * with the given `title` and callback `fn`
       * acting as a thunk.
       */

      context.it = context.specify = function(title, fn){
        var suite = suites[0], test;
        if (suite.pending) {
          fn = null;
        }
        if (!fn || fn.length === 1) {
          test = new Mocha.Test(title, fn);
        } else {
          var method = function(d) {
            invoke(fn, d);
          };
          test = new Mocha.Test(title, method);
        }
        suite.addTest(test);
        return test;
      };

      /**
       * Describe a "suite" with the given `title`
       * and callback `fn` containing nested suites
       * and/or tests.
       */

      context.describe = context.context = function(title, fn){
        var suite = Mocha.Suite.create(suites[0], title);
        suites.unshift(suite);
        fn.call(suite);
        suites.shift();
        return suite;
      };

      /**
       * Pending describe.
       */

      context.xdescribe =
      context.xcontext =
      context.describe.skip = function(title, fn){
        var suite = Mocha.Suite.create(suites[0], title);
        suite.pending = true;
        suites.unshift(suite);
        fn.call(suite);
        suites.shift();
      };

      /**
       * Exclusive suite.
       */

      context.describe.only = function(title, fn){
        var suite = context.describe(title, fn);
        mocha.grep(suite.fullTitle());
      };


      /**
       * Exclusive test-case.
       */

      context.it.only = function(title, fn){
        var test = context.it(title, fn);
        mocha.grep(test.fullTitle());
      };

      /**
       * Pending test case.
       */

      context.xit =
      context.xspecify =
      context.it.skip = function(title){
        context.it(title);
      };


    });

  };

  window.Mocha.interfaces['ember-bdd'] = emberBdd;
}());
