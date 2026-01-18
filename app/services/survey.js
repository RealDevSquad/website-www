import Service, { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';
import { TOAST_OPTIONS } from '../constants/toast-options';
import { APPS } from '../constants/urls';
import {
  ANSWER_STATUS,
  API_METHOD,
  PATCH_API_CONFIGS,
  ROLES,
} from '../constants/live';
import { generateWordCloud } from '../d3/word-cloud';

export default class SurveyService extends Service {
  @service router;
  @service toast;
  @service live;
  @service fastboot;
  @tracked answers = [];
  @tracked approvedAnswers = [];
  @tracked recentQuestion;
  @tracked screenWidth;

  constructor() {
    super(...arguments);

    const onResize = () => {
      this.screenWidth = window.innerWidth;
      this.showWordCloud();
    };

    if (!this.fastboot.isFastBoot) {
      this.screenWidth = window.innerWidth;
      window.addEventListener('resize', onResize);
      registerDestructor(this, () => {
        window.removeEventListener('resize', onResize);
      });
    }
  }
  setApprovedAnswers(approvedAnswers) {
    this.approvedAnswers = approvedAnswers;
  }

  setAnswers(answers) {
    this.answers = answers;
  }

  setRecentQuestion(question) {
    this.recentQuestion = question;
  }

  async answerSubmitHandler(payload) {
    let error = null,
      answer = null;

    try {
      const answerResponse = await fetch(`${APPS.API_BACKEND}/answers`, {
        method: API_METHOD.POST,
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(payload),
      });
      answer = await answerResponse.json();

      if (!answerResponse.ok)
        return this.toast.error(answer.message, answer.error, TOAST_OPTIONS);

      this.toast.success(answer.message, answer.error, TOAST_OPTIONS);

      return { error: error, result: answer };
    } catch (error) {
      console.error('Error while submitting answer: ', error);
      return { error: error, result: null };
    }
  }
  async answerApproveHandler(id) {
    const actualId = id.split('approve-button-')[1];
    const approvalPayload = {
      status: ANSWER_STATUS.APPROVED,
    };

    try {
      const approveResponse = await fetch(
        `${APPS.API_BACKEND}/answers/${actualId}`,
        {
          ...PATCH_API_CONFIGS,
          body: JSON.stringify(approvalPayload),
        },
      );

      if (!approveResponse.ok) throw new Error();

      this.toast.success(
        'Answer approved successfully',
        'Success',
        TOAST_OPTIONS,
      );
    } catch (error) {
      console.error('Error while approving answer: ', error);
      this.toast.error('Error while approving answer', 'Error', TOAST_OPTIONS);
    }
  }

  async answerRejectHandler(id) {
    const actualId = id.split('reject-button-')[1];
    const rejectionPayload = {
      status: ANSWER_STATUS.REJECTED,
    };

    try {
      const rejectResponse = await fetch(
        `${APPS.API_BACKEND}/answers/${actualId}`,
        {
          ...PATCH_API_CONFIGS,
          body: JSON.stringify(rejectionPayload),
        },
      );

      if (!rejectResponse.ok) throw new Error();

      this.toast.success(
        'Answer rejected successfully',
        'Success',
        TOAST_OPTIONS,
      );
    } catch (error) {
      console.error('Error while rejecting answer: ', error);
      this.toast.error('Error while rejecting answer', 'Error', TOAST_OPTIONS);
    }
  }

  getFilteredApprovedAnswersArray() {
    const isHost = this.live.localPeer?.roleName === ROLES.host;
    const isModerator = this.live.localPeer?.roleName === ROLES.moderator;
    const filteredApprovedAnswersArray = [];

    if (isHost || isModerator) {
      const filteredApprovedAnswers = this.answers?.filter(
        (answer) => answer.status === ANSWER_STATUS.APPROVED,
      );
      filteredApprovedAnswers?.forEach((answer) => {
        filteredApprovedAnswersArray.push(answer.answer);
      });
      return filteredApprovedAnswersArray;
    }

    this.approvedAnswers?.forEach((answer) => {
      filteredApprovedAnswersArray.push(answer.answer);
    });
    return filteredApprovedAnswersArray;
  }

  showWordCloud() {
    const element = '.word-cloud';
    const words = this.getFilteredApprovedAnswersArray();

    let wordCloudSize = {
      x: this.screenWidth,
      y: this.screenWidth,
    };

    if (!words?.length) return;

    //for mobile/small screens
    if (this.screenWidth < 500)
      return generateWordCloud(words, element, wordCloudSize);

    // for screen >=500px
    generateWordCloud(words, element);
  }
}
