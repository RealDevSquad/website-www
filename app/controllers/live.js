import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { getOwner } from '@ember/application';
import { globalRef } from 'ember-ref-bucket';
import { registerDestructor } from '@ember/destroyable';
import {
  ROLES,
  BUTTONS_TYPE,
  ANSWER_STATUS,
  ANSWER_MIN_LENGTH,
} from '../constants/live';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { APPS } from '../constants/urls';
export default class LiveController extends Controller {
  queryParams = ['dev'];
  ROLES = ROLES;
  @service featureFlag;
  @service login;
  @service toast;
  @service fastboot;
  @service survey;
  answerEventSource;
  questionEventSource;
  @tracked TABS = [
    { id: 1, label: 'Screenshare', active: true },
    { id: 2, label: 'Survey', active: false },
    { id: 4, label: 'Logs', active: false },
    { id: 3, label: 'More', active: false },
  ];
  @tracked activeTab = 'Screenshare';
  @tracked isLoading = false;
  @tracked name = this.login?.userData?.first_name ?? '';
  @tracked role = '';
  @tracked roomCode = '';
  @tracked isCopied = false;
  @tracked isKickoutModalOpen = false;
  @tracked isRoomCodeModalOpen = false;
  @tracked isWarningModalOpen = false;
  @tracked peerToRemove = '';
  @tracked newRoomCode = '';
  @tracked isActiveEventFound;
  @tracked buttonText = '';
  @tracked isAnswerReplyModalOpen = false;
  @tracked answerValue = '';
  @tracked answerValidationDetails = {
    isError: false,
    isHelperTextVisible: true,
    helperText: `Minimum character limit is ${ANSWER_MIN_LENGTH} characters`,
  };
  @tracked answerSubmitButtonState = {
    isDisabled: true,
    isLoading: false,
  };
  @globalRef('videoEl') videoEl;
  get liveService() {
    return getOwner(this).lookup('service:live');
  }

  constructor() {
    super(...arguments);

    if (!this.fastboot.isFastBoot) {
      const queryParams = new URLSearchParams(window.location.search);
      const isWordCloudFeatureOn = queryParams.get('wordCloud') === 'true';

      if (isWordCloudFeatureOn) {
        this.questionSSEListener();
        this.answerSSEListener();
      }
    }
    setTimeout(() => {
      this.isLoading = false;
    }, 4000);

    registerDestructor(this, () => {
      this.questionEventSource?.close();
      this.answerEventSource?.close();
    });
  }

  @action inputHandler(type, event) {
    const updatedValue = event.target.value;
    switch (type) {
      case 'name':
        this.name = updatedValue;
        break;
      case 'roomCode':
        this.roomCode = updatedValue;
        break;
      case 'newRoomCode':
        this.newRoomCode = updatedValue;
        break;
      default:
        console.error('No matching type');
    }
  }

  @action async clickHandler(e) {
    e.preventDefault();
    const isValidRole = Object.keys(ROLES).includes(this.role);
    const canJoin =
      this.role === this.ROLES.maven
        ? this.name && this.roomCode && isValidRole
        : this.name && isValidRole;

    if (!canJoin) return;

    const activeEventsData = await this.liveService.getActiveEvents();
    this.isActiveEventFound = Boolean(activeEventsData?.[0]?.enabled);

    if (this.isActiveEventFound) {
      const roomId = activeEventsData?.[0]?.room_id;
      this.liveService.joinSession(roomId, this.name, this.role, this.roomCode);
    } else {
      if (this.role !== ROLES.host)
        return this.toast.info(
          'No active event found!',
          'Info!',
          TOAST_OPTIONS,
        );

      const roomId = await this.liveService.createRoom(this.name);
      this.liveService.joinSession(roomId, this.name, this.role, this.roomCode);
    }

    this.name = '';
    this.roomCode = '';
  }

  @action backHandler() {
    this.role = '';
    this.name = '';
    this.roomCode = '';
  }

  @action tabHandler(tabId) {
    this.activeTab = this.TABS.find((tab) => tab.id === tabId).label;
    this.TABS = this.TABS.map((tab) =>
      tab.id === tabId ? { ...tab, active: true } : { ...tab, active: false },
    );
  }

  @action leaveSession() {
    this.liveService.leaveSession(this.role);
    this.isWarningModalOpen = false;
  }

  @action screenShare() {
    this.liveService.shareScreen();
  }

  @action removePeer() {
    this.liveService.removePeer(this.peerToRemove?.id);
    this.isKickoutModalOpen = false;
  }

  @action openKickoutModal(peer) {
    this.isKickoutModalOpen = true;
    this.peerToRemove = peer;
  }

  @action closeKickoutModal() {
    this.isKickoutModalOpen = false;
    this.peerToRemove = '';
  }

  @action toggleRoomCodeModal() {
    this.isRoomCodeModalOpen = !this.isRoomCodeModalOpen;
  }

  @action toggleWarningModal() {
    this.isWarningModalOpen = !this.isWarningModalOpen;
  }

  @action openAnswerReplyModal() {
    this.isAnswerReplyModalOpen = true;
  }

  @action closeAnswerReplyModal() {
    this.isAnswerReplyModalOpen = false;
  }

