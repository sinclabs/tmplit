import fs from "fs";
import path from "path";
import StreamZip from "node-stream-zip";
import Mustache from "mustache";

const templateZipfileName = './typescript-node-template.tmplit';
const configFileName = 'tmplit.config.json';
const destinationFolder = './newProject';

(async function main() {
    const zip = new StreamZip.async({ file: templateZipfileName })

    const entriesCount = await zip.entriesCount
    if(entriesCount < 1) {
        return
    }

    const entries = await zip.entries()
    if(Object.keys(entries).includes(configFileName)) {
        const config = JSON.parse((await zip.entryData('tmplit.config.json')).toString())
        console.log(config);

        for (const entry of Object.values(entries)) {
            const desc = entry.isDirectory ? 'directory' : `${entry.size} bytes`;
            console.log(`Entry ${entry.name}: ${desc}`);
            if(!entry.isDirectory) {
                const fileTmlptData = (await zip.entryData(entry.name)).toString()
                const fileData = Mustache.render(fileTmlptData, config.keys)
                fs.writeFileSync(path.join(destinationFolder, entry.name), fileData)
            } else {
                fs.mkdirSync(path.join(destinationFolder, entry.name))
            }
            //await zip.extract(entry.name, destinationFolder);
        }
    }

    await zip.close();
})()
