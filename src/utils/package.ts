import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Interface for package.json contents
 */
export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  publisher?: string;
  [key: string]: unknown;
}

/**
 * Updates the package.json file with the publisher value if it doesn't exist
 * @param publisherValue - The publisher value to set
 * @param logger - Optional logger function for status messages
 * @returns void
 */
export function updatePackageJsonPublisher(
  publisherValue: string,
  logger?: {
    log: (message: string) => void;
    debug?: (message: string) => void;
  }
): void {
  try {
    const packageJsonPath = join(process.cwd(), "package.json");

    // Check if package.json exists
    if (!existsSync(packageJsonPath)) {
      return; // Skip if no package.json exists
    }

    // Read and parse package.json
    const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
    const packageJson: PackageJson = JSON.parse(packageJsonContent);

    // Only update if publisher field doesn't exist
    if (!packageJson.publisher) {
      packageJson.publisher = publisherValue;
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      logger?.log("✅ Updated package.json with publisher value");
    }
  } catch (error) {
    // Log error but don't throw - this is a non-critical operation
    logger?.log("⚠️ Could not update package.json with publisher value");
    if (error instanceof Error) {
      logger?.debug?.(`Error updating package.json: ${error.message}`);
    }
  }
}

/**
 * Reads and validates the package.json file
 * @returns The parsed package.json contents
 * @throws Error if the file cannot be read or is invalid
 */
export function readPackageJson(): PackageJson {
  try {
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonContent);

    // Validate required fields
    if (!packageJson.name) {
      throw new Error("package.json must contain a name field");
    }

    return packageJson;
  } catch (error) {
    if (error instanceof Error && error.message.includes("must contain")) {
      throw error;
    }
    throw new Error(
      "Could not read package.json. Make sure you're in the root directory of your project."
    );
  }
}

/**
 * Determines the package manager used in the project
 * @returns An object containing the package manager name, command, and run script
 */
export function getPackageManager(): {
  name: "npm" | "yarn" | "pnpm" | null;
  command: string;
  runScript: string;
} {
  try {
    // Check for lock files in order of preference
    if (existsSync(join(process.cwd(), "package-lock.json"))) {
      return {
        name: "npm",
        command: "npm install @riff-tech/code-checkout-vscode",
        runScript: "npx code-checkout-init",
      };
    }
    if (existsSync(join(process.cwd(), "yarn.lock"))) {
      return {
        name: "yarn",
        command: "yarn add @riff-tech/code-checkout-vscode",
        runScript: "yarn run code-checkout-init",
      };
    }
    if (existsSync(join(process.cwd(), "pnpm-lock.yaml"))) {
      return {
        name: "pnpm",
        command: "pnpm add @riff-tech/code-checkout-vscode",
        runScript: "pnpm dlx code-checkout-init",
      };
    }
    return { name: null, command: "", runScript: "" };
  } catch {
    return { name: null, command: "", runScript: "" };
  }
}
