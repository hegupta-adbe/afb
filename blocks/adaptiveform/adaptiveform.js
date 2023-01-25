import ExcelToFormModel from "./libs/afb-transform.js";
import { createFormInstance, registerFunctions } from "./libs/afb-runtime.js";
import * as builder from "./libs/afb-builder.js"
import {customFunctions} from "./customization/custom-functions.js";


export class AdaptiveForm {
    model;
    #form;
    element;

     /**
   * @param {HTMLLinkElement} element
   * @param {any} formJson
   */
     constructor(element, formJson) {
        this.element = element;
        this.model = createFormInstance(formJson, undefined);
        this.model?.subscribe(() => {
          window.open("thankyou", "_self");
        }, "success")
        registerFunctions(customFunctions);
     }
 
  /**
   * @param {string} id
   */
     getModel(id)  {
         return this.model?.getElement(id);
     }

    render = async() => {
        const form = document.createElement('form');
        form.className = "cmp-adaptiveform-container cmp-container";
        this.#form = form;

        let state = this.model?.getState();
        await this.renderChildren(form, state);
        return form;
    }
  /** 
   * @param {HTMLFormElement}  form
   * @param {import("afcore").State<import("afcore").FormJson>} state
   * */  
    renderChildren = async (form, state) => {
        console.time("Rendering childrens")
        let fields = state?.items;
        if(fields && fields.length>0) {
          for(let index in fields) {
            let field = fields[index];
            let fieldModel = this.getModel(field.id);
            let element = await builder?.default?.getRender(fieldModel)
            form.append(element);
          }
        }
        console.timeEnd("Rendering childrens")
    }
 }

 /** 
  * @param {HTMLLinkElement} formLink
  * */
  let createFormContainer = async (placeholder, url) => {
    console.log("Loading & Converting excel form to Crispr Form")
    
    console.time('Json Transformation (including Get)');
    const transform = new ExcelToFormModel();
    const convertedData = await transform.getFormModel(url);
    console.timeEnd('Json Transformation (including Get)')
    console.log(convertedData);

    console.time('Form Model Instance Creation');
    let adaptiveform = new AdaptiveForm(placeholder, convertedData?.formDef);
    window.adaptiveform = adaptiveform;
    let form = await adaptiveform.render();
    placeholder?.replaceWith(form);
    
    console.timeEnd('Form Model Instance Creation');
    return adaptiveform;
  }
  
  /**
   * @param {{ querySelector: (arg0: string) => HTMLLinkElement | null; }} block
   */
  export default async function decorate(block) {
    const formLinkWrapper = block.querySelector('div.button-container:has(> a[href$=".json"]');
    const formLink = (formLinkWrapper == null ? block : formLinkWrapper).querySelector('a[href$=".json"]');

    if (!formLink || !formLink.href) {
        throw new Error("No formdata action is provided, can't render adaptiveformblock");
    }

    return await createFormContainer(formLinkWrapper || formLink, formLink.href);
  }