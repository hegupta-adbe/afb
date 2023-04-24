function update(wrapper, input, fieldInfo, validate = true) {
    wrapper.dataset.empty = !input.value;
    let errorMessage = (input.min && input.max ? '<span>' + input.value.length + ' / ' + input.max + '</span>': '');
    if (validate) {
        const isValid = input.checkValidity();
        if (input.min && input.max && input.value.length > input.max) {
            input.setCustomValidity('Value must be less than ' + input.max + ' characters.');
        } else if (!isValid && input.validity.valueMissing) {
            const label = wrapper.querySelector('label');
            input.setCustomValidity(label.innerText.replace('*', '') + ' is required');
        } else {
            input.setCustomValidity('');
        }
        errorMessage = input.validationMessage + errorMessage;
        wrapper.dataset.valid = input.validity.valid;
    } 
    fieldInfo.innerHTML = errorMessage;    
}

export default async function decorate(form) {
    const inputs = form.querySelectorAll('input:not([type=checkbox], [type=radio])');
    [...inputs].forEach((input) => {
        const wrapper = input.closest('.field-wrapper');
        const reset = document.createElement('span');
        reset.className = 'field-reset';
        reset.onclick = () =>  {
            input.value = '';
            input.focus();
            update(wrapper, input, fieldInfo);
        }
        const validationIcon = document.createElement('span');
        validationIcon.className = 'field-validation-icon';
        const fieldInfo = document.createElement('div');
        fieldInfo.className = 'field-info';
        input.addEventListener('focus', () => {
            wrapper.dataset.active = true;
            update(wrapper, input, fieldInfo, false)
        });
        input.addEventListener('blur', () => {
            delete wrapper.dataset.active;
            update(wrapper, input, fieldInfo)
        });
        input.addEventListener('input', () => update(wrapper, input, fieldInfo));
        update(wrapper, input, fieldInfo, false);
        wrapper.append(reset, validationIcon, fieldInfo);
    });
}