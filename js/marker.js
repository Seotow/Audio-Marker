async function handleAudio({
    audioFilePath,
    start = 0, //seconds
    threshold = -30,
    silenceDuration = 0.5,
}) {
    const fs = require("fs")
    const wav = require("node-wav")

    const { $ } = require(`.\\selector.js`)

    const fileExt = audioFilePath.split(".").pop()
    const outputPath = audioFilePath.replace(`.${fileExt}`, ".wav")
    const convertedFile = await convertAudioToWav(
        audioFilePath,
        fileExt,
        outputPath
    )

    const wavFileData = fs.readFileSync(convertedFile)

    const wavAudioData = wav.decode(wavFileData)

    const sampleRate = wavAudioData.sampleRate
    const audioData = wavAudioData.channelData[0] // Lấy dữ liệu âm thanh từ kênh thứ nhất

    const silenceThreshold = Math.pow(10, 0.1 * (Number(threshold) || -30)) // Chuyển đổi từ decibel sang giá trị năng lượng (energy threshold)

    const silentRanges = []

    let isSilent = true
    let silentStart = 0

    // const progressBar = $(".progressBar")
    // const progressPercent = ((100000000 + 1) / audioData.length) * 100
    // progressBar.style.width = `${progressPercent}%`;

    for (let i = 0; i < audioData.length; i++) {
        // Xử lí
        const sample = audioData[i]

        // Tính toán năng lượng của mẫu âm thanh
        const energy = sample * sample

        if (energy >= silenceThreshold && isSilent) {
            // Khoảng im lặng kết thúc
            const silentEnd = i / sampleRate
            const silentDuration = silentEnd - silentStart

            if (silentDuration >= (Number(silenceDuration) || 0.5)) {
                // Thêm thời gian khoảng im lặng bắt đàu và kết thúc
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

    const ADD_MARKER_DELAY = 50 // milliseconds

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
}

async function convertAudioToWav(audioFilePath, fileExt, outputPath) {
    if (fileExt == "wav") {
        return outputPath
    }

    const ffmpeg = require("fluent-ffmpeg")
    const ffmpegPath = `${appRoot}\\js\\libs\\ffmpeg\\bin\\ffmpeg.exe`

    ffmpeg.setFfmpegPath(ffmpegPath)
    return new Promise((resolve, reject) => {
        ffmpeg(audioFilePath)
            .inputFormat(fileExt)
            .audioCodec("pcm_s16le")
            .format("wav")
            .on("error", (err) => reject(`FFmpeg conversion failed: ${err}`))
            .on("end", () => resolve(outputPath))
            .save(outputPath)
    })
}

function addMarkers() {
    const csInterface = new CSInterface()
    const { $ } = require(`.\\selector.js`)

    const threshold = +$("#threshold").value
    const silenceDuration = +$("#silentDuration").value

    csInterface.evalScript("getSelectedAudio()", async (res) => {
        const response = await JSON.parse(res)

        for (media of response) {
            var audioFilePath = media.path
            var start = media.start
            var data = {
                threshold,
                silenceDuration,
                audioFilePath,
                start,
            }

            if (Object.keys(data).length == 4) {
                alert("Xử lí âm thanh...")
                await handleAudio(data)
            } else {
                alert("Chưa chọn âm thanh")
            }
        }
    })
}

module.exports = addMarkers
