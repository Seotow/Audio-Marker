const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
global.appRoot = __dirname


;(async function () {
    "use strict"
    const addMarkers = require(`${__dirname}\\js\\marker.js`)
    const {renderPreset, addPreset, insertPreset, removePreset} = require(`${__dirname}\\js\\preset.js`)

    await renderPreset()

    $(".addMarker").onclick = addMarkers
    $(".addPreset").onclick = addPreset
    $(".insertPreset").onclick = insertPreset
    $(".removePreset").onclick = removePreset
})()


