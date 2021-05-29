import Tmplit from "./tmplit";

const templateZipfileName = './testSpace/typescript-node-template.tmplit';
const destinationFolder = './testSpace/newProject';

(async function main() {
    const tmplit = new Tmplit(templateZipfileName)

    const {valid, config} = await tmplit.validate()

    if(!valid) {
        throw Error("Please provide a valid tmplit file")
    }

    await tmplit.extract(config, destinationFolder)

    await tmplit.cleanUp()
})()
