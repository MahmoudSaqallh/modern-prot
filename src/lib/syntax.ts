export type TokenKind = "keyword" | "string" | "fn" | "type" | "tag" | "number" | "punct" | "plain";

export interface Token {
  text: string;
  kind: TokenKind;
}

const KEYWORDS = new Set([
  "export", "function", "const", "let", "return", "if", "async", "await", "final", "import", "from",
  "interface", "type", "class", "new", "true", "false", "null", "Widget", "override", "GET", "POST",
]);

const PATTERN =
  /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(<\/?[A-Z][A-Za-z]*)|(@?[A-Za-z_$][\w$]*)(?=\s*\()|(@?[A-Za-z_$][\w$]*)|(\d+(?:\.\d+)?(?:ms)?)|([^\sA-Za-z\d"'_$<]+|<)|(\s+)/g;

/**
 * Small, dependency-free highlighter for JS/TS/JSX, Dart and shell-like lines.
 * Good enough for short display snippets; not a parser.
 */
export function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  for (const m of line.matchAll(PATTERN)) {
    const [text, str, tag, call, word, num, punct] = m;
    if (str) tokens.push({ text, kind: "string" });
    else if (tag) tokens.push({ text, kind: "tag" });
    else if (call) tokens.push({ text, kind: KEYWORDS.has(call) ? "keyword" : "fn" });
    else if (word) {
      const bare = word.replace("@", "");
      tokens.push({ text, kind: KEYWORDS.has(bare) ? "keyword" : /^[A-Z]/.test(bare) ? "type" : "plain" });
    } else if (num) tokens.push({ text, kind: "number" });
    else if (punct) tokens.push({ text, kind: "punct" });
    else tokens.push({ text, kind: "plain" });
  }
  return tokens;
}

/** One palette for code everywhere (DOM and canvas textures). */
export const SYNTAX_COLORS: Record<TokenKind, string> = {
  keyword: "#c9a7ff",
  string: "#5be37d",
  fn: "#33d6ff",
  type: "#e8c07a",
  tag: "#33d6ff",
  number: "#f08a6c",
  punct: "#8a93a0",
  plain: "#d7dce2",
};
