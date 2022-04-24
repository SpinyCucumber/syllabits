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
        mounted() {
            const observer = new ResizeObserver(() => {
                let el = this.$refs[ref];
                this[heightProp] = el.clientHeight;
                this[widthProp] = el.clientWidth;
            });
            observer.observe(this.$refs[ref]);
        },
    }
    
}