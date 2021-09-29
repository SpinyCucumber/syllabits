<template>
    <div class="reader">
        <div class="static-area"><slot name="static-area"/></div>
        <div class="scroll-area">
            <div class="background">
                <div class="content-area"><slot name="content-area"/></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Reader'
}
</script>