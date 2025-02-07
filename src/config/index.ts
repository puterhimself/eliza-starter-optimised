import {
	type Character,
	ModelProviderName,
	settings,
	validateCharacterConfig,
} from "@elizaos/core";
// import fs from "fs";
// import path from "path";
import yargs from "yargs";

export function parseArguments(): {
	character?: string;
	characters?: string;
} {
	try {
		console.log("Raw argv:", process.argv);
		// Remove the first two arguments (node and script path) and any '--' argument
		const args = process.argv
			.slice(2)
			.filter((arg) => arg !== "--")
			.flatMap((arg) => {
				// Convert --character=value to --character value format
				if (arg.startsWith("--character=")) {
					return arg.replace("--character=", "--character ").split(" ");
				}
				return arg;
			});

		const parsed = yargs(args)
			.option("character", {
				type: "string",
				description: "Path to the character JSON file",
			})
			.option("characters", {
				type: "string",
				description: "Comma separated list of paths to character JSON files",
			})
			.parseSync();

		console.log("Parsed args:", parsed);
		return parsed;
	} catch (error) {
		console.error("Error parsing arguments:", error);
		return {};
	}
}

export async function loadCharacters(
	charactersArg?: string,
): Promise<Character[]> {
	const loadedCharacters: Character[] = [];

	// First try to load from CHARACTER_JSON environment variable
	if (process.env.CHARACTER_JSON) {
		try {
			console.log(
				"Loading character from CHARACTER_JSON env:",
				process.env.CHARACTER_JSON,
			);
			const character = JSON.parse(process.env.CHARACTER_JSON) as Character;
			validateCharacterConfig(character);
			loadedCharacters.push(character);
			return loadedCharacters;
		} catch (e) {
			console.error(`Error loading character from CHARACTER_JSON env: ${e}`);
			process.exit(1);
		}
	}

	// // If no CHARACTER_JSON, proceed with file-based loading
	// if (charactersArg) {
	//   let characterPaths = charactersArg.split(",").map((filePath) => {
	//     if (path.basename(filePath) === filePath) {
	//       filePath = "../characters/" + filePath;
	//     }
	//     return path.resolve(process.cwd(), filePath.trim());
	//   });

	//   if (characterPaths?.length > 0) {
	//     for (const path of characterPaths) {
	//       try {
	//         const character = JSON.parse(fs.readFileSync(path, "utf8"));
	//         validateCharacterConfig(character);
	//         loadedCharacters.push(character);
	//       } catch (e) {
	//         console.error(`Error loading character from ${path}: ${e}`);
	//         process.exit(1);
	//       }
	//     }
	//   }
	// }

	return loadedCharacters;
}

export function getTokenForProvider(
	provider: ModelProviderName,
	character: Character,
) {
	switch (provider) {
		case ModelProviderName.OPENAI:
			return (
				character.settings?.secrets?.OPENAI_API_KEY || settings.OPENAI_API_KEY
			);
		case ModelProviderName.LLAMACLOUD:
			return (
				character.settings?.secrets?.LLAMACLOUD_API_KEY ||
				settings.LLAMACLOUD_API_KEY ||
				character.settings?.secrets?.TOGETHER_API_KEY ||
				settings.TOGETHER_API_KEY ||
				character.settings?.secrets?.XAI_API_KEY ||
				settings.XAI_API_KEY ||
				character.settings?.secrets?.OPENAI_API_KEY ||
				settings.OPENAI_API_KEY
			);
		case ModelProviderName.ANTHROPIC:
			return (
				character.settings?.secrets?.ANTHROPIC_API_KEY ||
				character.settings?.secrets?.CLAUDE_API_KEY ||
				settings.ANTHROPIC_API_KEY ||
				settings.CLAUDE_API_KEY
			);
		case ModelProviderName.REDPILL:
			return (
				character.settings?.secrets?.REDPILL_API_KEY || settings.REDPILL_API_KEY
			);
		case ModelProviderName.OPENROUTER:
			return (
				character.settings?.secrets?.OPENROUTER || settings.OPENROUTER_API_KEY
			);
		case ModelProviderName.GROK:
			return character.settings?.secrets?.GROK_API_KEY || settings.GROK_API_KEY;
		case ModelProviderName.HEURIST:
			return (
				character.settings?.secrets?.HEURIST_API_KEY || settings.HEURIST_API_KEY
			);
		case ModelProviderName.GROQ:
			return character.settings?.secrets?.GROQ_API_KEY || settings.GROQ_API_KEY;
	}
}
