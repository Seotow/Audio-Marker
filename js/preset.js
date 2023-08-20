const { readJSONFile, writeJSONFile } = require(".\\jsonUtils.js")
const { $, $$ } = require(".\\selector.js")

async function savePreset(newPresetData) {
    await writeJSONFile("data.json", newPresetData)
    await renderPreset()
}

async function renderPreset() {
    const presetData = await readJSONFile("data.json")
    const presetListElement = $(".presetList")
    presetListElement.innerHTML = ""
    // Load preset to list
    for (let index in presetData) {
        const preset = document.createElement("div")
        const isOpen = presetData[index].isOpen

        preset.classList.add("preset")
        preset.dataset.preset = index

        preset.innerHTML = `
            <div class="listHeader">
                <input type="radio" name="preset" id="preset_${index}" value="${index}">
                <label class="presetName" for="preset_${index}">${
            presetData[index].name
        }</label>
                <span class="icon chevron material-symbols-outlined">
                    ${isOpen ? "close" : "expand_more"}
                </span>
                <span class="icon material-symbols-outlined editPreset">
                    edit
                </span>
                <span class="icon material-symbols-outlined deletePreset">
                    delete
                </span>
                </div>
            <div class="listBody ${isOpen ? "open" : ""}">
                <div class="tableHeader">
                    <span class="inpLabel">Motion</span>
                    <span class="inpLabel">Scale</span>
                </div>
                <div class="tableHeader">
                    <span class="inpLabel">Trước</span>
                    <span class="inpLabel">Sau</span>
                    <span class="inpLabel">Trước</span>
                    <span class="inpLabel">Sau</span>
                </div>
                
            </div>
        `

        presetListElement.appendChild(preset)

        const effects = presetData[index].data
        const effectList = document.createElement("ul")
        effectList.classList.add("effectList")

        const addEffect = document.createElement("span")
        addEffect.classList.add("addEffect", "material-symbols-outlined")
        addEffect.innerHTML = "add"

        for (effect of effects) {
            const effectElement = document.createElement("li")
            effectElement.classList.add("effect")
            let html = ""

            for (inp of effect) {
                if (Array.isArray(inp)) {
                    html += `
                        <div class="inpLabel">
                            <input type="text" value="${inp[0]}" />
                            <input type="text" value="${inp[1]}" />
                        </div>
                    `
                } else {
                    html += `
                        <div class="inpLabel">
                            <input type="text" value="${inp}" />
                        </div>
                    `
                }
            }
            html += `<span class="deleteEffect material-symbols-outlined">
                        delete 
                    </span>`
            effectElement.innerHTML = html

            effectList.appendChild(effectElement)
        }

        effectList.appendChild(addEffect)
        preset.querySelector(".listBody").appendChild(effectList)
    }

    // Handle Event
    const presets = $$(".preset")
    for (let index = 0; index < presets.length; index++) {
        const preset = presets[index]

        const toggleBtn = preset.querySelector(".chevron")
        const listBody = preset.querySelector(".listBody")

        const editPreset = preset.querySelector(".editPreset")
        const presetName = preset.querySelector(".presetName")
        const deletePreset = preset.querySelector(".deletePreset")

        const addEffect = preset.querySelector(".addEffect")

        // Dropdown menu
        toggleBtn.onclick = function () {
            presetData[index].isOpen = !presetData[index].isOpen
            savePreset(presetData)
        }

        // Change preset name
        editPreset.onclick = function () {
            presetName.contentEditable = true
            presetName.focus()

            // Di chuyển con trỏ đến cuối đoạn văn bản
            const range = document.createRange()
            const sel = window.getSelection()
            range.selectNodeContents(presetName)
            range.collapse(false)
            sel.removeAllRanges()
            sel.addRange(range)
        }

        presetName.onfocus = function () {
            this.style.backgroundColor = "#fff"
            this.style.color = "#000"
        }

        presetName.onblur = function () {
            this.style.backgroundColor = null
            this.style.color = null
            presetData[index].name = this.innerText.trim()
            presetData[index].isOpen = listBody.classList.contains("open")
            savePreset(presetData)
        }

        presetName.onkeydown = function (e) {
            if (e.keyCode == 13) {
                e.preventDefault()
                this.blur()
            }
        }

        // Delete preset
        deletePreset.onclick = function () {
            if (!confirm(`Bạn có đồng ý xóa: ${presetData[index].name} ?`))
                return

            presetData.splice(index, 1)
            savePreset(presetData)
        }

        // Add Effect
        addEffect.onclick = function () {
            const csInterface = new CSInterface()

            csInterface.evalScript("getDefaultMotion()", (res) => {
                const defaultMotion = JSON.parse(res)
                const defaultScale = 100
                const defaultPreset = [
                    defaultMotion,
                    defaultMotion,
                    defaultScale,
                    defaultScale,
                ]
                const effectData = presetData[index].data

                presetData[index].data = [...effectData, defaultPreset]
                presetData.isOpen = true

                savePreset(presetData)
            })
        }

        // Delete and save Effect
        const effects = listBody.querySelectorAll(".effect")
        for (let i = 0; i < effects.length; i++) {
            const effect = effects[i]
            const deleteEffect = effect.querySelector(".deleteEffect")
            const inps = effect.querySelectorAll("input")

            // Delete
            deleteEffect.onclick = function () {
                presetData[index].data.splice(i, 1)
                savePreset(presetData)
            }

            // Save
            for (let inp of inps) {
                inp.onblur = function () {
                    const inpsValue = [
                        [
                            // Motion before
                            +inps[0].value,
                            +inps[1].value,
                        ],
                        [
                            //Motion after
                            +inps[2].value,
                            +inps[3].value,
                        ],
                        +inps[4].value, //Scale before
                        +inps[5].value, //Scale after
                    ]
                    presetData[index].data[i] = inpsValue
                    savePreset(presetData)
                }
            }
        }
    }
}

async function addPreset() {
    const presetData = await readJSONFile("data.json")
    const csInterface = new CSInterface()

    csInterface.evalScript("getDefaultMotion()", async (res) => {
        const defaultMotion = JSON.parse(res)
        const defaultScale = 100
        const defaultPreset = [
            defaultMotion,
            defaultMotion,
            defaultScale,
            defaultScale,
        ]

        const newPresetData = [
            ...presetData,
            {
                name: "",
                isOpen: true,
                data: [defaultPreset],
            },
        ]

        await savePreset(newPresetData)

        const newPreset = $$(".preset")[newPresetData.length - 1]

        newPreset.querySelector(".editPreset").click()
    })
}

async function getCheckedPerset() {
    const presetData = await readJSONFile("data.json")
    const checkedValue = $("input[name=preset]:checked").value

    return presetData[checkedValue]
}

async function insertPreset() {
    const csInterface = new CSInterface()

    const preset = await getCheckedPerset()

    csInterface.evalScript(
        "insertRandomPreset(" + JSON.stringify(preset.data) + ")",
        (data) => {
            const message = data ? `Chèn thành công ${preset.name}` : "Chèn thất bại"

            alert(message)
        }
    )
}

function removePreset() {
    const csInterface = new CSInterface()

    csInterface.evalScript("removePreset()", (data) => {
        const message = data ? "Xóa thành công" : "Xóa thất bại"

        alert(message)
    })
}

module.exports = {
    renderPreset,
    addPreset,
    insertPreset,
    removePreset
}
