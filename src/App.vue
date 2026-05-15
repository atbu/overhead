<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import { LCircle, LMap, LPopup, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { onMounted, type Ref, ref } from "vue";
import { type ParsedNOTAM, parseNOTAMs } from "@/composables/useNOTAMParser.ts";
import AMSLText from "@/components/AMSLText.vue";
import IndentedBlockText from "@/components/IndentedBlockText.vue";
import { formatToAviationDate } from "@/composables/useDateFormatter.ts";

const zoom = ref(6);
const centre = ref([54.5, -2.5]);

const parsedNotams: Ref<ParsedNOTAM[]> = ref([]);

onMounted(async () => {
    const response = await fetch(
        "https://raw.githubusercontent.com/Jonty/uk-notam-archive/main/data/PIB.xml",
    );
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");

    parsedNotams.value = parseNOTAMs(xml);
    console.log(`Parsed ${parsedNotams.value.length} NOTAMs.`);
});
</script>

<template>
    <div style="height: 90vh; width: 100%">
        <l-map ref="map" v-model:zoom="zoom" v-model:center="centre" :useGlobalLeaflet="false">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <l-circle
                v-for="notam in parsedNotams"
                :key="notam.number"
                :lat-lng="[notam.latitude, notam.longitude]"
                :radius="notam.radiusInMetres"
                :color="'#FF0000'"
                :fill-opacity="0.2"
            >
                <l-popup>
                    <IndentedBlockText style="font-family: monospace">{{ notam.itemE }}</IndentedBlockText><br />
                    Lower limit:
                    <span style="font-weight: bold">
                        <span v-if="notam.lowerLimit != 0">{{ notam.lowerLimit }}ft <AMSLText /></span>
                        <span v-else>Surface</span>
                    </span>
                    Upper limit: <span style="font-weight: bold">{{ notam.upperLimit }}ft <AMSLText /></span><br />
                    Start: <span style="font-weight: bold">{{ formatToAviationDate(notam.start) }}</span><br />
                    End: <span style="font-weight: bold">{{ formatToAviationDate(notam.end) }}</span>
                </l-popup>
            </l-circle>
        </l-map>
    </div>
</template>

<style scoped></style>
