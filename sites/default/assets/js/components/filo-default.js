/* eslint-disable no-unused-vars */
/* global Vue, axios, _Cohesion, Filo, tagular */
import types from '../store/types/index';

// FILO is an empty template, since filo appends the html for the button to the page,
// adding the HTML for the button as the template for the component prints "[object HTMLDivElement]"
// onto the page. This is the easiest way to pass Vue data to FILO and vice versa
export default Vue.component('filo-default', {
  template: '#filo-default',
  props: {
    dealer: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      filoUserData: {
        kind: 'CONTACT_DEALER',
        brand: 'Trane',
        anonymousID: _Cohesion.anonymousId,
        instanceID: _Cohesion.webContext.instanceId,
        sessionID: _Cohesion.webContext.sessionId,
        url: window.location.href,
        companyID: null,
        fields: {
          name: null,
          zip: null,
          reason: null,
          phone: null,
          email: null,
          comments: null,
          owner: null,
        },
      },
    };
  },
  computed: {
    dealers() {
      return this.$store.getters.list;
    },
    selectedDealerId() {
      return this.dealer.data.companyID;
    },
    searchInput() {
      return this.$store.getters.searchInput;
    },
    zip() {
      return this.$store.getters.zip;
    },
    userCity() {
      return this.$store.getters.userCity;
    },
    userState() {
      return this.$store.getters.userState;
    },
    userCityStateZip() {
      return this.$store.getters.userCityStateZip;
    },
    filoZip() {
      if (this.userCity && this.userState) {
        return this.userCityStateZip;
      } else if (!this.zip && !this.userCityStateZip) {
        return this.searchInput;
      }

      return this.zip;
    },
  },
  watch: {
    filoZip(val) {
      if (val !== null && window.Filo) {
        Vue.nextTick(() => {
          window.Filo.set('zip', val);
        });
      }
    },
  },
  methods: {
    init() {
      window.filoContext = 'trane_v1';
      window.filoSettings = {
        ctaButton: {
          enabled: true,
          html: '<div class="filo-cta-button" data-filo-toggle data-filo-hide> <div class="filo-cta-button__wrapper"> <div class="filodom-notification filo-cta-button__notification" data-filodom-notification></div> <div class="filo-cta-button__icon"></div> <div class="filo-cta-button__label">Book Online</div> </div> </div>',
        },
        autopop: {
          enabled: true,
          seconds: 30,
          limit: 1,
          onIncomingMessage: true,
        },
        hide: {
          enabled: false,
        },
        notifications: {
          enabled: true,
          proactive: true,
          proactiveSeconds: 10,
        },
      };
      const el = document.createElement('script');
      el.type = 'text/javascript';
      el.src = 'https://web.filo.ai/v2/filoader.js';
      document.body.appendChild(el);

      document.addEventListener('filo:startup', () => {
        window.Filo.set('session_id', _Cohesion.webContext.sessionId);
        window.Filo.set('anonymous_id', _Cohesion.anonymousId);
      });

      this.sendFiloData();
    },
    sendFiloData() {
      const filoMessageData = {};
      document.addEventListener('filo:buttonClick', (event) => {
        let isOwner;
        let userZip;

        filoMessageData[event.detail.msgKey] = event.detail.userData;

        switch (event.detail.btnKey) {
          case 'tcpaCollected':

            // user selects repair set owner as "yes"
            if (filoMessageData.welcome_message.intent === 'repair') {
              isOwner = true;
            } else {
              isOwner = false;
            }

            // if user changes auto detected zip set zip to their entry
            if (filoMessageData.trane_zip_collection2 !== undefined) {
              userZip = filoMessageData.trane_zip_collection2.zip;
            } else {
              userZip = this.filoZip;
            }

            this.filoUserData.companyID = this.selectedDealerId;

            this.filoUserData.fields.name = `${filoMessageData.trane_name_collection.firstName} ${filoMessageData.trane_name_collection.lastName}`;
            this.filoUserData.fields.zip = userZip;
            this.filoUserData.fields.reason = filoMessageData.welcome_message.intent;
            this.filoUserData.fields.phone = filoMessageData.trane_phone_collection.phone;
            this.filoUserData.fields.email = filoMessageData.trane_phone_collection.email;
            this.filoUserData.fields.comments = filoMessageData.trane_comment_collection.comment;
            this.filoUserData.fields.owner = isOwner;

            // for testing errors in teh data above
            // console.log(this.filoUserData);

            axios({
              method: 'post',
              url: 'https://prd.irapis.com/forms/traneinfo',
              data: JSON.stringify(this.filoUserData),
            }).then((response) => {
              console.log('sent');

              // Cohesion - Tracking Sucessful Submit
              const filoFormContext = {
                formType: 'CONTACT_DEALER',
                formName: 'FILO',
                formId: 'FILO_CONTACT_DEALER_SUCCESS',
              };

              tagular('beam', 'FormSubmitted', {
                '@type': 'redventures.usertracking.v3.FormSubmitted',
                formContext: filoFormContext,
              });
            }).catch((error) => {
              console.log('fail');

              // Cohesion - Tracking Failed Submit
              const filoFormContext = {
                formType: 'CONTACT_DEALER',
                formName: 'FILO',
                formId: 'FILO_CONTACT_DEALER_FAILED',
              };

              tagular('beam', 'FormSubmitted', {
                '@type': 'redventures.usertracking.v3.FormSubmitted',
                formContext: filoFormContext,
              });
            });

            break;
          default:
            // do nothing
        }
      });
    },
    updateZipDealers(zip) {
      this.$store.dispatch(types.actions.global.clearCityState);
      this.$store.dispatch(types.actions.global.setZip, zip);
      window.Filo.set('zip', zip);
      this.$store.dispatch(types.actions.dealers.getDealerData);
    },
  },
  mounted() {
    document.addEventListener('filo:setIdAndClass', () => {
      window.Filo.set('zip', this.filoZip);
    });
    this.init();
    Vue.nextTick(() => {
      document.addEventListener('filo:buttonClick', (event) => {
        const buttonKey = event.detail.btnKey;
        const data = event.detail.userData;

        switch (buttonKey) {
          case 'zipSubmitted':
            this.updateZipDealers(data.zip);
            break;
          default:
            // do nothing
        }
      });
    });
  },
});
