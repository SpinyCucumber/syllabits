<template>
    <navbar-view>
        <scene type="is-aligned">
            <template #content-area>
                <div class="page">
                    <transition name="fade">
                        <div class="page-content" v-if="page" v-html="page.content"/>
                    </transition>
                </div>
            </template>
        </scene>
    </navbar-view>
</template>

<script>
import { Scene } from '@/components'
import { ViewPage } from '@/queries'
import NavbarView from './NavbarView'

export default {
    name: 'Page',
    components: { Scene, NavbarView, },
    props: {
        mode: { type: String, default: 'view' }, // May be 'view' or 'edit'
        path: String // May be a page path (such as 'about', 'guide', etc.) or a page ID
    },
    apollo: {
        page: {
            query: ViewPage,
            update: data => (data.page),
            variables() {
                return { path: this.path }
            },
        }
    }
}
</script>