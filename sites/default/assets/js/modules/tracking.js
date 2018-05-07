/* globals window, tagular */
/* eslint arrow-body-style: ["error", "always"] */

// Function to uppercase object values
export const uppercaseValues = (object) => {
  return Object.keys(object).reduce((currObj, nextVal) => {
    if (object[nextVal]) {
      currObj[nextVal] = object[nextVal].toUpperCase(); // eslint-disable-line no-param-reassign
    }

    return currObj;
  }, {});
};

// Function to send events
export const sendEvent = (event, additionalParams) => {
  if (window.logTagularBeam) {
    console.log(`%c${JSON.stringify(additionalParams, null, 2)}`, 'color: #ff3d7f'); // oh yeah, hot pink text for visibility
  }

  tagular('beam', event, additionalParams);
};

// Function to set up event handlers
export const setupEventHandler = (eventName, selector, handler) => {
  document.addEventListener(eventName, (event) => {
    const el = event.target.closest(selector);

    if (el) {
      return handler(event, el);
    }

    return false;
  });
};

// Function to set up DOMContentLoaded event handlers
export const setupEventHandlerLoad = (eventName, selector, handler) => {
  document.addEventListener(eventName, (event) => {
    const elementList = document.querySelectorAll(selector);

    if (elementList.length) {
      elementList.forEach((el) => {
        handler(event, el);
      });

      return true;
    }

    return false;
  });
};

// The form that was viewed by the user
export const handleViewed = (event, element, action) => {
  const self = element;

  const webElement = {
    location: self.dataset.analyticsLocation || null,
    position: self.dataset.analyticsPosition || null,
    elementType: self.dataset.analyticsType || null,
    text: self.dataset.analyticsText || null,
    htmlId: self.dataset.analyticsHtmlid || null,
  };

  const actionOutcome = self.dataset.analyticsOutcome || null;

  sendEvent(action, {
    '@type': `redventures.usertracking.v3.${action}`,
    webElement: uppercaseValues(webElement),
    actionOutcome,
  });
};

// Event handler for when a field is changed or a selection is changed
export const handleFieldInput = (event, action) => {
  const self = event.target;

  const userFieldInputted = {
    fieldType: self.dataset.analyticsType,
    fieldName: self.dataset.analyticsName,
    fieldId: (self.dataset.analyticsId) || (self.getAttribute('id')),
    fieldValue: (self.dataset.analyticsValue) || (self.value),
    fieldLabel: (self.dataset.analyticsLabel) || null,
    fieldLocation: (self.dataset.analyticsLocation) || null,
  };

  const formContext = {
    formType: self.dataset.analyticsType,
    formName: self.dataset.analyticsName,
    formId: (self.dataset.analyticsId) || (self.getAttribute('id')),
  };

  sendEvent(action, {
    '@type': `redventures.usertracking.v3.${action}`,
    userInputField: uppercaseValues(userFieldInputted),
    formContext: uppercaseValues(formContext),
  });
};

export default () => {
  // Click tracking
  setupEventHandler('click', '[data-analytics-element-clicked]', (event, self) => {
    const webElement = {
      location: self.dataset.analyticsLocation || null,
      position: self.dataset.analyticsPosition || null,
      elementType: self.dataset.analyticsType || null,
      text: self.dataset.analyticsText || null,
      htmlId: self.dataset.analyticsHtmlid || null,
    };

    const actionOutcome = self.dataset.analyticsOutcome || null;

    sendEvent('ElementClicked', {
      '@type': 'redventures.usertracking.v3.ElementClicked',
      webElement: uppercaseValues(webElement),
      actionOutcome,
    });
  });

  setupEventHandler('change', '[data-analytics-field-inputted]', (ev) => {
    handleFieldInput(ev, 'FieldInputted');
  });

  setupEventHandler('change', '[data-analytics-field-selected]', (ev) => {
    handleFieldInput(ev, 'FieldSelected');
  });

  setupEventHandler('submit', '[data-analytics-form-submitted]', (ev) => {
    handleFieldInput(ev, 'FieldSelected');
  });

  setupEventHandler('submit', '[data-analytics-form-submitted]', (ev) => {
    handleFieldInput(ev, 'FormSubmitted');
  });

  setupEventHandlerLoad('DOMContentLoaded', '[data-analytics-form-viewed].slick-active', (ev, el) => {
    handleViewed(ev, el, 'FormViewed');
  });

  setupEventHandlerLoad('change', '[data-analytics-form-viewed].dealer-locator__service-area-form', (ev, el) => {
    handleViewed(ev, el, 'FormViewed');
  });
};
