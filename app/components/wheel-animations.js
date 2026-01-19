import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { imageUrl } from '../utils/cloudinary-image';

export default class WheelAnimationsComponent extends Component {
  width = document.body.clientWidth;
  get noOfMembers() {
    return this.args.users.length;
  }
  resizeImageUrl = imageUrl;

  memberStyle = (index) => {
    let style = `
      --size: ${this.randomNumberWithinRange(0.5, 1.2)};
      --x: ${this.randomX(index)};
      --y: ${this.randomY(index)};
    }
    `;
    return htmlSafe(style);
  };

  randomX(n) {
    const deg = n * (360 / this.noOfMembers) * (Math.PI / 180);
    return (this.width / 5) * Math.cos(deg);
  }

  randomY(n) {
    const deg = n * (360 / this.noOfMembers) * (Math.PI / 180);
    return 180 * Math.sin(deg);
  }

  randomNumberWithinRange(min, max) {
    return Math.random() * (max - min) + min;
  }
}
