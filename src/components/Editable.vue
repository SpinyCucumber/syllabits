<template>
  <component v-if="editable"
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
    beforeCreate() {
      let c = this;
      while (c) {
        if (c.allowEditing !== undefined) {
          this.editable = c.allowEditing;
          return;
        }
        c = c.$parent;
      }
      this.editable = false;
    },
}
</script>