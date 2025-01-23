import { Command } from "@oclif/core";
export default class CreateSoftware extends Command {
    static description: string;
    static examples: string[];
    run(): Promise<void>;
    private readPackageJson;
    private handleError;
}
