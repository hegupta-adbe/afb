import ExcelToFormModel from "./libs/afb-transform.js";
import { createFormInstance, registerFunctions } from "./libs/afb-runtime.js";
import * as builder from "./libs/afb-builder.js"
import {customFunctions} from "./customization/custom-functions.js";
import { readBlockConfig } from '../../scripts/lib-franklin.js';
import { Constants } from "./libs/constants.js";
 


export class AdaptiveForm {
    model;
    #form;
    element;
    metadata;

     /**
   * @param {HTMLLinkElement} element
   * @param {any} formJson
   */
     constructor(element, formJson, metadata) {
        this.element = element;
        this.metadata = metadata;
        this.model = createFormInstance(formJson, undefined);
        this.model?.subscribe(this.submitSucess, Constants.SUBMIT_SUCCESS)
        this.model?.subscribe(this.submitFailure, Constants.SUBMIT_FAILURE)
        registerFunctions(customFunctions);
     }

    submitSucess = async() => {
      let redirect = this.metadata?.redirect || "thankyou"
      window.open(redirect, "_self");
    }

    submitFailure = async(args) => {
      console.log("Arg", args)
      alert("Submit failed")
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
  let createFormContainer = async (block, url, metadata) => {
    console.log("Loading & Converting excel form to Crispr Form")
    
    console.time('Json Transformation (including Get)');
    const transform = new ExcelToFormModel();
    const convertedData = await transform.getFormModel(url, metadata);
    console.timeEnd('Json Transformation (including Get)')
    console.log(convertedData);

    console.time('Form Model Instance Creation');
    let adaptiveform = new AdaptiveForm(block, convertedData?.formDef, metadata);
    window.adaptiveform = adaptiveform;
    let form = await adaptiveform.render();
    block.textContent = "";
    block?.append(form);
    
    console.timeEnd('Form Model Instance Creation');
    return adaptiveform;
  }
  
  /**
   * @param {{ querySelector: (arg0: string) => HTMLLinkElement | null; }} block
   */
  export default async function decorate(block) {
    const conf = readBlockConfig(block);
    const formLink = block?.querySelector('a[href$=".json"]');
    if (!formLink || !formLink.href) {
        throw new Error("json url is provided, can't render Adaptive Form ");
    }

    return await createFormContainer(block, formLink.href, conf);
  }