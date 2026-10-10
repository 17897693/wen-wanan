import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * 「晚安」技能 provider。
 *
 * 把纯 Markdown 技能（SKILL.md + references/）注册成 DSH 可发现的 skill，
 * 使 `skill("wen-wanan")` 在任意会话可用。本插件**不注册任何工具**，
 * 只做 skill 装载 —— 技能内容全部在 SKILL.md 里。
 *
 * @module wen-wanan
 */

// provider id 必须全局唯一：DSH 的 SkillsRegistry 重名会抛错。
// 用 "wen-wanan-skill" 作为 provider id，与包名 "wen-wanan" 区分，
// 避免将来同包内再加 provider 时撞名。
const PROVIDER_NAME = "wen-wanan-skill";
const SKILL_BODY_URL = new URL("./SKILL.md", import.meta.url);
const RESOURCE_BASE = {
	kind: "directory",
	path: fileURLToPath(new URL("./", import.meta.url)),
};

const CANDIDATE = {
	name: "wen-wanan",
	description:
		"情侣向睡前陪伴技能：按「一句温柔情话 → 一个谐音梗猜谜小故事 → 一句温柔晚安」三段式输出。当用户说「晚安」「要睡了」「困了想睡」「睡前来点」「哄我睡」「睡前想说说话」「跟我道晚安」「讲个睡前故事」「晚安故事」「晚安情话」「哄睡」「睡前一乐」等时使用。",
	invocation: {
		modelInvocable: true,
		userInvocable: true,
	},
	provider: PROVIDER_NAME,
	source: "custom",
	resourceBase: RESOURCE_BASE,
	rank: 600,
	locator: SKILL_BODY_URL,
};

const provider = {
	name: PROVIDER_NAME,
	list: () => Promise.resolve([CANDIDATE]),
	async get(_candidate) {
		return {
			name: CANDIDATE.name,
			description: CANDIDATE.description,
			invocation: CANDIDATE.invocation,
			provider: CANDIDATE.provider,
			source: CANDIDATE.source,
			resourceBase: RESOURCE_BASE,
			// 每次装载都重新读盘：改 SKILL.md 无需重挂插件即生效。
			content: await readFile(SKILL_BODY_URL, "utf8"),
		};
	},
};

/** Cordis 插件名（与包名区分：这是插件行 id 用的名字）。 */
export const name = "skill-wen-wanan";
/** 依赖的宿主服务：技能注册表。 */
export const inject = ["skills"];

/** 在 ctx.skills 上注册「晚安」provider。 */
export function apply(ctx) {
	ctx.skills.registerProvider(() => provider);
}
