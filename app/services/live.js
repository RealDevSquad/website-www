import Service, { service } from '@ember/service';
import {
  HMSReactiveStore,
  selectIsSomeoneScreenSharing,
  selectPeers,
  selectIsConnectedToRoom,
  selectLocalPeer,
  HMSNotificationTypes,
} from '@100mslive/hms-video-store';
import { tracked } from '@glimmer/tracking';
import { APPS } from 'website-www/constants/urls';
import { globalRef } from 'ember-ref-bucket';
import { action } from '@ember/object';
import {
  ROLES,
  PATCH_API_CONFIGS,
  POST_API_CONFIGS,
  GET_API_CONFIGS,
  PICTURE_IN_PICTURE_MODE,
} from '../constants/live';
import { TOAST_OPTIONS } from '../constants/toast-options';
export default class LiveService extends Service {
  @service login;
  @service toast;
  hmsManager;
  hmsStore;
  hmsActions;
  hmsNotifications;
  @tracked isScreenShareOn = false;
  @tracked isJoined = false;
  @tracked activeRoomId = '';
  @tracked isLoading = false;
  @tracked localPeer;
  @globalRef('videoEl') videoEl;
  @tracked peers;
  @tracked hostRole = '';
  @tracked mavenRole = '';
  @tracked moderatorRole = '';
  @tracked guestRole = '';
  @tracked roomCodesForMaven = [];
  @tracked roomCodeLoading = false;
  @tracked userData = this.login?.userData;
  @tracked isUserRemoved = false;
  @tracked isPictureInPicture = false;
  pictureInPictureListenerElement;

  constructor() {
    super(...arguments);
    // Initialize HMS store
    this.hmsManager = new HMSReactiveStore();
    this.hmsManager.triggerOnSubscribe();
    this.hmsStore = this.hmsManager.getStore();
    this.hmsActions = this.hmsManager.getActions();
    this.hmsNotifications = this.hmsManager.notifications;
    this.hmsStore.subscribe(
      (peers) => this.renderScreenVideoToPeers(peers, this.hmsActions),
      selectPeers,
    );
    this.hmsStore.subscribe(
      (isConnected) => this.onConnection(isConnected),
      selectIsConnectedToRoom,
    );

    this.hmsNotifications.onNotification((notification) => {
      if (notification.type === HMSNotificationTypes.ROOM_ENDED) {
        this.toast.info(
          `${notification.data.reason}`,
          'Notify!',
          TOAST_OPTIONS,
        );
      }
    });
  }

  onConnection(isConnected) {
    this.isJoined = isConnected;
    if (this.isJoined) {
      window.addEventListener('beforeunload', this.onCloseAlert);
    } else {
      window.removeEventListener('beforeunload', this.onCloseAlert);
    }
    if (isConnected) {
      this.isLoading = false;
    }
  }

  onCloseAlert(event) {
    // Cancel the event
    event.preventDefault();
    // Chrome requires returnValue to be set
    event.returnValue = '';
    // Display a confirmation dialog
    return '';
  }

  async joinRoom(roomId, role, userName, eventCode = null) {
    try {
      const response = await fetch(`${APPS.API_BACKEND}/events/join`, {
        ...POST_API_CONFIGS,
        body: JSON.stringify({
          roomId,
          role,
          userId: userName,
          eventCode,
        }),
      });
      const { token } = await response.json();
      return token;
    } catch (error) {
      console.error(error);
      this.toast.error('Something went wrong!', 'error!', TOAST_OPTIONS);
    }
  }

  async joinAdminRoom(roomId, role, userName) {
    try {
      const response = await fetch(`${APPS.API_BACKEND}/events/join-admin`, {
        ...POST_API_CONFIGS,
        body: JSON.stringify({
          roomId,
          role,
          userId: userName,
        }),
      });
      const { token } = await response.json();
      return token;
    } catch (error) {
      console.error(error);
      this.toast.error('Something went wrong!', 'error!', TOAST_OPTIONS);
    }
  }

