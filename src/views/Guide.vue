<template>
    <navbar-view>
        <scene type="is-aligned">
            <template #content-area>
                <div class="guide">
                    This page is a work in progress!
                </div>
            </template>
        </scene>
    </navbar-view>
</template>

<script>
import { Scene } from '@/components'
import NavbarView from './NavbarView'

export default {
    name: 'Guide',
    components: { Scene, NavbarView, },
}
</script>