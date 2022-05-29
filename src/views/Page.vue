<template>
    <navbar-view>
        <scene type="is-aligned">
            <template #content-area>
                <div class="page">
                    This page is a work in progress!
                    {{ path }}
                </div>
            </template>
        </scene>
    </navbar-view>
</template>

<script>
import { Scene } from '@/components'
import NavbarView from './NavbarView'

export default {
    name: 'Page',
    components: { Scene, NavbarView, },
    props: {
        path: String // May be a page path (such as 'about', 'guide', etc.) or a page ID
    }
}
</script>