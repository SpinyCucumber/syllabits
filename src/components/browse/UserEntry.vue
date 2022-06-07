<template>
    <tr class="user-entry">
        <td><span>{{ entry.email }}</span></td>
        <td class="column-grow"><RoleTag :role="role" v-if="showRole"/></td>
        <td class="column-shrink">
            <b-dropdown position="is-bottom-left">
                <template #trigger>
                    <b-button class="borderless" icon-left="dots-horizontal"/>
                </template>
                <b-dropdown-item @click="changeRole">
                    {{ $translation.get('button.user.changerole') }}
                </b-dropdown-item>
                <b-dropdown-item @click="confirmDelete" class="has-text-danger">
                    {{ $translation.get('button.user.delete') }}
                </b-dropdown-item>
            </b-dropdown>
        </td>
    </tr>
</template>

<script>
import { DeleteUser } from '@/queries'
import { Constants } from '@/services'
import { RoleTag, ChangeRole } from '@/components'

const { Role } = Constants;

export default {

    props: { entry: Object },
    components: { RoleTag },

    methods: {

        changeRole() {
            this.$buefy.modal.open({
                parent: this,
                component: ChangeRole,
                hasModalCard: true,
                props: { user: this.entry },
                trapFocus: true,
            })
        },

        async confirmDelete() {
            this.$buefy.dialog.confirm({
                ...this.$translation.get('dialog.user.delete'),
                message: `Are you sure you to delete the user ${this.entry.email}?`,
                type: 'is-danger',
                hasIcon: true,
                onConfirm: this.delete,
            });
        },

        async delete() {
            const variables = { id: this.entry.id };
            let { ok } = (await this.$apollo.mutate({ mutation: DeleteUser, variables })).data.deleteUser;
            // If we've successfully deleted the user, show a nice message and delete the user locally
            if (ok) {
                this.$buefy.toast.open({
                    message: this.$translation.get('message.user.deletesuccess'),
                    type: 'is-danger'
                });
                this.$emit('refresh');
            }
        }

    },

    computed: {

        role() {
            return Role[this.entry.role];
        },

        showRole() {
            return this.role !== Role.USER;
        },
        
    }

}
</script>