  @action onAnswerInput(event) {
    const maxCharacters = this.survey.recentQuestion.max_characters;

    this.answerValue = event.target.value;
    const answerLength = this.answerValue.trim().length;
    const isAnswerEqualToMinLength = answerLength >= ANSWER_MIN_LENGTH;

    if (!isAnswerEqualToMinLength) {
      this.answerValidationDetails.helperText = `Minimum character limit is ${ANSWER_MIN_LENGTH} characters`;
      this.answerValidationDetails.isHelperTextVisible = true;

      this.answerValidationDetails = { ...this.answerValidationDetails };

      this.answerSubmitButtonState.isDisabled = true;
      this.answerSubmitButtonState = { ...this.answerSubmitButtonState };

      return;
    }

    if (maxCharacters === null) {
      this.resetAnswerValidators();
      return;
    }

    if (this.answerValue.trim().length > maxCharacters) {
      this.answerValidationDetails.isError = true;
      this.answerValidationDetails.helperText = `Maximum character limit is ${maxCharacters} characters`;
      this.answerValidationDetails.isHelperTextVisible = true;
      this.answerValidationDetails = { ...this.answerValidationDetails };

      this.answerSubmitButtonState.isDisabled = true;
      this.answerSubmitButtonState = { ...this.answerSubmitButtonState };
    } else {
      this.resetAnswerValidators();
    }
  }

  @action async submitAnswer() {
    this.answerSubmitButtonState.isLoading = true;
    this.answerSubmitButtonState.isDisabled = true;

    this.answerSubmitButtonState = { ...this.answerSubmitButtonState };

    const answerBody = {
      answer: this.answerValue.trim(),
      answeredBy: this.liveService.localPeer?.id,
      eventId: this.liveService?.activeRoomId,
      questionId: this.survey.recentQuestion?.id,
    };

    const { error } = await this.survey.answerSubmitHandler(answerBody);

    if (!error) {
      this.isAnswerReplyModalOpen = false;
      this.answerSubmitButtonState.isLoading = false;
      this.answerSubmitButtonState.isDisabled = false;
      this.answerSubmitButtonState = { ...this.answerSubmitButtonState };
    }
  }

  @action async onAnswerReject(id) {
    this.survey.answerRejectHandler(id);
  }

  @action async onAnswerApprove(id) {
    this.survey.answerApproveHandler(id);
  }

  @action buttonClickHandler(buttonId) {
    switch (buttonId) {
      case BUTTONS_TYPE.SCREEN_SHARE:
        this.screenShare();
        break;
      case BUTTONS_TYPE.LEAVE_ROOM:
        this.leaveSession();
        break;
      default:
        console.error('No matching type');
    }
  }

  @action async selectRoleHandler(selectedRole) {
    this.role = selectedRole;

    this.buttonText = 'Loading...';
    const activeEventData = await this.liveService.getActiveEvents();
    this.isActiveEventFound = Boolean(activeEventData?.[0]?.enabled);

    if (!this.isActiveEventFound && selectedRole === ROLES.host) {
      this.buttonText = 'Create Event';
    } else if (activeEventData) {
      this.buttonText = 'Join';
    } else {
      this.buttonText = 'Join';
    }
  }

  @action createRoomCodeHandler(value, event) {
    event.preventDefault();
    if (value) {
      this.liveService.roomCodesHandler(value);
      this.newRoomCode = '';
    }
  }

  resetAnswerValidators() {
    this.answerValidationDetails.isError = false;
    this.answerValidationDetails.helperText = '';
    this.answerValidationDetails.isHelperTextVisible = false;
    this.answerValidationDetails = { ...this.answerValidationDetails };

    this.answerSubmitButtonState.isDisabled = false;
    this.answerSubmitButtonState = { ...this.answerSubmitButtonState };
  }
  questionSSEListener() {
    const event = new EventSource(`${APPS.API_BACKEND}/questions`);
    this.questionEventSource = event;

    event.onmessage = async (event) => {
      const parsedQuestion = JSON.parse(event.data);
      const question = parsedQuestion;

      const isQuestionChanged = question?.id !== this.survey.recentQuestion?.id;

      this.survey.setRecentQuestion(question);

      this.answerValue = '';
      this.answerValidationDetails.isError = false;
      this.answerValidationDetails.helperText = `Minimum character limit is ${ANSWER_MIN_LENGTH} characters`;
      this.answerValidationDetails.isHelperTextVisible = true;
      this.answerValidationDetails = { ...this.answerValidationDetails };

      if (isQuestionChanged) {
        this.answerEventSource?.close();
        this.answerSSEListener();
      }

      if (
        question &&
        this.liveService.isJoined &&
        this.liveService.localPeer.roleName !== this.ROLES.host
      ) {
        this.isAnswerReplyModalOpen = true;
      }
    };

    event.onerror = (event) => {
      console.error(event);
    };
  }

  answerSSEListener() {
    const localPeerRole = this.liveService.localPeer?.roleName;
    const isHost = localPeerRole === this.ROLES.host;
    const isModerator = localPeerRole === this.ROLES.moderator;
    const activeEventId = this.liveService?.activeRoomId;
    let answersEventStreamURL = '';

    if (isHost || isModerator) {
      answersEventStreamURL = `${APPS.API_BACKEND}/answers?eventId=${activeEventId}&questionId=${this.survey.recentQuestion?.id}`;
    } else {
      answersEventStreamURL = `${APPS.API_BACKEND}/answers?eventId=${activeEventId}&questionId=${this.survey.recentQuestion?.id}&status=${ANSWER_STATUS.APPROVED}`;
    }

    const event = new EventSource(answersEventStreamURL);
    this.answerEventSource = event;

    event.onmessage = async (event) => {
      const parsedAnswers = JSON.parse(event.data);
      const answers = parsedAnswers || [];

      if (isHost || isModerator) {
        this.survey.setAnswers(answers);
      } else {
        this.survey.setApprovedAnswers(answers);
      }
      this.survey.showWordCloud();
    };

    event.onerror = (event) => {
      console.error(event);
    };
  }
}
