<template>
  <b-input v-if="editable"
    v-bind="$attrs"
    v-on="$listeners"/>
  <div v-else>
    <slot :value="value"/>
    {{$attrs}}
  </div>
</template>

<script>
/**
 * A component meant to wrap a editable field.
 * The ability to edit can be toggled on/off.
 */
export default {
    name: 'Editable',
    inheritAttrs: false,
    props: {
        editable: { default: false },
    }
}
</script>