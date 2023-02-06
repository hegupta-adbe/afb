import * as builder from "../../libs/afb-builder.js";
import {
  getWidget as getAfbInteractWidget,
  subscribe
} from "../../libs/afb-interaction.js";
import { Constants } from "../../libs/constants.js";
import { DefaultField } from "../defaultInput.js";
import DatePickerWidget from "./DatePickerWidget.js";

export class DatePicker extends DefaultField {
  blockName = Constants.DATE_PICKER;

  widgetFormatter;

  updateValue(value) {
    if (this.widgetFormatter) {
      if (this.isActive()) {
        this.widgetFormatter.setValue(value);
      } else {
        this.widgetFormatter.setDisplayValue(value);
      }
    } else {
      super.updateValue(value);
    }
  }

  render() {
    this.element = builder?.default?.renderField(this.model, this.blockName);
    const widget = getAfbInteractWidget(this.element);
    if (
      this.widgetFormatter == null &&
      (this.model.editFormat || this.model.displayFormat)
    ) 
    {
      this.widgetFormatter = new DatePickerWidget(this, widget, this.model);
    }
    this.block.appendChild(this.element);
    if (!this.widgetFormatter) {
      this.addListener();
    }
    // eslint-disable-next-line no-underscore-dangle
    subscribe(this.model, this.element, { value: this.updateValue });
  }

  getWidget() {
    return getAfbInteractWidget(this.element);
  }



}

export default async function decorate(block, model) {
  const component = new DatePicker(block, model);
  component.render();
}