  async createRoom(userName) {
    try {
      const response = await fetch(`${APPS.API_BACKEND}/events`, {
        ...POST_API_CONFIGS,
        credentials: 'include',
        body: JSON.stringify({
          name: `live-rds-${Math.random()}`,
          description: 'The RDS live',
          region: 'in',
          userId: userName,
        }),
      });
      const { room_id } = await response.json();
      return room_id;
    } catch (error) {
      console.error(error);
      this.toast.error('Something went wrong!', 'error!', TOAST_OPTIONS);
    }
  }

  async endRoom(roomId) {
    try {
      const response = await fetch(`${APPS.API_BACKEND}/events/end`, {
        ...PATCH_API_CONFIGS,
        body: JSON.stringify({
          id: roomId,
          reason: 'Session is over',
          lock: true,
        }),
      });
      const { message } = await response.json();
      return message;
    } catch (error) {
      console.error(error);
      this.toast.error('Something went wrong!', 'error!', TOAST_OPTIONS);
    }
  }

  async getActiveRooms(id) {
    try {
      const response = await fetch(
        `${APPS.API_BACKEND}/events/${id}?isActiveRoom=true`,
        {
          ...GET_API_CONFIGS,
        },
      );
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      this.toast.error('Something went wrong!', 'error!', TOAST_OPTIONS);
    }
  }

  async getActiveEvents() {
    try {
      const response = await fetch(`${APPS.API_BACKEND}/events/?enabled=true`, {
        ...GET_API_CONFIGS,
      });
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      this.toast.error('Something went wrong!', 'error!', TOAST_OPTIONS);
    }
  }

  async getRoomCodes(roomId) {
    try {
      const response = await fetch(
        `${APPS.API_BACKEND}/events/${roomId}/codes`,
        {
          ...GET_API_CONFIGS,
        },
      );
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      this.toast.error('Something went wrong!', 'error!', TOAST_OPTIONS);
    }
  }

  async createRoomCodes(roomId, code) {
    try {
      const response = await fetch(
        `${APPS.API_BACKEND}/events/${roomId}/codes`,
        {
          ...POST_API_CONFIGS,
          body: JSON.stringify({
            eventCode: code,
            role: ROLES.maven,
          }),
        },
      );
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      this.toast.error('Something went wrong!', 'error!', TOAST_OPTIONS);
    }
  }

  async addPeer(roomId, peer) {
    try {
      const response = await fetch(
        `${APPS.API_BACKEND}/events/${roomId}/peers`,
        {
          ...POST_API_CONFIGS,
          body: JSON.stringify({
            peerId: peer?.id,
            name: peer?.name,
            role: peer?.roleName,
            joinedAt: peer?.joinedAt,
          }),
        },
      );
      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      this.toast.error('Something went wrong!', 'error!', TOAST_OPTIONS);
    }
  }

  async removePeer(peerId) {
    const roomId = this.hmsStore?.getState()?.room?.id;
    const reason = 'You have been kicked out for inappropriate behavior!';
    try {
      this.isUserRemoved = true;
      const response = await fetch(
        `${APPS.API_BACKEND}/events/${roomId}/peers/kickout`,
        {
          ...PATCH_API_CONFIGS,
          body: JSON.stringify({
            peerId: peerId,
            reason: reason,
          }),
        },
      );
      const data = await response.json();
      if (response.status === 200 && data) {
        this.toast.success(data?.message, 'Success!', TOAST_OPTIONS);
        return;
      }

      throw new Error(response);
    } catch (err) {
      console.error('The error is: ', err);
      this.toast.error('Something went wrong!', 'error!', TOAST_OPTIONS);
    } finally {
      this.isUserRemoved = false;
    }
  }

