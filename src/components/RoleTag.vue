<template>
  <b-tag :class="classes" size="is-medium">{{ $translation.get('role.' + role.name.toLowerCase()) }}</b-tag>
</template>

<script>
export default {
    name: 'RoleTag',
    props: {
        role: null,
    },
    computed: {
        classes() {
            return ['role-tag', 'is-role-' + this.role.name.toLowerCase()];
        }
    },
}
</script>