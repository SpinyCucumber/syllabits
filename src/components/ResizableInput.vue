<template>
    <div
        class="control"
        :class="rootClasses">
        <input
            ref="input"
            class="input is-resizable"
            v-autowidth="{minWidth: '5em'}"
            :class="[inputClasses, customClass]"
            :type="newType"
            :autocomplete="newAutocomplete"
            :maxlength="maxlength"
            :value="computedValue"
            v-bind="$attrs"
            @input="onInput"
            @change="onChange"
            @blur="onBlur"
            @focus="onFocus">
    </div>
</template>

<script>
import config from 'buefy/src/utils/config'
import FormElementMixin from 'buefy/src/utils/FormElementMixin'
import VueInputAutowidth from 'vue-input-autowidth'

export default {
    name: 'BInput',
    mixins: [FormElementMixin],
    directives: {autowidth: VueInputAutowidth},
    inheritAttrs: false,
    props: {
        value: [Number, String],
        type: {
            type: String,
            default: 'text'
        },
        lazy: {
            type: Boolean,
            default: false
        },
        passwordReveal: Boolean,
        customClass: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            newValue: this.value,
            newType: this.type,
            newAutocomplete: this.autocomplete || config.defaultInputAutocomplete,
            isPasswordVisible: false,
            _elementRef: 'input',
        }
    },
    computed: {
        computedValue: {
            get() {
                return this.newValue
            },
            set(value) {
                this.newValue = value
                this.$emit('input', value)
            }
        },
        rootClasses() {
            return [
                this.iconPosition,
                this.size,
                {
                    'is-expanded': this.expanded,
                    'is-loading': this.loading,
                    'is-clearfix': !this.hasMessage
                }
            ]
        },
        inputClasses() {
            return [
                this.statusType,
                this.size,
                { 'is-rounded': this.rounded }
            ]
        },

        /**
        * Check if have any message prop from parent if it's a Field.
        */
        hasMessage() {
            return !!this.statusMessage
        },

        /**
        * Current password-reveal icon name.
        */
        passwordVisibleIcon() {
            return !this.isPasswordVisible ? 'eye' : 'eye-off'
        },
        /**
        * Get value length
        */
        valueLength() {
            if (typeof this.computedValue === 'string') {
                return this.computedValue.length
            } else if (typeof this.computedValue === 'number') {
                return this.computedValue.toString().length
            }
            return 0
        }
    },
    watch: {
        /**
        * When v-model is changed:
        *   1. Set internal value.
        */
        value(value) {
            this.newValue = value
        }
    },
    methods: {
        /**
        * Toggle the visibility of a password-reveal input
        * by changing the type and focus the input right away.
        */
        togglePasswordVisibility() {
            this.isPasswordVisible = !this.isPasswordVisible
            this.newType = this.isPasswordVisible ? 'text' : 'password'

            this.$nextTick(() => {
                this.focus()
            })
        },

        onInput(event) {
            if (!this.lazy) {
                const value = event.target.value
                this.updateValue(value)
            }
        },

        onChange(event) {
            if (this.lazy) {
                const value = event.target.value
                this.updateValue(value)
            }
        },

        updateValue(value) {
            this.computedValue = value
            !this.isValid && this.checkHtml5Validity()
        }
    }
}
</script>
