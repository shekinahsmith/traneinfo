/* global Vue, $, tagular */
/* eslint-disable max-len */
import types from '../store/types/index';
import mixins from '../components/mixins';
import { handleViewed } from '../modules/tracking';

const VueUtils = mixins;

export default Vue.component('dealer-locator-cards', {
  template: '#dealer-locator-cards',
  data() {
    return {
      slider: null,
      maxDealers: null,
    };
  },
  computed: {
    searchInput: {
      get() {
        if (!this.isSearchInputZip && this.isSearchInputValid) {
          return this.formatCityState(this.$store.getters.searchInput);
        } else if (this.isSearchInputZip) {
          return this.$store.getters.searchInput;
        }
        return this.$store.getters.searchInput;
      },
      set(val) {
        this.$store.commit(types.mutations.global.setSearchInput, val);
      },
    },
    isSearchInputValid() {
      return this.$store.getters.isSearchInputValid;
    },
    isUserCanadian() {
      return this.$store.getters.isUserCanadian;
    },
    zip() {
      return this.$store.getters.zip;
    },
    city() {
      return this.$store.getters.userCity;
    },
    state() {
      return this.$store.getters.userState;
    },
    userCityStateZip() {
      return this.$store.getters.userCityStateZip;
    },
    dealersLoaded() {
      return this.$store.getters.dealersLoaded;
    },
    dealers() {
      return this.$store.getters.list;
    },
    stateAbbrev() {
      return this.$store.getters.stateAbbrev;
    },
    reviewsModal() {
      return this.$store.getters.reviewsModal;
    },
    isSearchInputZip() {
      return this.$store.getters.isSearchInputZip;
    },
    limitedDealers() {
      // if max dealers has value, limit dealers by that value
      if (this.maxDealers) {
        return this.dealers.slice(0, this.maxDealers);
      }
      return this.dealers;
    },
    noDealersLoaded() {
      return this.dealersLoaded && this.dealers.length === 0;
    },
    noDealerLocationText() {
      if (!this.isSearchInputZip && this.isSearchInputValid) {
        return this.formatCityState(this.$store.getters.searchInput);
      } else if (this.isSearchInputZip) {
        return this.$store.getters.searchInput;
      }
      return this.$store.getters.searchInput;
    },
  },
  watch: {
    dealers(val) {
      // once dealers loaded, init slick and update max dealers
      if (val) {
        this.slickInit();
        this.setMaxDealers();
        this.noDealersTracking();
      }
    },
  },
  mixins: [
    VueUtils,
  ],
  methods: {
    loadDealers() {
      this.$store.dispatch(types.actions.dealers.getDealerData);
    },
    noDealersTracking() {
      if (!this.noDealersLoaded) {
        return;
      }

      tagular('beam', 'ElementViewed', {
        '@type': 'redventures.usertracking.v3.ElementViewed',
        webElement: {
          location: 'List',
          position: 'Dealer Locator',
          elementType: 'US - No Dealers Found',
          text: this.zip ? this.zip : this.userCityStateZip,
        },
      });
    },
    slickInit() {
      if (this.slider) {
        this.slider.slick('unslick');
        this.slider = null;
      }

      Vue.nextTick(() => {
        this.slider = $(this.$el).find('.js-dealer-slider').not('.slick-initialized').slick({
          arrows: true,
          prevArrow: '<button class="slick-prev dealer-locator__prev" data-analytics-element-clicked="" data-analytics-type="ARROW" data-analytics-location="SLIDER" data-analytics-position="" data-analytics-text="LEFT" data-analytics-outcome="SLIDE"><i class="ss-navigateleft"></i></button>',
          nextArrow: '<button class="slick-next dealer-locator__next" data-analytics-element-clicked="" data-analytics-type="ARROW" data-analytics-location="SLIDER" data-analytics-position="" data-analytics-text="RIGHT" data-analytics-outcome="SLIDE"><i class="ss-navigateright"></i></button>',
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: false,
          responsive: [
            {
              breakpoint: 1024,
              settings: {
                arrows: true,
                slidesToShow: 3,
                slidesToScroll: 3,
                infinite: false,
              },
            },
            {
              breakpoint: 1023,
              settings: {
                arrows: false,
                slidesToShow: 1.2,
                slidesToScroll: 1,
                infinite: false,
              },
            },
            {
              breakpoint: 639,
              settings: 'unslick',
            },
          ],
        });

        this.slickAfterChange();
      });
    },
    slickAfterChange() {
      this.slider.on('afterChange', (currentSlide) => {
        if (currentSlide) {
          const elementList = document.querySelectorAll('[data-analytics-form-viewed].slick-active');

          if (elementList.length) {
            elementList.forEach((el) => {
              handleViewed(elementList, el, 'ElementViewed');
            });
          }
        }
      });
    },
    updateZipDealers() {
      if (this.isSearchInputZip) {
        this.$store.dispatch(types.actions.global.clearCityState);
        this.$store.dispatch(types.actions.global.setZip, this.searchInput.replace(/\s+/g, ''));
      } else if (!this.isSearchInputZip && !this.isUserCanadian && this.isSearchInputValid) {
        const searchInputCity = this.searchInput.split(/[,]+/)[0].toLowerCase();
        const searchInputState = this.searchInput.split(/[,]+/)[1].toLowerCase().trim();
        this.$store.dispatch(types.actions.global.clearZip);
        this.$store.dispatch(types.actions.global.setUserCity, searchInputCity);
        this.$store.dispatch(types.actions.global.setUserState, searchInputState);
        this.$store.dispatch(types.actions.global.setUserCityStateZip, this.userCityStateZip);
      }

      if (this.isSearchInputValid) {
        this.loadDealers();
      }
    },
    setMaxDealers() {
      const windowWidth = window.innerWidth;

      // on mount, checking window width and limiting dealers for mobile
      if (windowWidth <= 640) {
        this.maxDealers = 3;
        return;
      }
      this.maxDealers = null;
    },
    checkWindowWidth() {
      let timeOut = null;
      let windowWidth = null;

      // on window resize, check window width and adjust maxDealers visible
      window.addEventListener('resize', () => {
        clearTimeout(timeOut);
        windowWidth = window.innerWidth;

        timeOut = setTimeout(() => {
          windowWidth = window.innerWidth;
          this.setMaxDealers();

          // on non-mobile screen reinit slick
          if (windowWidth > 640) {
            this.slickInit();
          }
        }, 100);
      });
    },
    toggleMoreDealers() {
      this.maxDealers += 3;
    },
    showDealerCertifications(dealer) {
      const {
        nateCertified, dealerType, displaySupport, financeURL,
      } = dealer.data;
      return nateCertified || (dealerType !== 'NON-TCS') || displaySupport || financeURL;
    },
    showCertificationsModal(dealer) {
      const dealerIndex = this.dealers.indexOf(dealer);
      const modal = document.querySelector(`.modal--dealer-certifications-${dealerIndex}`);

      const windowWidth = window.innerWidth;
      if (windowWidth > 640) {
        return;
      }

      if (modal) {
        modal.classList.toggle('is-toggled');
      }
    },
    closeCertificationsModal() {
      const openModal = document.querySelector('.modal--dealer-certifications.is-toggled');

      openModal.classList.toggle('is-toggled');
    },
    dealerIndex(dealer) {
      return this.dealers.indexOf(dealer);
    },
    setSelectedDealer(dealer) {
      this.$store.commit(types.mutations.dealers.setSelectedId, dealer.data.companyID);
    },
    openGoogleReviewsModal(dealer) {
      this.setSelectedDealer(dealer);
      this.$store.commit(types.mutations.global.showReviewsModal, true);
    },
    openScheduleModal(dealer) {
      this.setSelectedDealer(dealer);
      this.$store.commit(types.mutations.global.showAppointmentModal, true);
    },
    allowScheduling(dealer) {
      return dealer.data.UseEmail && dealer.data.Email;
    },
  },
  mounted() {
    this.loadDealers();
    this.checkWindowWidth();
  },
});