  async joinSession(roomId, userName, role, roomCode = null) {
    try {
      this.isLoading = true;
      const isSuperUser = this?.userData?.roles?.super_user;
      const isMember = this?.userData?.roles?.member;
      const isHost = ROLES.host === role;
      const isModerator = ROLES.moderator === role;

      if ((isModerator && !isMember) || (isHost && !isSuperUser)) {
        if (!this.userData) {
          this.isLoading = false;
          return this.toast.info(
            'Please login to join with this role!',
            'Unauthenticated!',
            TOAST_OPTIONS,
          );
        }
        this.toast.error(
          "You're not authorized to join with this role!",
          'Error!',
          TOAST_OPTIONS,
        );
        this.isLoading = false;
        return;
      }

      if (isHost || isModerator) {
        try {
          const token = await this.joinAdminRoom(roomId, role, userName);
          await this.hmsActions.join({
            userName,
            authToken: token,
          });
          const peer = this.hmsStore.getState(selectLocalPeer);
          this.localPeer = peer;
          this.activeRoomId = roomId;
          const addedPeerData = await this.addPeer(roomId, peer);
          if (addedPeerData) {
            this.toast.success(
              'Successfully joined the event!',
              'Success!',
              TOAST_OPTIONS,
            );
          }
          this.isLoading = false;
        } catch (error) {
          console.error(error);
          this.toast.error('Something went wrong!', 'Error!', TOAST_OPTIONS);
        }
        return;
      }

      if (role === ROLES.maven) {
        const token = await this.joinRoom(roomId, role, userName, roomCode);
        await this.hmsActions.join({
          userName,
          authToken: token,
        });
        const peer = this.hmsStore.getState(selectLocalPeer);
        this.localPeer = peer;
        this.activeRoomId = roomId;
        const addedPeerData = await this.addPeer(roomId, peer);
        if (addedPeerData) {
          this.toast.success(
            'Successfully joined the event!',
            'Success!',
            TOAST_OPTIONS,
          );
        }
        this.isLoading = false;
        return;
      }

      const token = await this.joinRoom(roomId, role, userName);
      await this.hmsActions.join({
        userName,
        authToken: token,
      });
      const peer = this.hmsStore.getState(selectLocalPeer);
      this.localPeer = peer;
      this.activeRoomId = roomId;
      const addedPeerData = await this.addPeer(roomId, peer);
      if (addedPeerData) {
        this.toast.success(
          'Successfully joined the event!',
          'Success!',
          TOAST_OPTIONS,
        );
      }
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error('my error ', error);
      this.toast.error('Something went wrong!', 'Error!', TOAST_OPTIONS);
    }
  }

  async leaveSession(role) {
    try {
      if (ROLES.host === role) {
        this.isLoading = true;
        await this.endRoom(this.activeRoomId);
        this.isLoading = false;
      } else {
        await this.hmsActions.leave();
      }
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    }
  }

  async shareScreen() {
    try {
      const screenShareOn = !this.hmsStore.getState(
        selectIsSomeoneScreenSharing,
      );
      await this.hmsActions.setScreenShareEnabled(screenShareOn);
      this.isScreenShareOn = screenShareOn;
    } catch (error) {
      console.error(error);
    }
  }

  async renderScreenVideoToPeers(peers) {
    this.peers = peers;
    const host = peers.find((peer) => peer.roleName === ROLES.host);
    const maven = peers.find((peer) => peer.roleName === ROLES.maven);
    const moderator = peers.find((peer) => peer.roleName === ROLES.moderator);
    const guest = peers.find((peer) => peer.roleName === ROLES.guest);
    this.hostRole = host?.roleName;
    this.mavenRole = maven?.roleName;
    this.moderatorRole = moderator?.roleName;
    this.guestRole = guest?.roleName;

    const presenterTrackId = peers?.find((p) => p.roleName === ROLES.host)
      ?.auxiliaryTracks[0];
    if (presenterTrackId) {
      await this.hmsActions.attachVideo(presenterTrackId, this.videoEl);
      this.isScreenShareOn = true;
    } else {
      // Since hms-video-store 0.11, detachVideo reads the SDK store, which
      // only exists once a room has been joined. The peers subscription also
      // fires on construction and before join, where there is nothing to
      // detach yet. Read the HMS store (not the tracked isJoined) so this
      // does not consume a tracked property during render.
      if (this.hmsStore.getState(selectIsConnectedToRoom)) {
        await this.hmsActions.detachVideo(presenterTrackId, this.videoEl);
      }
      this.isScreenShareOn = false;
    }
  }

  get isPictureInPictureSupported() {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return false;
    }

    const videoPrototype = window.HTMLVideoElement?.prototype;

    if (!videoPrototype) return false;

