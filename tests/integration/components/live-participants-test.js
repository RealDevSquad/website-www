import { module, test } from 'qunit';
import { setupRenderingTest } from 'website-www/tests/helpers';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  hostPeer,
  mavenPeerData,
  moderatorData,
  guestData,
} from '../../constants/participants-data';

module('Integration | Component | live-participants', function (hooks) {
  setupRenderingTest(hooks);

  test('renders No Maven In the stream Text', async function (assert) {
    this.setProperties({
      peers: hostPeer,
      profilePic: 'profilepicurl',
      isKickoutModalOpen: true,
    });
    this.set('openKickoutModal', () => {
      this.isKickoutModalOpen = true;
    });
    await render(hbs`<LiveParticipants
      @user='Mavens'
      @role='maven'
      @peers={{this.peers}}
      @minimumParticipants=""
      @openKickoutModal={{this.openKickoutModal}}
    />`);
    assert.dom('[data-test-sidebar-body-role-guest]').hasText('Mavens (0)');
    assert
      .dom('[data-test-sidebar-body-role] .user')
      .hasText('No Mavens in the stream');
  });

  test('renders No Moderators In the stream Text', async function (assert) {
    this.setProperties({
      peers: hostPeer,
      profilePic: 'profilepicurl',
      isKickoutModalOpen: true,
    });
    this.set('openKickoutModal', () => {
      this.isKickoutModalOpen = true;
    });
    await render(hbs` <LiveParticipants
      @user='Moderators'
      @role='moderator'
      @peers={{this.peers}}
      @minimumParticipants=""
      @openKickoutModal={{this.openKickoutModal}}
    />`);
    assert.dom('[data-test-sidebar-body-role-guest]').hasText('Moderators (0)');
    assert
      .dom('[data-test-sidebar-body-role] .user')
      .hasText('No Moderators in the stream');
  });

  test('renders No Guests In the stream Text', async function (assert) {
    this.setProperties({
      peers: hostPeer,
      profilePic: 'profilepicurl',
      isKickoutModalOpen: true,
    });
    this.set('openKickoutModal', () => {
      this.isKickoutModalOpen = true;
    });
    await render(hbs`  <LiveParticipants
      @user='Guests'
      @role='guest'
      @peers={{this.peers}}
      @minimumParticipants=""
      @openKickoutModal={{this.openKickoutModal}}
    />`);
    assert.dom('[data-test-sidebar-body-role-guest]').hasText('Guests (0)');
    assert
      .dom('[data-test-sidebar-body-role] .user')
      .hasText('No Guests in the stream');
  });

  test('renders host name In the stream ', async function (assert) {
    this.setProperties({
      peers: hostPeer,
      profilePic: 'profilepicurl',
      isKickoutModalOpen: true,
    });
    this.set('openKickoutModal', () => {
      this.isKickoutModalOpen = true;
    });
    await render(hbs`<LiveParticipants
      @user='Hosts'
      @role='host'
      @peers={{this.peers}}
      @minimumParticipants="host"
      @openKickoutModal={{this.openKickoutModal}}
    />`);
    assert.dom('[data-test-sidebar-body-role-guest]').hasText('Hosts (1)');
    assert.dom('[data-test-sidebar-user="1"]').hasText('Ankush');
  });

  test('renders Mavens Lists who joined Stream', async function (assert) {
    this.setProperties({
      peers: mavenPeerData,
      profilePic: 'profilepicurl',
      isKickoutModalOpen: true,
    });
    this.set('openKickoutModal', () => {
      this.isKickoutModalOpen = true;
    });
    await render(hbs`<LiveParticipants
      @user='Mavens'
      @role='maven'
      @peers={{this.peers}}
      @minimumParticipants="maven"
      @openKickoutModal={{this.openKickoutModal}}
    />`);
    assert.dom('[data-test-sidebar-body-role-guest]').hasText('Mavens (2)');
    assert.dom('[data-test-sidebar-user="2"]').hasText('Maven1');
  });

  test('renders Moderators Lists who joined Stream', async function (assert) {
    this.setProperties({
      peers: moderatorData,
      profilePic: 'profilepicurl',
      isKickoutModalOpen: true,
    });
    this.set('openKickoutModal', () => {
      this.isKickoutModalOpen = true;
    });
    await render(hbs`<LiveParticipants
      @user='Moderator'
      @role='moderator'
      @peers={{this.peers}}
      @minimumParticipants="moderator"
      @openKickoutModal={{this.openKickoutModal}}
    />`);
    assert.dom('[data-test-sidebar-body-role-guest]').hasText('Moderator (2)');
    assert.dom('[data-test-sidebar-user="3"]').hasText('Mod3');
  });

  test('renders Guests Lists who joined Stream', async function (assert) {
    this.setProperties({
      peers: guestData,
      profilePic: 'profilepicurl',
      isKickoutModalOpen: true,
    });
    this.set('openKickoutModal', () => {
      this.isKickoutModalOpen = true;
    });
    await render(hbs`<LiveParticipants
      @user='Guest'
      @role='guest'
      @peers={{this.peers}}
      @minimumParticipants="guest"
      @openKickoutModal={{this.openKickoutModal}}
    />`);
    assert.dom('[data-test-sidebar-body-role-guest]').hasText('Guest (2)');
    assert.dom('[data-test-sidebar-user="3"]').hasText('Guest2');
  });

  test('kickout option should not be there for host', async function (assert) {
    this.setProperties({
      peers: hostPeer,
      profilePic: 'profilepicurl',
      isKickoutModalOpen: false,
    });
    this.set('openKickoutModal', () => {});

    await render(hbs`<LiveParticipants
      @user='Hosts'
      @role='host'
      @peers={{this.peers}}
      @minimumParticipants="host"
      @openKickoutModal={{this.openKickoutModal}}
    />`);

    assert.dom('[data-test-icon="remove"]').doesNotExist();
  });

  module('server participants count', function (hooks) {
    hooks.beforeEach(function () {
      this.live = this.owner.lookup('service:live');
      this.setProperties({ peers: guestData, openKickoutModal: () => {} });
    });

    const renderGuests = () =>
      render(hbs`<LiveParticipants
        @user='Guests'
        @role='guest'
        @peers={{this.peers}}
        @minimumParticipants="guest"
        @openKickoutModal={{this.openKickoutModal}}
      />`);

    test('before the first response it shows the peer list count', async function (assert) {
      await renderGuests();
      assert.dom('[data-test-sidebar-body-role-guest]').hasText('Guests (2)');
    });

    test('switches to the server count when a live response arrives', async function (assert) {
      await renderGuests();
      assert.dom('[data-test-sidebar-body-role-guest]').hasText('Guests (2)');

      this.live.participantsByRole = {
        host: 1,
        moderator: 0,
        maven: 0,
        guest: 5,
      };
      await settled();

      assert.dom('[data-test-sidebar-body-role-guest]').hasText('Guests (5)');
    });

    test('live with total 0 shows (0) even if the peer list has guests', async function (assert) {
      this.live.participantsByRole = {
        host: 0,
        moderator: 0,
        maven: 0,
        guest: 0,
      };
      await renderGuests();

      assert.dom('[data-test-sidebar-body-role-guest]').hasText('Guests (0)');
    });

    test('when the count is hidden it shows only the role name', async function (assert) {
      this.live.hideParticipantsCount = true;
      this.live.participantsByRole = null;
      await renderGuests();

      assert.dom('[data-test-sidebar-body-role-guest]').hasText('Guests');
      assert.dom('[data-test-sidebar-body-role-guest] span').doesNotExist();
    });
  });
});
