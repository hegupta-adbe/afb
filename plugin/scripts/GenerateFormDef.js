export default class GenerateFormDef {
  form = null;

  fields = [];

  labelIncludedMap = new Map();

  generateFromString = (dataStr) => {
    const resultEl = document.getElementById('result');// document.createElement("result");
    resultEl.innerHTML = dataStr.replaceAll('\n', '');

    const form = resultEl.querySelector('form');
    return this.generateFromForm(form);
  };

  generateFromForm(form) {
    this.form = form;
    this.fields = [];
    this.labelIncludedMap = new Map();
    if (form && form.elements) {
      [...form.elements].forEach((element) => {
        if (element instanceof HTMLInputElement
            || element instanceof HTMLSelectElement
            || element instanceof HTMLTextAreaElement || element instanceof HTMLButtonElement) {
          const name = element?.name?.trim();
          const id = element?.id?.trim();
          const field = {
            Name: name || id,
            Type: element?.type,
            Description: element?.title?.trim(),
            Placeholder: element?.placeholder?.trim() || '',
            Label: this.#getLabel(element),

            'Read Only': element.readOnly || '',

            Mandatory: element?.required || element.getAttribute('aria-required') === 'true' || '',
            Pattern: element?.pattern,
            Step: element?.step || undefined,
            Min: element?.minLength || element?.min || undefined,
            Max: element?.maxLength || element?.max || undefined,
            Value: element.value,
            Options: '',
          };
          GenerateFormDef.handleHiddenValue(element, field);
          GenerateFormDef.handleSelectElement(element, field);
          this.#handleCheckBox(element);
          this.fields.push(field);
        }
      });
    }
    return this.fields;
  }

  #getLabel(element) {
    let value;
    if (element instanceof HTMLButtonElement) {
      value = element.textContent?.trim();
    } else if (element.id) {
      const label = this.form.querySelector(`label[for=${element.id}]`);
      value = label?.textContent?.trim();
    }
    return value || element?.name;
  }

  #handleCheckBox(element) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      if (!this.labelIncludedMap.has(element.name)) {
        const label = this.form.querySelector(`label[for="${element.name}"]`);
        if (label) {
          const field = {
            Name: '',
            Type: 'fieldset',
            Description: '',
            Placeholder: '',
            Label: label?.textContent?.trim(),
            'Read Only': '',
            Mandatory: '',
            Pattern: '',
            Step: undefined,
            Min: undefined,
            Max: undefined,
            Value: '',
            Options: '',
          };
          this.labelIncludedMap.set(element.name, true);
          this.fields.push(field);
        }
      }
    }
  }

  static handleHiddenValue(element, field) {
    if (element?.type === 'hidden') {
      field.Value = element?.value;
    }
  }

  static handleSelectElement(element, field) {
    if (element instanceof HTMLSelectElement) {
      field.Type = 'select';
      field.Options = [];
      field.OptionNames = [];
      [...element.options].forEach((option) => {
        field.Options.push(option.value);
        field.OptionNames.push(option.text?.trim());
      });
      field.Options = field.Options.join(',');
    }
  }

  static convertToCSV(fields, divider = '\t') {
    if (fields && fields.length > 0) {
      const keys = Object.keys(fields?.[0]);
      const th = keys.join(divider);
      const rows = fields
        .map((field) => Object.values(field).join(divider))
        .join('\n');
      return `${th}\n${rows}`;
    }
    return 'table is empty';
  }
}
