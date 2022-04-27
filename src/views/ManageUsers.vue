<template>
    <navbar-view class="manage-users-view">
        <Table/>
    </navbar-view>
</template>

<script>
import NavbarView from './NavbarView'
import { Table } from '@/components'

export default {
    name: 'ManageUsers',
    components: { NavbarView, Table },
}
</script>