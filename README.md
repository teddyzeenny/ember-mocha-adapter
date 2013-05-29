Ember Mocha Adapter
-------------------

A mocha adapter for ember-testing.

This adapter makes async testing ember apps with mocha
easier.

It gets rid of the `done()` callback and lets
you test without worrying whether your tests
are sync or async.


### Setup

Include the `adapter.js` file in your test.  Then:

```javascript
Ember.Test.adapter = Ember.Test.MochaAdapter.create();
```

### Example:

```javascript

describe("Adding a post", function() {

  beforeEach(function() {
    visit('posts/new');
  });

  afterEach(function() {
    App.reset();
  });

  it("should take me to a form", function() {
    find('form').should.exist;
  });

  it("should not submit with an empty title", function() {
    click('.submit').then(function() {
      find('.error').text().should.equal('Title is required.');
    });
  });

  it("should create a post on submit", function() {
    fillIn('.title', 'Test Post')
    .fillIn('.body', 'This is the body')
    .click('.submit')
    .then(function() {
      find('.post').should.exist;
      find('.post-title').text().should.equal('Test Post');
    });
  });


});

```
