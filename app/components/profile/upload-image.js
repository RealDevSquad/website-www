import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TOAST_OPTIONS } from '../../constants/toast-options';
import { service } from '@ember/service';

export default class UploadImageComponent extends Component {
  formData;
  @service toast;
  @service router;
  @tracked image;
  @tracked isImageSelected = false;
  @tracked overDropZone = false;
  @tracked isImageUploading = false;
  @tracked imageUploadSuccess = false;
  @tracked statusMessage;
  @tracked imageFileName;
  imageCoordinates = null;
  uploadUrl = this.args.uploadUrl;
  formKeyName = this.args.formKeyName;

  @action goBack() {
    this.image = null;
    this.setImageSelected(false);
  }
  @action updateImage(file) {
    this.setStatusMessage('');
    const reader = new FileReader();

    if (file) {
      this.updateFormData(file, this.formKeyName);
      reader.readAsDataURL(file);
      this.imageFileName = file.name;
    }
    reader.onload = () => {
      const image = reader.result;
      this.image = image;
    };
  }

  @action setImageCoordinates(data) {
    this.imageCoordinates = data;
  }

  @action handleBrowseImage(e) {
    const [file] = e.target.files;
    this.updateImage(file);
    this.setImageSelected(true);
  }

  @action handleDrop(e) {
    this.preventDefaults(e); // This is used to prevent opening of image in new tab while drag and drop
    const [file] = e.dataTransfer.files;
    this.updateImage(file);
    this.setImageSelected(true);
    this.setOverDropZone(false);
  }
  @action handleDragOver(e) {
    this.preventDefaults(e);
    this.setOverDropZone(true);
    e.dataTransfer.dropEffect = 'move';
  }
  @action handleDragEnter(e) {
    this.preventDefaults(e);
    this.setOverDropZone(true);
  }
  @action handleDragLeave(e) {
    this.preventDefaults(e);
    this.setOverDropZone(false);
  }

  @action onSubmit(e) {
    this.preventDefaults(e);
    this.formData.set('coordinates', JSON.stringify(this.imageCoordinates));
    this.uploadImage(this.formData);
  }

  uploadImage(data) {
    const url = this.uploadUrl;
    this.setImageUploading(true);
    fetch(`${url}`, {
      method: 'POST',
      credentials: 'include',
      body: data,
    })
      .then(async (res) => {
        const status = res.status;
        const data = await res.json();
        const message = data.message;
        this.handleResponseStatusMessage(status, message);
      })
      .catch((err) => {
        this.setImageUploadSuccess(false);
        this.setStatusMessage(
          'Error occured, please try again and if the issue still exists contact administrator and create a issue on the repo with logs',
        );
        console.error(err);
      })
      .finally(() => {
        this.setImageUploading(false);
      });
  }

  updateFormData(file, key) {
    const formData = new FormData();
    formData.append(key, file);
    this.formData = formData;
  }

  handleResponseStatusMessage(status, message) {
    if (status === 200) {
      this.setImageUploadSuccess(true);
      this.args.outsideClickModel();
      this.toast.success(message, '', TOAST_OPTIONS);
    } else {
      this.setImageUploadSuccess(false);
      this.setStatusMessage(message);
    }
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  setOverDropZone(bool) {
    this.overDropZone = bool;
  }

  setImageSelected(bool) {
    this.isImageSelected = bool;
  }

  setImageUploading(bool) {
    this.isImageUploading = bool;
  }

  setImageUploadSuccess(bool) {
    this.imageUploadSuccess = bool;
  }

  setStatusMessage(message) {
    this.statusMessage = message;
  }
}
