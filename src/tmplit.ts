import fs from "fs"
import path from "path"
import StreamZip from "node-stream-zip"
import Mustache from "mustache"

export default class Tmplit {
    private CONFIG_FILE_NAME = 'tmplit.config.json';
    private template: StreamZipAsync

    constructor(fileName: string) {
        this.template = new StreamZip.async({ file: fileName })
    }

    async validate(): Promise<{valid: boolean, config?: any}> {
        const entriesCount = await this.template.entriesCount
        if(entriesCount < 1) {
            return {
                valid: false
            }
        }

        const config = JSON.parse((await this.template.entryData(this.CONFIG_FILE_NAME)).toString())
        return {
            valid: true,
            config
        }
    }

    async extract(config: any, destinationFolder: string) {
        const entries = await this.template.entries()
        for (const entry of Object.values(entries)) {
            if(!entry.isDirectory) {
                const fileTemlapteData = (await this.template.entryData(entry.name)).toString()
                const fileData = Mustache.render(fileTemlapteData, config.keys)
                fs.writeFileSync(path.join(destinationFolder, entry.name), fileData)
            } else {
                fs.mkdirSync(path.join(destinationFolder, entry.name))
            }
        }
    }

    async cleanUp() {
        await this.template.close()
    }
}

type StreamZipOptions = StreamZip.StreamZipOptions;
type ZipEntry = StreamZip.ZipEntry;

declare class StreamZipAsync {
    constructor(config: StreamZipOptions);

    entriesCount: Promise<number>;
    comment: Promise<string>;

    entry(name: string): Promise<ZipEntry | undefined>;
    entries(): Promise<{ [name: string]: ZipEntry }>;
    entryData(entry: string | ZipEntry): Promise<Buffer>;
    stream(entry: string | ZipEntry): Promise<NodeJS.ReadableStream>;
    extract(entry: string | ZipEntry | null, outPath: string): Promise<number | undefined>;

    on(event: 'entry', handler: (entry: ZipEntry) => void): void;
    on(event: 'extract', handler: (entry: ZipEntry, outPath: string) => void): void;

    close(): Promise<void>;
}