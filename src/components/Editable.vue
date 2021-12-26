<template>
  <component v-if="editable"
    :is="inputType"
    v-bind="$attrs"
    v-on="$listeners"/>
  <div v-else>
    <slot :value="value"/>
  </div>
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
        editable: { default: false },
    },
    computed: {
      inputType() {
        return inputTypeLookup[this.type];
      }
    },
}
</script>