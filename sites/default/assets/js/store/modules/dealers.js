/* global axios */
/* eslint-disable no-param-reassign, import/no-named-as-default-member, max-len */
import cookies from '../../modules/storages';
import types from '../types/index';

export default {
  state: {
    dealerEndPointBase: 'https://prd.irapis.com/dealers/trane-info/locate?brand=TRANE&',
    dealersLoaded: false,
    list: [],
    selectedId: null,
  },
  getters: {
    dealerEndPointBase: state => state.dealerEndPointBase,
    endpointUrl: (state, getters, rootState, rootGetters) => {
      if (rootGetters.userCity && rootGetters.userState) {
        return `${getters.dealerEndPointBase}city=${rootGetters.userCity}&state=${rootGetters.userState}`;
      } else if (rootGetters.zip) {
        return `${getters.dealerEndPointBase}zipcode=${rootGetters.zip}`;
      }

      // if zip does not exist, use IP
      return `${getters.dealerEndPointBase}useip=true`;
    },
    dealersLoaded: state => state.dealersLoaded,
    list: state => state.list,
    selectedId: state => state.selectedId,
    selectedDealer: (state, getters) => {
      if (state.selectedId === null) {
        return null;
      }

      // return dealer object based on selected dealer's company ID
      return getters.list.find(dealer => dealer.data.companyID === state.selectedId);
    },

    selectedDealerIndex: (state, getters) => {
      if (state.selectedId === null) {
        return null;
      }

      // return dealer index based on company id
      return getters.list.findIndex(dealer => dealer.data.companyID === state.selectedId);
    },
    siteDealer: state => state.list[0],
    sitePhone: (state) => {
      if (state.list.length === 0) {
        return null;
      }

      return state.list[0].fuseInfo.dnis || state.list[0].fuseInfo.permaleasePhone;
    },
    dealersWithEmail: (state, getters) => getters.list.filter(dealer => dealer.data.Email),
  },
  // actions must be namespaced in actions.js folder in dealers object
  actions: {

    // set dealers list and dealer cookie
    [types.actions.dealers.setDealers](context, payload) {
      context.commit(types.mutations.dealers.setList, payload);

      if (context.rootGetters.dealerCookieKey) {
        cookies.main.set(context.rootGetters.dealerCookieKey, payload, { storages: ['session'] });
      }
    },

    // returning dealers
    [types.actions.dealers.getDealerData](context) {
      context.commit(types.mutations.dealers.dealersLoaded, false);

      if (context.rootGetters.dealerCookieKey && cookies.main.get(context.rootGetters.dealerCookieKey)) {
        context.dispatch(types.actions.global.recall);
        return;
      }

      // if cookies aren't set, get dealers from API
      try {
        axios.get(context.getters.endpointUrl).then((res) => {
          const { data } = res;

          context.commit(types.mutations.dealers.dealersLoaded, true);

          if (context.rootGetters.userCity && context.rootGetters.userState) {
            context.commit(types.mutations.global.setZip, null);
            cookies.main.remove(types.persisted.global.zip);

            context.dispatch(types.actions.global.setUserCityStateZip, data.zipcode);
            context.dispatch(types.actions.global.setUserCity, data.city);
            context.dispatch(types.actions.global.setUserState, data.state);

            context.commit(types.mutations.global.setSearchInput, `${data.city}, ${data.state}`);
          } else if (context.rootGetters.zip) {
            context.commit(types.mutations.global.setUserCity, null);
            context.commit(types.mutations.global.setUserState, null);
            context.commit(types.mutations.global.setUserCityStateZip, null);
            cookies.main.remove(types.persisted.global.city);
            cookies.main.remove(types.persisted.global.state);

            context.commit(types.mutations.global.setSearchInput, data.zipcode);
            context.dispatch(types.actions.global.setZip, data.zipcode);
          }
          context.commit(types.mutations.global.setSearchInput, data.zipcode);
          context.dispatch(types.actions.dealers.setDealers, data.dealers);
        });
      } catch (err) {
        context.commit(types.mutations.dealers.dealersLoaded, true);
        throw err;
      }
    },

  },
  mutations: {
    // update dealer endpoint
    [types.mutations.dealers.dealerEndPointBase](state, payload) {
      state.dealerEndPointBase = payload;
    },

    // are dealer loaded, true/false
    [types.mutations.dealers.dealersLoaded](state, payload) {
      state.dealersLoaded = payload;
    },

    // allows dealer list to be updated
    [types.mutations.dealers.setList](state, payload) {
      state.list = payload;
    },

    // allows selected dealer to be updated
    [types.mutations.dealers.setSelectedId](state, payload) {
      state.selectedId = payload;
    },
  },
};
