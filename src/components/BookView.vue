<template>
    <div class="book-view">
        <div class="static"><slot name="static"/></div>
        <div class="scroll-area">
            <div class="background">
                <div class="foreground"><slot name="foreground"/></div>
            </div>
        </div>
    </div>
</template>