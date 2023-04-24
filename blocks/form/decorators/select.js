function update(wrapper, input, fieldInfo, validate = true) {
    wrapper.dataset.empty = !input.value;
    if (validate) {
        const isValid = input.checkValidity();
        if (!isValid && input.validity.valueMissing) {
            const label = wrapper.querySelector('label');
            input.setCustomValidity(label.innerText.replace('*', '') + ' is required');
        } else {
            input.setCustomValidity('');
        }
        fieldInfo.innerHTML = input.validationMessage ;
        wrapper.dataset.valid = input.validity.valid;
    }
}

export default function decorateSelect(el) {
    el.querySelectorAll('.form-select-wrapper').forEach((wrapper) => {
        const selectTag = wrapper.querySelector('select');
        const options = selectTag.querySelectorAll('option');
        const display = document.createElement('div');
        display.className = 'field-select-display';
        const dialog = document.createElement('dialog');
        dialog.className = 'field-select-dialog';
        const validationIcon = document.createElement('span');
        validationIcon.className = 'field-validation-icon';
        const fieldInfo = document.createElement('div');
        fieldInfo.className = 'field-info';

        let selectedItems = [];
        const select = (divOption, option) => {
            selectedItems.forEach((item) => item.removeAttribute('selected')); // @todo handle multiple selection
            [divOption, option].forEach((item) => item.setAttribute('selected', ''));
            display.innerHTML = divOption.textContent;
            selectTag.value = divOption.getAttribute('value');
            selectedItems = [divOption, option];
        };
        options.forEach((option) => {
            const divOption = document.createElement('div');
            divOption.setAttribute('value', option.value);
            divOption.textContent = option.textContent;
            divOption.addEventListener('click', () => select(divOption, option));
            dialog.append(divOption);
        });
        const onClick = (state, validate) => {
            dialog.open = state;
            wrapper[state ? 'setAttribute': 'removeAttribute']('expanded', '');
            update(wrapper, selectTag, fieldInfo, validate)
        };
        const onFieldClick = (event) => {
            if (wrapper.dataset.valid !== undefined) {
                wrapper.dataset.valid = !!display.textContent;
            }
            onClick(!dialog.open, dialog.open);
            event.stopPropagation();
        }
        document.addEventListener('click', () => onClick(false, dialog.open));
        display.addEventListener('click', (event) => onFieldClick(event));
        wrapper.append(display, dialog, validationIcon, fieldInfo);
    });
  }