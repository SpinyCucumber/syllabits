<template>
    <scene type="is-aligned is-centered">
        <template #content-area>
            <div class="register-menu">
                <!-- TODO IMPROVEMENT Could change logo here (or background) to something more exciting -->
                <img :src="$assets.getTexture('logo')" class="logo"/>
                <form @submit.prevent="submit">
                    <b-field label="Email" label-position="on-border">
                        <b-input type="email" v-model="input.email"/>
                    </b-field>
                    <b-field label="Password" label-position="on-border">
                        <b-input type="password" v-model="input.password"/>
                    </b-field>
                    <b-button tag="input" type="is-primary" native-type="submit" value="Register"/>
                </form>
                <!-- Loading overlay -->
                <b-loading v-model="busy"/>
            </div>
        </template>
    </scene>
</template>

<script>
import { Scene } from '@/components'
import { Register } from '@/queries'
import { toTranslationKey } from '@/utilities'

export default {
    name: 'Register',
    components: { Scene },
    data() {
        return {
            input: {},
            busy: false,
        }
    },
    methods: {
        async submit() {
            this.busy = true;
            // Submit input to server
            const variables = { input: this.input };
            let { ok, result, error } = (await this.$apollo.mutate({ mutation: Register, variables })).data.register;
            this.busy = false;
            // If the response was OK, we set the identity using the new token
            // and navigate to the dashboard (and show a nice message as well.)
            // Otherwise, we display an error message.
            if (ok) {
                const token = result;
                this.$store.dispatch('loadIdentity', token);
                this.$buefy.toast.open({
                    message: this.$translation.get('message.register.success'),
                    type: 'is-success'
                });
                this.$router.push({ name: 'Dashboard' });
            }
            else {
                const message = this.$translation.get('message.register.error.' + toTranslationKey(error));
                this.$buefy.toast.open({ message, type: 'is-danger' });
            }
        }
    }
}
</script>