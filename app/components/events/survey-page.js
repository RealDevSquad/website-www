import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { debounce } from '@ember/runloop';
import { service } from '@ember/service';
import {
  QUESTION_DEBOUNCE_TIME,
  QUESTION_MIN_LENGTH,
  POST_API_CONFIGS,
} from '../../constants/live';
import { APPS } from '../../constants/urls';
import { TOAST_OPTIONS } from '../../constants/toast-options';

export default class SurveyPageComponent extends Component {
  @service live;
  @service login;
  @service toast;
  @tracked isMaxCharactersChecked = false;
  @tracked isAskQuestionModalOpen = false;
  @tracked maxCharacters;
  @tracked question = '';
  @tracked isQuestionValid = false;
  @tracked isQuestionSubmitButtonDisabled = true;
  @tracked isQuestionApiLoading = false;
  @tracked ANSWER_STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];
  @tracked activeAnswerFilterValue = 'ALL';
  @tracked userData = this.login?.userData;
  get isAnswersPresent() {
    return Boolean(this.answers?.length);
  }

  get answers() {
    const allAnswers = this.args.answers;

    if (this.activeAnswerFilterValue === 'ALL') return allAnswers;

    const answersToShow = allAnswers.filter(
      (answer) => answer.status === this.activeAnswerFilterValue,
    );

    return answersToShow;
  }

  get isAskQuestionButtonDisabled() {
    return !this.userData?.roles?.super_user;
  }

  @action onAnswerFilterChange(event) {
    this.activeAnswerFilterValue = event.target.value;
  }

  @action openAskQuestionModal() {
    this.isAskQuestionModalOpen = true;
  }

  @action closeAskQuestionModal() {
    this.isAskQuestionModalOpen = false;
    this.onQuestionModalUnmount();
  }

  @action async onQuestionSubmit() {
    this.isQuestionApiLoading = true;
    const questionBody = {
      question: this.question.trim(),
      createdBy: this.login.userData.id,
      eventId: this.live.activeRoomId,
      maxCharacters: this.maxCharacters || null,
    };

    try {
      const questionResponse = await fetch(`${APPS.API_BACKEND}/questions`, {
        ...POST_API_CONFIGS,
        body: JSON.stringify(questionBody),
      });
      const question = await questionResponse.json();

      if (!questionResponse.ok)
        return this.toast.error(
          question.message,
          question.error,
          TOAST_OPTIONS,
        );

      this.toast.success(question.message, question.error, TOAST_OPTIONS);
    } catch (error) {
      console.error(error);
    } finally {
      this.isQuestionApiLoading = false;
      this.onQuestionModalUnmount();
      this.isAskQuestionModalOpen = false;
    }
  }

  @action toggleMaxCharacterChecked() {
    this.isMaxCharactersChecked = !this.isMaxCharactersChecked;

    if (!this.isMaxCharactersChecked) {
      this.maxCharacters = null;
    }

    if (!this.isMaxCharactersChecked && this.isQuestionValid) {
      this.isQuestionSubmitButtonDisabled = false;
    } else {
      this.isQuestionSubmitButtonDisabled = true;
    }
  }

  @action onCharacterLimitInput(event) {
    this.maxCharacters = event.target.value && Number(event.target.value);

    if (!this.isMaxCharactersChecked && this.isQuestionValid) {
      this.isQuestionSubmitButtonDisabled = false;
      return;
    }

    if (this.maxCharacters && this.isQuestionValid) {
      this.isQuestionSubmitButtonDisabled = false;
      return;
    }

    this.isQuestionSubmitButtonDisabled = true;
  }

  @action onQuestionInput(event) {
    const setQuestion = () => {
      this.question = event.target.value;

      if (this.question.length > QUESTION_MIN_LENGTH) {
        this.isQuestionValid = true;
      } else {
        this.isQuestionValid = false;
      }

      if (!this.isMaxCharactersChecked && this.isQuestionValid) {
        this.isQuestionSubmitButtonDisabled = false;
        return;
      }

      if (
        this.isMaxCharactersChecked &&
        this.maxCharacters &&
        this.isQuestionValid
      ) {
        this.isQuestionSubmitButtonDisabled = false;
        return;
      }

      this.isQuestionSubmitButtonDisabled = true;
    };

    debounce(setQuestion, QUESTION_DEBOUNCE_TIME, event.target.value);
  }

  onQuestionModalUnmount() {
    this.isMaxCharactersChecked = false;
    this.isQuestionValid = false;
    this.isQuestionSubmitButtonDisabled = true;
    this.question = '';
    this.maxCharacters = null;
  }
}