    const hasStandardApi =
      'requestPictureInPicture' in videoPrototype &&
      Boolean(document.pictureInPictureEnabled);
    const hasWebkitApi = 'webkitSupportsPresentationMode' in videoPrototype;

    return hasStandardApi || hasWebkitApi;
  }

  /**
   * Toggles picture in picture for the screen share video element.
   * Called straight from the click handler, without awaiting anything first,
   * because browsers only allow picture in picture inside a user gesture.
   */
  @action togglePictureInPicture() {
    const videoEl = this.videoEl;

    try {
      if (typeof document !== 'undefined' && document.pictureInPictureElement) {
        const exitRequest = document.exitPictureInPicture();
        exitRequest?.catch?.((error) => this.onPictureInPictureError(error));
        return;
      }

      if (!videoEl) {
        this.toast.info(
          'The screen share is not ready yet!',
          'Info!',
          TOAST_OPTIONS,
        );
        return;
      }

      if (videoEl.webkitPresentationMode === PICTURE_IN_PICTURE_MODE.PIP) {
        videoEl.webkitSetPresentationMode(PICTURE_IN_PICTURE_MODE.INLINE);
        this.isPictureInPicture = false;
        return;
      }

      if (
        videoEl.requestPictureInPicture &&
        typeof document !== 'undefined' &&
        document.pictureInPictureEnabled
      ) {
        const pipRequest = videoEl.requestPictureInPicture();
        pipRequest?.catch?.((error) => this.onPictureInPictureError(error));
        return;
      }

      if (
        videoEl.webkitSupportsPresentationMode?.(PICTURE_IN_PICTURE_MODE.PIP)
      ) {
        videoEl.webkitSetPresentationMode(PICTURE_IN_PICTURE_MODE.PIP);
        this.isPictureInPicture = true;
        return;
      }

      this.toast.info(
        'Pop out is not supported in this browser!',
        'Info!',
        TOAST_OPTIONS,
      );
    } catch (error) {
      this.onPictureInPictureError(error);
    }
  }

  onPictureInPictureError(error) {
    console.error(error);
    this.toast.error('Could not pop out the video!', 'Error!', TOAST_OPTIONS);
  }

  onEnterPictureInPicture = () => {
    this.isPictureInPicture = true;
  };

  onLeavePictureInPicture = () => {
    this.isPictureInPicture = false;
  };

  onPresentationModeChange = (event) => {
    const videoEl = event?.target ?? this.videoEl;
    this.isPictureInPicture =
      videoEl?.webkitPresentationMode === PICTURE_IN_PICTURE_MODE.PIP;
  };

  @action registerPictureInPictureListeners(element) {
    if (!element) return;

    this.removePictureInPictureListeners(this.pictureInPictureListenerElement);

    element.addEventListener(
      'enterpictureinpicture',
      this.onEnterPictureInPicture,
    );
    element.addEventListener(
      'leavepictureinpicture',
      this.onLeavePictureInPicture,
    );
    element.addEventListener(
      'webkitpresentationmodechanged',
      this.onPresentationModeChange,
    );

    this.pictureInPictureListenerElement = element;
  }

  @action removePictureInPictureListeners(element) {
    if (!element) return;

    element.removeEventListener(
      'enterpictureinpicture',
      this.onEnterPictureInPicture,
    );
    element.removeEventListener(
      'leavepictureinpicture',
      this.onLeavePictureInPicture,
    );
    element.removeEventListener(
      'webkitpresentationmodechanged',
      this.onPresentationModeChange,
    );

    if (this.pictureInPictureListenerElement === element) {
      this.pictureInPictureListenerElement = undefined;
    }

    this.isPictureInPicture = false;
  }

  async roomCodesHandler(value) {
    try {
      this.roomCodeLoading = true;
      const newRoomCodes = await this.createRoomCodes(this.activeRoomId, value);
      if (newRoomCodes) {
        this.roomCodeLoading = false;
        this.toast.success('New room code created!', 'Success!', TOAST_OPTIONS);
        this.roomCodesForMaven = newRoomCodes;
      }
    } catch (error) {
      console.error(error);
      this.roomCodeLoading = false;
    }
  }
}
