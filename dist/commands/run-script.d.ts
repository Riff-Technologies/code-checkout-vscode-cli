import { Command } from "@oclif/core";
export default class RunScript extends Command {
    static description: string;
    static examples: string[];
    run(): Promise<void>;
    private runInitScript;
    private handleError;
}
