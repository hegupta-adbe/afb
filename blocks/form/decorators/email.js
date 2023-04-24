function validateEmail(email, confirmEmail, confirmEmailWrapper) {
    if(!confirmEmail.validationMessage || confirmEmail.value) {
        if(email.value !== confirmEmail.value) {
            const fieldInfo = confirmEmailWrapper.querySelector('.field-info');
            confirmEmail.setCustomValidity('Value must match Email.');
            const info = '<span>' + confirmEmail.value.length + ' / ' + confirmEmail.max + '</span>';
            fieldInfo.innerHTML = confirmEmail.validationMessage + info;
        }
        confirmEmailWrapper.dataset.valid = confirmEmail.validity.valid;
    }
}

export default async function decorate(form) {
    const email = form.querySelector('input[name=emailAddress]');
    const confirmEmailWrapper = form.querySelector('.form-emailAddressconfirmation');
    const confirmEmail = confirmEmailWrapper.querySelector('input');
    confirmEmail.addEventListener('blur', () => validateEmail(email, confirmEmail, confirmEmailWrapper));
    email.addEventListener('blur', () => validateEmail(email, confirmEmail, confirmEmailWrapper));
    confirmEmail.addEventListener('input', () => {
        if(!confirmEmail.validationMessage) {
            delete confirmEmailWrapper.dataset.valid
        }
    });
}