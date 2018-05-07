/* global Vue, */
import mixins from '../components/mixins';

const VueUtils = mixins;

export default Vue.component('review-stars', {
  template: '#review-stars',
  props: {
    rating: {
      default: 0,
      required: true,
    },
  },
  mixins: [
    VueUtils,
  ],
});
