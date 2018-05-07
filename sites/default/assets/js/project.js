/* global Vue, cohesion, fuse, siteConfig _Cohesion */
/* eslint-disable no-unused-vars, max-len */
import types from './store/types/index';
import store from './store/index';
import mixins from './components/mixins';
import VueFiloDefault from './components/filo-default';
import vueLocationLookup from './components/location-lookup';
import vueScheduleAppt from './components/schedule-appointment';
import vueComfortSpecialist from './components/comfort-specialist';
import vueGoogleReviews from './components/google-reviews';
import vueReviewStars from './components/review-stars';
import vueDealerLocator from './components/dealer-locator';
import bindTrackingHandlers from './modules/tracking';

const VueUtils = mixins;

cohesion('ready', () => {
  // main vue app instance
  window.TraneInfoVue = new Vue({
    store,
    el: '#app',
    data() {
      return {
        currentDealerLocator: 'dealer-locator-cards',
        currentFiloChat: 'filo-default',
        isNavOpen: false,
      };
    },
    computed: {
      filoSelectedDealer() {
        const dealers = this.$store.getters.dealersWithEmail;

        return dealers.length ? dealers[0] : null;
      },
      dealers() {
        return this.$store.getters.list;
      },
      showReviewsModal() {
        return this.$store.getters.reviewsModal;
      },
      showAppointmentModal() {
        return this.$store.getters.appointmentModal;
      },
      activeModal() {
        return this.$store.getters.openedModal;
      },
      isModalOpen() {
        return this.showReviewsModal || this.showAppointmentModal;
      },
      siteDealer() {
        return this.$store.getters.siteDealer;
      },
      sitePhone() {
        let dealerPhone = this.$store.getters.sitePhone;

        if (dealerPhone) {
          dealerPhone = this.formatPhone(this.$store.getters.sitePhone);
        }

        return dealerPhone;
      },
      allowingSiteScheduling() {
        if (this.dealers.length > 0) {
          return this.dealers[0].data.UseEmail && this.dealers[0].data.Email;
        }

        return false;
      },
      allowPrioritizedDealers() {
        return this.isPreampAssetActive('DealerLocator-PrioritizedDealers-TestAsset');
      },
    },
    watch: {
      isModalOpen(val) {
        if (val === true) {
          Vue.nextTick(() => {
            // checking if any modal is open
            let openModal;
            let refKeys = [];
            // setting refKeys array to keys inside of refs array
            // modal refs should be same name as mutation
            refKeys = Object.keys(this.$refs);

            // looping through each refkey, if corresponding ref
            // in ref object is not undefined setting openModal to refKey
            for (let i = 0; i < refKeys.length; i += 1) {
              const refKey = refKeys[i];

              if (this.$refs[refKey] !== undefined) {
                openModal = refKey;
              }
            }

            this.$store.commit(types.mutations.global.setActiveModal, openModal);
          });
        }
      },
    },
    mixins: [
      VueUtils,
    ],
    methods: {
      // allows to open modal when not inside component, pass in ref as string
      openModal(ref) {
        // picking first dealer as dealer to pass to modal
        this.$store.commit(types.mutations.dealers.setSelectedId, this.dealers[0].data.companyID);
        this.$store.commit(types.mutations.global[ref], true);
      },
      // close modal, emitted in each modal component, active modal is passed in as modal to close
      closeModal(activeModal) {
        this.$store.commit(types.mutations.global.setActiveModal, null);
        this.$store.commit(types.mutations.global[activeModal], false);
      },
      getDealerFuseNumbers(dealerIds) {
        const fuseMeta = {};
        fuseMeta.anonymousId = _Cohesion.anonymousId;
        const activeFuseRequestKey = 'hasActiveFuseRequest';
        const requests = this.dealers.filter(dealer => dealerIds.indexOf(dealer.data.companyID) > -1).map(dealer => ({
          pool: siteConfig.fusePool,
          name: dealer.data.name,
          routingGroup: dealer.fuseInfo.routingGroup,
        }));
        fuse('run', requests, fuseMeta, (err, res) => {
          res.forEach((lease) => {
            this.dealers
              .filter(dealer => dealer.fuseInfo.routingGroup === lease.routingGroup)
              .forEach((dealer) => {
                Vue.set(dealer.fuseInfo, 'dnis', lease.dnis);
              });
          });
        });
      },
      loadPrioritizedDealers() {
        if (!this.allowPrioritizedDealers) {
          return;
        }

        const prioritizedDealerEndpoint = 'https://stg.irapis.com/dealers/locations/ranks?brand=Trane&';
        this.$store.commit(types.mutations.dealers.dealerEndPointBase, prioritizedDealerEndpoint);
      },
    },
    mounted() {
      bindTrackingHandlers();
      this.loadPrioritizedDealers();
    },
  });
});
