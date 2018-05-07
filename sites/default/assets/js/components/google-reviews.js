/* global Vue, */
import mixins from '../components/mixins';

const VueUtils = mixins;

export default Vue.component('modal-google-reviews', {
  template: '#modal-google-reviews',
  computed: {
    activeModal() {
      return this.$store.getters.openedModal;
    },
    showReviewsModal() {
      return this.$store.getters.reviewsModal;
    },
    selectedDealer() {
      return this.$store.getters.selectedDealer;
    },
    stateAbbrev() {
      return this.$store.getters.stateAbbrev;
    },
  },
  mixins: [
    VueUtils,
  ],
  methods: {
    closeReviewModal() {
      this.$emit('close-review-modal', this.activeModal);
    },
    shortenedReviewContent(content) {
      const charsShown = 223;
      const ellipsis = '...';
      const showMore = 'More';

      // if review text is greater that character count
      // shorten it and return text as shortened content
      if (content.length > charsShown) {
        const shownContent = content.substr(0, charsShown);
        const hiddenContent = content.substr(charsShown, content.length - charsShown);

        const reviewContent = `${shownContent}<span class="review-ellipsis is-visible">${ellipsis}&nbsp;</span><span class="review-hidden-content"><span>${hiddenContent}</span><div class="review-show-more js-review-show-more">${showMore}<div></span>`;

        return reviewContent;
      }

      return content;
    },
    toggleReviews() {
      const showMore = 'More';
      const showLess = 'Less';

      document.onclick = (event) => {
        const target = event.target || event.srcElement;

        // if target is not review toggle prevent any further action
        if (!target.classList.contains('js-review-show-more')) {
          return;
        }

        // if element already toggled, remove class and return text to More
        if (target.classList.contains('less')) {
          target.classList.remove('less');
          target.innerHTML = showMore;
        } else {
          // if not toggled add class, and show text as Less
          target.classList.add('less');
          target.innerHTML = showLess;
        }

        // toggling visibility from ellipsis and review text
        target.parentNode.previousSibling.classList.toggle('is-visible');
        target.previousSibling.classList.toggle('is-visible');
      };
    },
  },
  mounted() {
    this.toggleReviews();
  },
});

