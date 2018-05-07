/* global Vuex */
/* eslint-disable no-param-reassign, import/no-named-as-default-member */
import cookies from '../modules/storages';
import types from './types/index';
import dealers from './modules/dealers';

const regexUSZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
const regexCNPostalCode = /^[A-Za-z]\d[A-Za-z]([ -]?\d[A-Za-z]\d)?$/;

export default new Vuex.Store({
  modules: {
    dealers,
  },
  state: {
    searchInput: null,
    zip: cookies.main.get(types.persisted.global.zip),
    userCity: cookies.main.get(types.persisted.global.city),
    userState: cookies.main.get(types.persisted.global.state),
    userCityStateZip: cookies.main.get(types.persisted.global.cityStateZip),
    openedModal: null,
    reviewsModal: false,
    appointmentModal: false,
  },
  getters: {
    searchInput: state => state.searchInput,
    zip: state => state.zip,
    isSearchInputZip: (state) => {
      const isUSZip = regexUSZip.test(state.searchInput);
      const isCNPostalCode = regexCNPostalCode.test(state.searchInput);

      if (isUSZip) {
        return isUSZip;
      }

      return isCNPostalCode;
    },
    userCity: state => state.userCity,
    userState: state => state.userState,
    userCityStateZip: (state, getters) => {
      if (getters.userCity && getters.userState) {
        return state.userCityStateZip;
      }

      return false;
    },
    dealerCookieKey: (state, getters) => {
      if (getters.userCity && getters.userState) {
        return `dealers${state.userCity}${state.userState}`.replace(/\s/g, '');
      } else if (getters.zip) {
        return `dealers${state.zip}`;
      }

      return false;
    },
    openedModal: state => state.openedModal,
    reviewsModal: state => state.reviewsModal,
    appointmentModal: state => state.appointmentModal,
    isSearchInputValid(state, getters) {
      if (!getters.isSearchInputZip && !getters.isUserCanadian && state.searchInput && state.searchInput.indexOf(',') !== -1) {
        return true;
      } else if (getters.isSearchInputZip) {
        return true;
      }

      return false;
    },
    isUserCanadian: (state, getters) => regexCNPostalCode.test(getters.zip),
  },
  // actions must be namespaced in actions.js folder in global object
  actions: {
    [types.actions.global.clearCityState](context) {
      context.commit(types.mutations.global.setUserCity, null);
      context.commit(types.mutations.global.setUserState, null);
      context.commit(types.mutations.global.setUserCityStateZip, null);
      cookies.main.remove(types.persisted.global.city);
      cookies.main.remove(types.persisted.global.state);
      cookies.main.remove(types.persisted.global.cityStateZip);
    },

    [types.actions.global.clearZip](context) {
      context.commit(types.mutations.global.setZip, null);
      cookies.main.remove(types.persisted.global.zip);
    },

    // getting zip and dealer array from cookies
    [types.actions.global.recall](context) {
      if (context.getters.userCity && context.getters.userState) {
        context.dispatch(types.actions.global.setUserCity, context.getters.userCity);
        context.dispatch(types.actions.global.setUserState, context.getters.userState);

        context.commit(types.mutations.global.setSearchInput, `${context.getters.userCity},${context.getters.userState}`);
      } else if (context.getters.zip) {
        context.dispatch(types.actions.global.setZip, context.getters.zip);
        context.commit(types.mutations.global.setSearchInput, `${context.getters.zip}`);
      }

      const rememberedDealers = cookies.main.get(context.getters.dealerCookieKey, { storages: ['session'] });
      context.commit(types.mutations.dealers.setList, rememberedDealers || []);

      if (rememberedDealers) {
        context.commit(types.mutations.dealers.dealersLoaded, true);
      }
    },

    // setting zip cookie
    [types.actions.global.setZip](context, payload) {
      context.commit(types.mutations.global.setZip, payload);
      cookies.main.set(types.persisted.global.zip, payload);
    },

    // setting city
    [types.actions.global.setUserCity](context, payload) {
      context.commit(types.mutations.global.setUserCity, payload);
      cookies.main.set(types.persisted.global.city, payload);
    },

    // setting state
    [types.actions.global.setUserState](context, payload) {
      context.commit(types.mutations.global.setUserState, payload);
      cookies.main.set(types.persisted.global.state, payload);
    },

    // setting zip from city/state - for FILO
    [types.actions.global.setUserCityStateZip](context, payload) {
      cookies.main.set(types.persisted.global.cityStateZip, payload);
      context.commit(types.mutations.global.setUserCityStateZip, payload);
    },
  },
  mutations: {
    // updates search input
    [types.mutations.global.setSearchInput](state, payload) {
      state.searchInput = payload;
    },

    // updates global zip value
    [types.mutations.global.setZip](state, payload) {
      state.zip = payload;
    },

    // updates city
    [types.mutations.global.setUserCity](state, payload) {
      state.userCity = payload;
    },

    // updates state
    [types.mutations.global.setUserState](state, payload) {
      state.userState = payload;
    },

    // updates zip from city/state - for FILO
    [types.mutations.global.setUserCityStateZip](state, payload) {
      state.userCityStateZip = payload;
    },

    // updates whether the reviews modal visible
    [types.mutations.global.setActiveModal](state, payload) {
      state.openedModal = payload;
    },

    // updates whether the reviews modal visible
    [types.mutations.global.showReviewsModal](state, payload) {
      state.reviewsModal = payload;
    },

    // updates whether the reviews modal visible
    [types.mutations.global.showAppointmentModal](state, payload) {
      state.appointmentModal = payload;
    },
  },
});
