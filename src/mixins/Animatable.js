function getClass(animation) {
    return `${animation}-active`;
}

export default {

    data() {
        return {
            currentAnimation: null,
        }
    },

    mounted() {
        this.$el.addEventListener('animationend', this.onAnimationEnd);
    },

    methods: {

        animate(animation) {
            this.currentAnimation = animation;
        },

        onAnimationEnd() {
            this.currentAnimation = null;
        }
    
    },

    watch: {
        currentAnimation(newVal, oldVal) {
            if (oldVal != null) this.$el.classList.remove(getClass(oldVal));
            if (newVal != null) this.$el.classList.add(getClass(newVal));
        }
    }

}