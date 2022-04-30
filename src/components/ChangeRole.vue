<template>
    <form @submit.prevent="submit">
        <div class="modal-card" style="width: min(100vw, 25em)">
            <header class="modal-card-head">
                <p class="modal-card-title">{{ $translation.get('dialog.user.changerole.title') }}</p>
            </header>
            <section class="modal-card-body">
                <b-field :label="$translation.get('label.newrole')">
                    <b-select
                        :placeholder="$translation.get('placeholder.user.role')"
                        required
                        v-model="newRoleName">
                        <option
                            v-for="role in Role.values"
                            :key="role.valueOf()"
                            :value="role.name">
                            {{ $translation.get('role.' + role.name.toLowerCase()) }}
                        </option>
                    </b-select>
                </b-field>
                <transition name="fade" mode="out-in">
                    <p v-if="newRole" :key="newRole.valueOf()" class="has-text-grey">
                        {{ `The role of ${user.email} will be changed to '${$translation.get('role.' + newRole.name.toLowerCase())}'` }}
                    </p>
                </transition>
            </section>
            <footer class="modal-card-foot">
                <b-button
                    :label="$translation.get('label.cancel')"
                    @click="$emit('close')"/>
                <b-button
                    :label="$translation.get('label.submit')"
                    native-type="submit"
                    type="is-primary" />
            </footer>
        </div>
    </form>
</template>

<script>
import { Constants } from '@/services'
import { UpdateUser } from '@/queries'
const { Role } = Constants;

export default {
    name: 'ChangeRole',
    props: { user: Object },
    setup() {
        return { Role }
    },
    data() {
        return {
            newRoleName: null,
        }
    },
    methods: {
        async submit() {
            // Update user role on server using transforms
            let transforms = [{ op: 'set', field: 'role', value: this.newRole.valueOf() }]
            let variables = { id: this.user.id, transforms: transforms.map(JSON.stringify) };
            let { ok }  = (await this.$apollo.mutate({ mutation: UpdateUser, variables })).data.updateUser;
            // If query was successful, show success message and update user role locally
            if (ok) {
                this.$buefy.toast.open({
                    message: this.$translation.get('message.user.changerolesuccess'),
                    type: 'is-success'
                });
                this.user.role = this.newRole.name;
            }
            this.$emit('close');
        },
    },
    computed: {
        newRole() {
            return Role[this.newRoleName];
        },
    }
}
</script>