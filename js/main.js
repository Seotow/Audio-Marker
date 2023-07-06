const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

;(function () {
    "use strict"

    $(".add-marker").onclick = run
})()

function handleAudio({
    audioFilePath,
    start = 0, //seconds
    threshold = -30,
    silenceDuration = 0.5,
}) {
    const fs = require("fs")
    const wav = require("node-wav")
    const { spawn } = require("child_process")

    const outputPath = audioFilePath.slice(0, -3) + "wav"

    // Sử dụng ffmpeg để chuyển đổi từ MP3 hoặc MOV thành WAV
    const ffmpeg = spawn("ffmpeg", ["-i", audioFilePath, outputPath, "-y"])

    ffmpeg.stderr.on("data", (data) => {
        return
    })

    ffmpeg.on("close", (code) => {
        if (code === 0) {
            // Đọc dữ liệu âm thanh từ file WAV
            const wavFileData = fs.readFileSync(outputPath)
            const wavAudioData = wav.decode(wavFileData)

            const sampleRate = wavAudioData.sampleRate
            const audioData = wavAudioData.channelData[0] // Lấy dữ liệu âm thanh từ kênh thứ nhất

            const silenceThreshold = Math.pow(
                10,
                0.1 * (Number(threshold) || -30)
            ) // Chuyển đổi từ decibel sang giá trị năng lượng (energy threshold)

            const silentRanges = []

            let isSilent = true
            let silentStart = 0

            for (let i = 0; i < audioData.length; i++) {
                const sample = audioData[i]

                // Tính toán năng lượng của mẫu âm thanh
                const energy = sample * sample

                if (energy >= silenceThreshold && isSilent) {
                    // Khoảng im lặng kết thúc
                    const silentEnd = i / sampleRate
                    const silentDuration = silentEnd - silentStart

                    if (silentDuration >= (Number(silenceDuration) || 0.5)) {
                        silentRanges.push({
                            start: silentStart,
                            end: silentEnd,
                        })
                    }

                    isSilent = false
                } else if (energy < silenceThreshold && !isSilent) {
                    // Khoảng im lặng bắt đầu
                    silentStart = i / sampleRate
                    isSilent = true
                }
            }
            alert(`${silentRanges.length} markers được tạo`)

            const csInterface = new CSInterface()
            csInterface.evalScript("saveProject()")
            
            const ADD_MARKER_DELAY = 50 // miliseconds

            silentRanges.forEach((silent, index) => {
                setTimeout(() => {
                    csInterface.evalScript(
                        "addMarker(" + (silent.start + start).toFixed(2) + ")"
                    )

                    if (index == silentRanges.length - 1) {
                        alert("Done")

                        csInterface.evalScript("saveProject()")
                    }
                }, index * ADD_MARKER_DELAY)
            })

            return
        } else {
            alert("FFmpeg conversion failed")
        }
    })
}

function getAndConvertData() {
    const csInterface = new CSInterface()
    const data = {}

    csInterface.evalScript("getSelected()", (res) => {
        const response = JSON.parse(res)

        data.audioFilePath = response.path
        data.start = response.start
    })

    const threshold = $("#threshold").value
    const silenceDuration = $("#silentDuration").value

    data.threshold = Number(threshold)
    data.silenceDuration = Number(silenceDuration)

    return data
}

function run() {
    const data = getAndConvertData()

    setTimeout(() => {
        if (Object.keys(data).length == 4) {
            handleAudio(data)
        } else {
            alert("Chưa chọn âm thanh")
        }
    }, 500)
}
