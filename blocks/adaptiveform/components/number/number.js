import * as builder from '../../libs/afb-builder.js';
import { getWidget, subscribe, updateValue } from '../../libs/afb-interaction.js';
import { Constants } from '../../libs/constants.js';
import { DefaultField } from '../defaultInput.js';
import NumericInputWidget from './NumberInputWidget.js';

export class NumberInput extends DefaultField {
  blockName = Constants.NUMBER;

  widgetFormatter;

  _updateValue = (element, value) => {
    if (this.widgetFormatter) {
      this.widgetFormatter.setValue(value);
    } else {
      updateValue(element, value);
    }
  };

  render() {
    this.element = builder?.default?.renderField(this.model, this.blockName);
    const widget = getWidget(this.element);
    if (this.widgetFormatter == null && (this.model.editFormat || this.model.displayFormat)) {
      this.widgetFormatter = new NumericInputWidget(widget, this.model);
    }
    this.block.appendChild(this.element);
    if (!this.widgetFormatter) {
      this.addListener();
    }
    subscribe(this.model, this.element, { value: this._updateValue });
  }
}

export default async function decorate(block, model) {
  const component = new NumberInput(block, model);
  component.render();
}
