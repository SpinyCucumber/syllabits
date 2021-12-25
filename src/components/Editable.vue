<template>
  <b-input v-if="editable" v-bind="{value} = $attrs" v-on="{input} = $listeners"/>
  <div v-else>
    <slot/>
  </div>
</template>

<script>
/**
 * A component meant to wrap a editable field.
 * The ability to edit can be toggled on/off.
 */
export default {
    name: 'Editable',
    props: {
        value: { required: true },
        editable: { default: false },
    }
}
</script>