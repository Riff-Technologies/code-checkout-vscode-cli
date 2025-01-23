import { Command } from "@oclif/core";
export default class SoftwareGet extends Command {
    static description: string;
    static examples: string[];
    run(): Promise<void>;
}
