/* global $ */
// Live Address Config and Mapping
//
// Documentation: https://smartystreets.com/docs/plugins/website
// Used in the Vue Schedule Service
// --------------------------------------------------------------
export default {
  init() {
    window.liveAddressMappings = [
      {
        id: 'resident', // IDs are optional, but can be helpful
        freeform: '#schedule-address',
        country: '#country',
      },
    ];
    window.liveAddress = $.LiveAddress({
      key: 'smartystreetskey',
      autocomplete: 3,
      autoVerify: true,
      waitForStreet: true,
      submitVerify: true,
      debug: false, // set true for helpful error and event logging
      submitSelector: '[type=image]',
      invalidMessage: 'You entered an unknown address (be sure to include your zip code):',
      addresses: window.liveAddressMappings,
    });
    this.mapNewAddress();
  },
  mapNewAddress(mapping) {
    if (mapping) {
      window.liveAddressMappings.push(mapping);
    }

    window.liveAddress.mapFields(window.liveAddressMappings);
  },
};
