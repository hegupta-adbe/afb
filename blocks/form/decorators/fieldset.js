import decorateInputs from './input.js';

function update(fieldset) {
    decorateInputs(fieldset);
}

function createItem(fieldset) {
    const item = document.createElement('fieldset');
    item.innerHTML = fieldset.elements['#template'].innerHTML;
    item.append(createRemove({ Label: 'Remove', Name: fieldset.name }));
    return item;
}

function createRemove(fd) {
    const button = document.createElement('button');
    button.className = `${fd.Name}-${fd.Label} fieldset-${fd.Label}`;
    button.type = 'button';
    button.onclick = () => {
        const item = button.closest('fieldset');
        const fieldset = item.closest('fieldset[data-repeatable=true]');
        item.remove();
        update(fieldset);
    };
    return button;
}

function createAdd(fd) {
    const button = document.createElement('button');
    button.className = `${fd.Name}-${fd.Label} fieldset-${fd.Label}`;
    button.type = 'button';
    button.onclick = () => {
        const fieldset = button.closest('fieldset[data-repeatable=true]');
        const item = createItem(fieldset);
        fieldset.insertBefore(item, fieldset.elements['#add']);
        update(fieldset);
    };
    return button;
}

export default async function decorate(form) {
    [...form.querySelectorAll('fieldset[data-repeatable=true]')].forEach((fieldset) => {
        fieldset.elements['#template'] = document.createElement('div');
        fieldset.elements['#template'].innerHTML = fieldset.innerHTML;
        fieldset.elements['#add'] = createAdd({ Label: 'Add', Name: fieldset.name });
        fieldset.replaceChildren(fieldset.elements['#add']);
    });
}