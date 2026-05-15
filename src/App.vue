<script setup lang="ts">
const response = await fetch(
    'https://raw.githubusercontent.com/Jonty/uk-notam-archive/main/data/PIB.xml'
);
const text = await response.text();
const parser = new DOMParser();
const xml = parser.parseFromString(text, 'application/xml');
console.log(xml);
</script>

<template>
    <h1>You did it!</h1>
    <p>
        Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
        documentation
    </p>
</template>

<style scoped></style>
