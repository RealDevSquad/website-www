import { module, test } from 'qunit';
import { visit, currentURL, settled, triggerEvent } from '@ember/test-helpers';
import { setupApplicationTest } from 'website-www/tests/helpers';

module('Acceptance | live', function (hooks) {
  setupApplicationTest(hooks);
  // TODO - remove test for dev part when it goes to production
  test('skeleton and video should exists after join modal', async function (assert) {
    assert.expect(5);
    await visit('/live');

    assert.notEqual(currentURL(), '/live', 'url not equal to live!');
    assert.strictEqual(
      currentURL(),
      '/page-not-found',
      'url is /page-not-found',
    );

    await visit('/live?dev=true');

    assert.strictEqual(currentURL(), '/live?dev=true', 'we are on live page');
    assert.dom('[data-test-live-roles-card]').exists();
    assert.dom('[data-test-live-roles-card-title]').exists();
    // await click('[data-test-button="live-join"]');
    // TODO: Fix and improve this
    /*
      Line 30 has been commented as currently the click serves no meaning, as the test is incomplete and
      the button click fires a network call which causes test to fail

      Currently the when the button is clicked it makes a api call, which fails after some time
      When a promise was fired by this test, but this test don't wait for it to get resolved before this test is torn down,
      So later when the promise is resolved/rejected there no reference to the tests which had fired the event, so it gives error

      **ERROR message
        global failure: Error: Cannot call `.lookup` after the owner has been destroyed@ 30 ms
        Source:

        lookup@http://localhost:4200/assets/vendor.js:11608:15
        lookup@http://localhost:4200/assets/vendor.js:33127:33
        getInjection@http://localhost:4200/assets/vendor.js:23778:20
        get/<@http://localhost:4200/assets/vendor.js:21679:25
        untrack@http://localhost:4200/assets/vendor.js:61174:14

      This can be solved by waiting for the promise to get resolved before the test is torn down
    */
  });

  test('event info icon shows only after joining, with the right event ID', async function (assert) {
    await visit('/live?dev=true');

    assert.dom('[data-test-event-info]').doesNotExist();

    // Simulate a joined state instead of connecting to a real 100ms room
    const liveService = this.owner.lookup('service:live');
    liveService.activeRoomId = 'test-event-1';
    liveService.isJoined = true;
    await settled();

    assert.dom('[data-test-event-info]').exists();

    await triggerEvent('[data-test-event-info]', 'mouseenter');

    assert.dom('[data-test-event-info-id]').hasText('test-event-1');
  });
});
