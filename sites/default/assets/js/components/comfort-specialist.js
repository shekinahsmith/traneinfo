/* global Vue, axios */
/* eslint-disable no-unused-vars,  max-len, no-undef, no-useless-escape */
import types from '../store/types/index';
import store from '../store/index';
import mixins from '../components/mixins';
import liveAddressMap from '../modules/liveaddress.mapping';

const VueUtils = mixins;

export default Vue.component('comfort-specialist', {
  template: '#comfort-specialist',
  data() {
    return {
      errors: [],
      formEndPoint: 'https://api-goes-here.com',
      comfortSpecialist: {},
      formData: {
        dealername: null,
        fname: null,
        lname: null,
        email: null,
        phone: null,
        addr: null,
        city: null,
        zipcode: null,
        stateSelect: null,
      },
      validation: {
        dealername: false,
        fname: false,
        lname: false,
        email: false,
        phone: false,
        addr: false,
        city: false,
        zipcode: false,
        stateSelect: false,
      },
      formSubmitted: false,
      formAccepted: false,
    };
  },
  computed: {
    selectedId() {
      return this.$store.getters.selectedId;
    },
    allFieldsValid() {
      return this.validation.dealername && this.validation.fname && this.validation.lname && this.validation.email && this.validation.phone && this.validation.zipcode;
    },
    stateSelect() {
      return this.formData.stateSelect;
    },
    axiosData() {
      return {
        kind: 'NEW_DEALER',
        brand: 'Trane',
        anonymousID: _Cohesion.anonymousId,
        instanceID: _Cohesion.webContext.instanceId,
        sessionID: _Cohesion.webContext.sessionId,
        url: window.location.href.replace(window.location.hash, ''),
        fields: {
          dealer_name: this.formData.dealername,
          firstName: this.formData.fname,
          lastName: this.formData.lname,
          email: this.formData.email,
          phone: this.formData.phone,
          addressLine1: this.formData.addr,
          city: this.formData.city,
          zip: this.formData.zipcode,
          state: this.formData.stateSelect,
        },
      };
    },
    formSubmittedSuccess() {
      return this.formSubmitted && this.formAccepted;
    },
  },
  mixins: [
    VueUtils,
  ],
  watch: {
    axiosData() {
      this.validate();
    },
    stateSelect(val) {
      if (val) {
        this.validation.stateSelect = val;
      }
    },
  },
  methods: {
    initSmartyStreets() {
      this.comfortSpecialist = {
        id: 'comfortSpecialist',
        address1: '',
        locality: '',
        administrative_area: '',
        postal_code: '',
        country: '',
      };

      this.smartyStreets = window.liveAddress;

      Vue.nextTick(() => {
        this.comfortSpecialist.address1 = $('.cs-street');
        this.comfortSpecialist.locality = $('.cs-locality');
        this.comfortSpecialist.administrative_area = $('.cs-area');
        this.comfortSpecialist.postal_code = $('.cs-zip');
        this.comfortSpecialist.country = $('.cs-country');
        liveAddressMap.mapNewAddress(this.comfortSpecialist);

        this.smartyStreets.on('AddressAccepted', (event, data, previousHandler) => {
          if ((data.address.id() !== this.comfortSpecialist.id) || !data.response || !data.response.chosen) {
            previousHandler(event, data);
            return;
          }

          const address = data.response.chosen.delivery_line_1;
          const city = data.response.chosen.components.city_name;
          const state = data.response.chosen.components.state_abbreviation;
          const zip = data.response.chosen.components.zipcode;

          this.formData.addr = address;
          this.formData.city = city;
          this.formData.zipcode = zip;
          this.formData.stateSelect = state;

          previousHandler(event, data);
        });
      });
    },
    stringVal(str, num) {
      let ret;
      if (str !== null) {
        ret = str.length > num;
      }
      return ret;
    },
    validate() {
      this.validation.dealername = this.stringVal(this.formData.dealername, 1);
      this.validation.fname = this.stringVal(this.formData.fname, 1);
      this.validation.lname = this.stringVal(this.formData.lname, 1);
      this.validation.email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.formData.email);
      this.validation.addr = this.formData.addr;
      this.validation.city = this.formData.city;
      this.validation.zipcode = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(this.formData.zipcode);
      this.validation.phone = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/.test(this.formData.phone);
    },
    clearFields() {
      this.formData.dealername = '';
      this.formData.fname = '';
      this.formData.lname = '';
      this.formData.email = '';
      this.formData.phone = '';
      this.formData.addr = '';
      this.formData.city = '';
      this.formData.zipcode = '';
      this.formData.stateSelect = undefined;
      this.validation.dealername = false;
      this.validation.fname = false;
      this.validation.lname = false;
      this.validation.email = false;
      this.validation.phone = false;
      this.validation.addr = false;
      this.validation.city = false;
      this.validation.zipcode = false;
      this.validation.stateSelect = false;
    },
    submit() {
      axios({
        method: 'post',
        url: this.formEndPoint,
        data: this.axiosData,
      }).then((response) => {
        this.formSubmitted = true;
        this.formAccepted = true;
      }).catch((error) => {
        this.formSubmitted = false;
        this.formAccepted = false;
      });
    },
  },
  mounted() {
    liveAddressMap.init();
    this.initSmartyStreets();
  },
});
