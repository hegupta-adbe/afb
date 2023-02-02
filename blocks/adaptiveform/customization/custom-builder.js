import * as builder from "../libs/afb-builder.js";
import { createLabel as cl, defaultInputRender as di } from '../libs/default-builder.js';

/**
 * Example of overriding to inlcude start
 * @param {*} state 
 * @param {*} bemBlock 
 * @returns 
 */
export const createLabel = (state, bemBlock) => {
    const label = cl(state, bemBlock)
    if(label) {
        label.textContent = state?.required  && state?.fieldType !== "select"  ? label?.textContent + " *" : label?.textContent;
        return label;
    }
}

export const createTickIcon = (bemBlock) => {
    let span = document.createElement('span');
    span.className = 'material-symbols-outlined input-icons input-done-icon';
    span.textContent = 'done';
    return span;
}

export const createCloseIcon = (bemBlock) => {
    let span = document.createElement('span');
    span.className = 'material-symbols-outlined input-icons input-close-icon';
    span.textContent = 'close';
    span.addEventListener('click', (event) => {
        event.target.parentElement.getElementsByClassName("cmp-adaptiveform-textinput__widget")[0].value = ''
        event.target.parentElement.getElementsByClassName("cmp-adaptiveform-textinput__widget")[0].dispatchEvent(new Event('input'));
    })
    return span;
}

export const createErrorIcon = (bemBlock) => {
    let span = document.createElement('span');
    span.className = 'material-symbols-outlined input-icons input-error-icon';
    span.textContent = 'error';
    return span;
}

export const createCounterSpan = (bemBlock) => {
    let span = document.createElement('span');
    span.className = "input_counter_span";
    return span;
}

export let renderField = (model, bemBlock, renderInput) => {
    renderInput = renderInput || builder?.default?.defaultInputRender;
    let state = model?.getState();

    let element = builder?.default?.createWidgetWrapper(state, bemBlock);
    let inputs = renderInput(state, bemBlock);
    let label = builder?.default?.createLabel(state, bemBlock);
    let longDesc = builder?.default?.createLongDescHTML(state, bemBlock);
    let help = builder?.default?.createQuestionMarkHTML(state, bemBlock);
    let error = builder?.default?.createErrorHTML(state, bemBlock);
    let closeIcon  = builder?.default?.createCloseIcon(bemBlock);
    let tickIcon  = builder?.default?.createTickIcon(bemBlock);
    let errorIcon  = builder?.default?.createErrorIcon(bemBlock);
    let counterSpan  = builder?.default?.createCounterSpan(bemBlock);
    let maxValue = state?.maxLength;
    counterSpan.textContent = `0 / ${maxValue}`;
    inputs ? element.appendChild(inputs) : null;
    if ( state?.fieldType !== 'select') {
        inputs.addEventListener('input', (event) => {   
            let inputValue = event.target.value;
            if ( inputValue.length === 0) {
                event.target.classList.remove("input_with_value");
            }  else {
                event.target.classList.add("input_with_value");
            }
            if ( inputValue.length > maxValue) {
                event.target.classList.add("input_with_max_value");
            } else {
                event.target.classList.remove("input_with_max_value");
            }

            counterSpan.textContent = `${inputValue.length} / ${maxValue}`;
        });
        // closeIcon ? element.appendChild(closeIcon) : null;
        // tickIcon ? element.appendChild(tickIcon) : null;
        // errorIcon ? element.appendChild(errorIcon) : null;
    }
    label ? element.appendChild(label) : null;
    longDesc ?  element.appendChild(longDesc) : null;
    help ? element.appendChild(help) : null;
    error? element.appendChild(error): null;
    counterSpan && state?.fieldType !== 'select' && state?.maxLength != undefined ? element.appendChild(counterSpan): null;
    return element;
}


/**
 * @param {any} state FieldJson
 * @param {string} bemBlock 
 * 
 * @return {HTMLInputElement}
 */
export let defaultInputRender = (state, bemBlock, tag = "input") => {
   const defaultInput = di(state, bemBlock, tag);
   defaultInput.addEventListener('focus', (e) => {
     e.target
   })
   return defaultInput;
}