import Component from '@glimmer/component';

export default class FeedbackCard extends Component {
  get formattedDate() {
    if (!this.args.createdAt) {
      return 'N/A';
    }
    const date = new Date(this.args.createdAt);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  }
}
