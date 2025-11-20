import Component from '@glimmer/component';
import Cropper from 'cropperjs';
import { action } from '@ember/object';

export default class ImageCropperComponent extends Component {
  get image() {
    if (this.cropper) {
      this.cropper.destroy();
    }
    return this.args.image;
  }

  @action loadCropper() {
    const image = document.getElementById('image-cropper');
    if (!image) {
      return;
    }
    this.cropper = new Cropper(image, {
      autoCrop: true,
      viewMode: 1,
      dragMode: 'crop',
      aspectRatio: 1,
      cropBoxResizable: true,
      movable: false,
      zoomOnWheel: false,
      rotatable: false,
      toggleDragModeOnDblclick: false,
      ready: () => {
        this.setImageData();
      },
      cropend: () => {
        this.setImageData();
      },
    });
  }

  setImageData() {
    const { x, y, width, height } = this.cropper.getData(true);
    this.args.setImageCoordinates({ x, y, width, height });
  }
}
