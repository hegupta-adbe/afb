const FILE_UPLOAD_URL = 'https://franklin-upload.crispr-api.workers.dev/upload';
const FILE_REQUEST_URL = 'https://franklin-upload.crispr-api.workers.dev/file/request';

function getMode() {
  const params = new URLSearchParams(document.location.search);
  return params.get('mode');
}

async function generateFileRequest() {
  const response = await fetch(FILE_REQUEST_URL);
  const result = await response.json();
  return result;
}

async function uploadFile(fileInput) {
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  const init = {
    method: 'POST',
    body: formData,
  };
  const response = await fetch(FILE_UPLOAD_URL, init);
  const result = await response.json();
  return result;
}

export async function formInit(form, formDef) {
  if (getMode() === 'request') {
    const button = form?.querySelector('form button[type="submit"]');
    button.textContent = 'Submit & Generate Upload Link';

    const file = form?.querySelector('.form-attachment');
    file.classList.add('hide');
  }
}

export async function handleFileUpload(fileInput) {
  let response;
  const mode = getMode();
  if (mode === 'request') {
    response = await generateFileRequest();
  } else {
    response = await uploadFile(fileInput);
  }
  fileInput.dataset.value = response?.id;
  fileInput.dataset.link = response?.link;
  return response?.id;
}

export async function formPostSubmit(form) {
  const mode = getMode();
  if (mode === 'request') {
    const fileInput = form?.querySelector('input[type="file"]');
    if (window.confirm('Do you like to upload attachments for submitted form?')) {
      window.open(fileInput.dataset.link, '_blank').focus();
    }
  }
}
