<template>
  <b-field v-if="allowEditing" label-position="on-border" v-bind="{label}">
    <component :is="inputType"
      v-bind="{...inputOptions, value}"
      v-on="$listeners"/>
  </b-field>
  <component v-else :is="tag" :class="customClass">
    <slot v-bind="$attrs"/>
  </component>
</template>

<script>
import { BInput } from 'buefy/dist/components/input'

const inputTypeLookup = {
  'text': BInput,
}

/**
 * A component meant to wrap a editable field.
 * The ability to edit can be toggled on/off.
 */
export default {

    name: 'Editable',
    inheritAttrs: false,

    props: {
      customClass: { default: '' },
      value: { required: true },
      type: { default: 'text' },
      tag: { default: 'span' },
      inputOptions: { type: Object },
      labelKey: { type: String }, // Used to create the default field options
    },

    computed: {
      inputType() {
        return inputTypeLookup[this.type];
      },
      label() {
        return this.labelKey ? this.$translation.get('label.' + this.labelKey) : null;
      },
    },
    /**
     * Each editable component looks for nearest ancestor with the 'allowEditing' attribute,
     * and inherits it if it can. This creates a sort of "editing context" and makes uses the
     * component much cleaner. (Avoids passing props everywhere)
     */
    beforeCreate() {
      let c = this;
      while (c) {
        if (c.allowEditing !== undefined) {
          this.allowEditing = c.allowEditing;
          return;
        }
        c = c.$parent;
      }
      this.allowEditing = false;
    },

}
</script>