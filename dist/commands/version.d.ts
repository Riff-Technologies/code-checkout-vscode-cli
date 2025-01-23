import { Command } from "@oclif/core";
export default class Version extends Command {
    static description: string;
    static flags: {};
    static strict: boolean;
    static usage: string[];
    static summary: string;
    static hidden: boolean;
    run(): Promise<void>;
}
