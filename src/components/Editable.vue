<template>
  <component v-if="allowEditing"
    :is="inputType"
    v-bind="$attrs"
    v-on="$listeners"/>
  <component v-else :is="tag">
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
        type: { default: 'text' },
        tag: { default: 'span' },
    },

    computed: {
      inputType() {
        return inputTypeLookup[this.type];
      }
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