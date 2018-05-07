/* global _Preamp */

/* eslint-disable no-unused-vars */

export default {
  methods: {
    formatNumDecimal(num) {
      return (num % 1 === 0) ? `${num}.0` : num;
    },
    formatPhone(phone) {
      return `1-${phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}`;
    },
    formatCity(city) {
      const str = city.toLowerCase().split(' ');
      for (let i = 0; i < str.length; i += 1) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
      }

      return str.join(' ');
    },
    formatCityState(cityState) {
      if (cityState) {
        const str = cityState.split(/[,]+/);

        str[0] = str[0].charAt(0).toUpperCase() + str[0].slice(1);
        str[1] = typeof str[1] === 'string' ? str[1].toUpperCase() : str[1];

        return str.join(', ');
      }

      return false;
    },
    isPreampAssetActive(assetName) {
      if (_Preamp && _Preamp.actions && _Preamp.actions.placements) {
        const matchingAssets = _Preamp.actions.placements.filter(placement =>
          placement.assetName === assetName && placement.success === true);
        return matchingAssets.length > 0;
      }
      return false;
    },
  },
};
