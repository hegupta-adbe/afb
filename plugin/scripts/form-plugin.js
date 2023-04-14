import { createForm } from '../form/form.js';
import GenerateFormDef from './GenerateFormDef.js';

const generator = new GenerateFormDef();

const tabHandler = (event, tabName, modal, master) => {
  const tabcontent = modal.getElementsByClassName('tabcontent');
  for (let i = 0; i < tabcontent.length; i += 1) {
    tabcontent[i].style.display = 'none';
  }
  const tablinks = modal.getElementsByClassName('tablinks');
  for (let i = 0; i < tablinks.length; i += 1) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }
  master.style.display = 'block';
  event.currentTarget.className += ' active';
};

const previewForm = async (formsDefs) => {
  const topnav = `
        <nav class="topnav">
            <h4 class="title">Extracted Form</h4>
            <button class="franklin-form-copy align-right btn success">Copy to Clipboard</button>
            <button id="franklin-form-export" class="btn success">Download as Excel</button>
        </nav>
        <div class="tab">
        </div>`;

  const modal = document.getElementById('dialog') || document.createElement('dialog');
  modal.className = 'franklin-dialog';
  modal.innerHTML = topnav;

  const tabs = modal.querySelector('.tab');

  if (formsDefs) {
    const formNames = Object.keys(formsDefs);
    formNames.forEach(async (formName) => {
      const button = document.createElement('button');
      button.className = 'tablinks';
      button.textContent = formName;
      tabs.append(button);

      const form = await createForm(formsDefs[formName], '');

      const formContainer = document.createElement('div');
      formContainer.className = 'form';
      formContainer.append(form);

      const master = document.createElement('main');
      master.className = `tabcontent ${formName}`;
      master.append(formContainer);
      modal.append(master);

      button.onclick = ((event) => {
        tabHandler(event, formName, modal, master);
      });
    });
  }
  modal.getElementsByClassName('franklin-form-copy')[0].onclick = (() => {
    const formName = modal.querySelector('.tab > button.active').textContent;
    const data = GenerateFormDef.convertToCSV(formsDefs[formName]);
    modal.close();
    navigator.clipboard.writeText(data);
  });
  document.body.append(modal);
  modal.showModal();
};

const exportFormDef = () => {
  const forms = document.querySelectorAll('form');

  const formsDefs = {};
  if (forms) {
    forms.forEach((form, index) => {
      const name = form.id || form.name || `Form-${index}`;
      formsDefs[name] = generator.generateFromForm(form);
    });
    previewForm(formsDefs);
  } else {
    console.log('No form found in main page');
  }
};

const addToolbar = () => {
  const topnav = `<nav class="topnav">
          <h5 class="title">Franklin Form</h5>
          <button id="franklin-form-download" class="align-right btn success">Download Form Block</button>
          <button id="franklin-form-export" class="btn success">Scan Forms</button>
      </nav>`;
  document.body.insertAdjacentHTML('beforebegin', topnav);
  document.getElementById('franklin-form-export').onclick = exportFormDef;
};

export default function main() {
  addToolbar();
}
