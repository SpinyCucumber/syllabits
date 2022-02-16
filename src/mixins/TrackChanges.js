import { clone } from '@/utilities'
import { Context } from '@/utilities/tracking'

/**
 * A Vue mixin that tracks how a prop changes over time
 * Creates a computed property 'transforms'
 */
export default function TrackChanges(args) {
    // Extract prop to track and options
    const { toTrack, handler, ...options } = args;
    // Coerce excludeFields into a set
    options.excludeFields = new Set(options.excludeFields);
    return ({
        data() {
            return {
                original: null,
            }
        },
        computed: {
            transforms() {
                let context = new Context('', options);
                return Array.from(handler.findTransforms(this[toTrack], this.original, context));
            },
        },
        methods: {
            /**
             * Saves the current state of the property to track,
             * and compares any future changes to the property to the current state.
             */
            makeSnapshot() {
                this.original = this[toTrack];
                this[toTrack] = clone(this[toTrack]);
            }
        }
    });
}