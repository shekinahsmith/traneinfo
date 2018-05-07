/* global Vue, */
/* eslint-disable max-len */
import types from '../store/types/index';
import mixins from '../components/mixins';

const VueUtils = mixins;

export default Vue.component('location-lookup', {
  template: '#location-lookup',
  data() {
    return {
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
    zip() {
      return this.$store.getters.zip;
    },
    city() {
      return this.$store.getters.userCity;
    },
    state() {
      return this.$store.getters.userState;
    },
    isSearchInputZip() {
      return this.$store.getters.isSearchInputZip;
    },
    isSearchInputValid() {
      return this.$store.getters.isSearchInputValid;
    },
    isSpringPromoActive() {
      return this.isPreampAssetActive('HomeHero-SpringPromotion');
    },
  },
  watch: {
    zip() {
      this.zipInput = this.zip;
    },
  },
  mixins: [
    VueUtils,
  ],
  methods: {
    updateLocation() {
      if (this.isSearchInputZip) {
        this.$store.dispatch(types.actions.global.clearCityState);
        this.$store.dispatch(types.actions.global.setZip, this.searchInput);
      } else if (!this.isSearchInputZip && this.isSearchInputValid) {
        const searchInputCity = this.searchInput.split(/[,]+/)[0].toLowerCase();
        const searchInputState = this.searchInput.split(/[,]+/)[1].toLowerCase().trim();
        this.$store.dispatch(types.actions.global.clearZip);
        this.$store.dispatch(types.actions.global.setUserCity, searchInputCity);
        this.$store.dispatch(types.actions.global.setUserState, searchInputState);
        this.$store.dispatch(types.actions.global.setUserCityStateZip, this.userCityStateZip);
      }

      if (this.isSearchInputValid) {
        window.location = this.$refs.form.getAttribute('action');
      }
    },
  },
});
