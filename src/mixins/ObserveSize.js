export default function(options) {

    let { ref } = options;
    let heightProp = ref + 'Height', widthProp = ref + 'Width';

    return {
        data() {
            return {
                [heightProp]: undefined,
                [widthProp]: undefined,
            }
        },
        methods: {
            updateSize() {
                let el = this.$refs[ref];
                this[heightProp] = el?.clientHeight;
                this[widthProp] = el?.clientWidth;
            }
        },
        mounted() {
            const observer = new ResizeObserver(this.updateSize);
            this.$nextTick(() => {
                this.updateSize();
                observer.observe(this.$refs[ref]);
            })
        },
    }
    
}