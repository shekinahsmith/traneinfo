/* global Vue, axios */
/* eslint-disable no-unused-vars,  max-len, no-undef, no-useless-escape */
import types from '../store/types/index';
import store from '../store/index';
import mixins from '../components/mixins';
import liveAddressMap from '../modules/liveaddress.mapping';

const VueUtils = mixins;

export default Vue.component('modal-schedule-appointment', {
  template: '#modal-schedule-appointment',
  data() {
    return {
      formEndPoint: 'https://stg.irapis.com/forms',
      formData: {
        firstName: null,
        lastName: null,
        email: null,
        street: null,
        zip: null,
        phone: null,
        daySelect: null,
        apptSelect: null,
      },
      validation: {
        firstName: false,
        lastName: false,
        email: false,
        street: false,
        zip: false,
        phone: false,
        daySelect: false,
        apptSelect: false,
      },
      modalScheduleAppt: {
        id: 'customerCare',
        address1: '',
        locality: '',
        administrative_area: '',
        postal_code: '',
        country: '',
      },
      formSubmitted: false,
      formAccepted: false,
    };
  },
  computed: {
    selectedId() {
      return this.$store.getters.selectedId;
    },
    selectedDealer() {
      return this.$store.getters.selectedDealer;
    },
    showAppointmentModal() {
      return this.$store.getters.appointmentModal;
    },
    activeModal() {
      return this.$store.getters.openedModal;
    },
    allFieldsValid() {
      return this.validation.firstName && this.validation.lastName && this.validation.email && this.validation.zip && this.validation.phone;
    },
    daySelect() {
      return this.formData.daySelect;
    },
    apptSelect() {
      return this.formData.apptSelect;
    },
    axiosData() {
      return {
        kind: 'CONTACT_DEALER',
        brand: 'Trane',
        anonymousID: _Cohesion.anonymousId,
        instanceID: _Cohesion.webContext.instanceId,
        sessionID: _Cohesion.webContext.sessionId,
        companyID: this.selectedId,
        url: window.location.href.replace(window.location.hash, ''),
        fields: {
          name: `${this.formData.firstName} ${this.formData.lastName}`,
          street: this.formData.street,
          zip: this.formData.zip,
          phone: this.formData.phone,
          email: this.formData.email,
          comments: '',
          owner: true,
          desiredDay: this.formData.daySelect,
          desiredTime: this.formData.apptSelect,
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
    daySelect(val) {
      if (val) {
        this.validation.daySelect = val;
      }
    },
    apptSelect(val) {
      if (val) {
        this.validation.apptSelect = val;
      }
    },
  },
  methods: {
    initSmartyStreets() {
      this.smartyStreets = window.liveAddress;

      // because fields aren't fully visible on modal open, smarty needs to be
      // deactivated and then reactived when the modal is opened
      this.smartyStreets.deactivate(this.modalScheduleAppt.id);

      Vue.nextTick(() => {
        this.smartyStreets.activate(this.modalScheduleAppt.id);


        this.modalScheduleAppt.address1 = $('.schedule-street');
        this.modalScheduleAppt.locality = $('.schedule-locality');
        this.modalScheduleAppt.administrative_area = $('.schedule-area');
        this.modalScheduleAppt.postal_code = $('.schedule-zip');
        this.modalScheduleAppt.country = $('.schedule-country');
        liveAddressMap.mapNewAddress(this.modalScheduleAppt);

        // when user selects address, fire tracking and set zip to 5-digit zip,
        // set address to selected address
        this.smartyStreets.on('AddressAccepted', (event, data, previousHandler) => {
          if ((data.address.id() !== this.modalScheduleAppt.id) || !data.response || !data.response.chosen) {
            previousHandler(event, data);
            return;
          }

          const zip = data.response.chosen.components.zipcode;
          const address = data.response.chosen.delivery_line_1;

          this.formData.street = address;
          this.formData.zip = zip;

          previousHandler(event, data);
        });
      });
    },
    validate() {
      if (this.formData.firstName !== null) {
        this.validation.firstName = this.formData.firstName.length > 1;
      }
      if (this.formData.lastName !== null) {
        this.validation.lastName = this.formData.lastName.length > 1;
      }

      this.validation.email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.formData.email);

      this.validation.street = this.formData.street;

      this.validation.zip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(this.formData.zip);

      this.validation.phone = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/.test(this.formData.phone);
    },
    clearFields() {
      this.formData.firstName = '';
      this.formData.lastName = '';
      this.formData.email = '';
      this.formData.street = '';
      this.formData.zip = '';
      this.formData.phone = '';
      this.formData.daySelect = undefined;
      this.formData.apptSelect = undefined;
      this.validation.firstName = false;
      this.validation.lastName = false;
      this.validation.email = false;
      this.validation.street = false;
      this.validation.zip = false;
      this.validation.phone = false;
      this.validation.daySelect = false;
      this.validation.apptSelect = false;
    },
    submit() {
      axios({
        method: 'post',
        url: this.formEndPoint,
        data: this.formData,
      }).then((response) => {
        this.formSubmitted = true;
        this.formAccepted = true;
      }).catch((error) => {
        this.formSubmitted = false;
        this.formAccepted = false;
      });
    },
    closeApptModal() {
      this.$emit('close-appt-modal', this.activeModal);
    },
  },
  mounted() {
    // initializing address mapping for smarty streets
    liveAddressMap.init();
    this.initSmartyStreets();
  },
});
