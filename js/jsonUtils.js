const fs = require("fs")

// Hàm đọc dữ liệu từ tập tin JSON
async function readJSONFile(fileName) {
    try {
        const data = await fs.promises.readFile(`${appRoot}\\${fileName}`, "utf8")
        return JSON.parse(data)
    } catch (err) {
        alert(`Có một lỗi xảy ra: ${err}`)
        throw err
    }
}

// Hàm ghi dữ liệu vào tập tin JSON
async function writeJSONFile(fileName, data) {
    const jsonData = JSON.stringify(data, null, 2)

    try {
        await fs.promises.writeFile(`${appRoot}\\${fileName}`, jsonData, "utf8")
    } catch (err) {
        alert(`Có một lỗi xảy ra: ${err}`)
        throw err
    }
}

// Xuất các hàm để sử dụng ở nơi khác
module.exports = {
    readJSONFile,
    writeJSONFile,
}
