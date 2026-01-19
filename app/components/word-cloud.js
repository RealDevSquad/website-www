import Component from '@glimmer/component';
import { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';

const SHOW_WORD_CLOUD_AFTER_TIME = 1000; //time in milliseconds
export default class WordCloudComponent extends Component {
  @service survey;
  @service fastboot;

  constructor() {
    super(...arguments);
    let timeout;

    if (!this.fastboot.isFastBoot) {
      timeout = setTimeout(() => {
        this.survey.showWordCloud();
      }, SHOW_WORD_CLOUD_AFTER_TIME);
    }

    registerDestructor(this, () => {
      clearTimeout(timeout);
    });
  }
}
