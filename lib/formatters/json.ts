interface JsonValidationError {
  message: string;
  line?: number;
  column?: number;
}

interface JsonValidationResult {
  valid: boolean;
  error?: JsonValidationError;
  data?: unknown;
}

type IndentStyle = "2" | "4" | "tab";

const validateJson = (input: string): JsonValidationResult => {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: true, data: null };
  }

  try {
    const data = JSON.parse(trimmed);
    return { valid: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    let line: number | undefined;
    let column: number | undefined;

    const lineMatch = message.match(
      /position\s+(\d+)|line\s+(\d+)\s+column\s+(\d+)/i,
    );
    if (lineMatch) {
      if (lineMatch[2] != null && lineMatch[3] != null) {
        line = parseInt(lineMatch[2], 10);
        column = parseInt(lineMatch[3], 10);
      } else if (lineMatch[1] != null) {
        const pos = parseInt(lineMatch[1], 10);
        const before = trimmed.slice(0, pos);
        line = before.split("\n").length;
        const lastLine = before.split("\n").pop() ?? "";
        column = lastLine.length + 1;
      }
    } else {
      const atMatch = message.match(/at\s+(\d+)/);
      if (atMatch) {
        const pos = parseInt(atMatch[1], 10);
        const before = trimmed.slice(0, Math.min(pos, trimmed.length));
        line = before.split("\n").length;
        const lastLine = before.split("\n").pop() ?? "";
        column = lastLine.length + 1;
      }
    }

    return {
      valid: false,
      error: { message, line, column },
    };
  }
};

const getIndentString = (style: IndentStyle): string => {
  switch (style) {
    case "2":
      return "  ";
    case "4":
      return "    ";
    case "tab":
      return "\t";
    default:
      return "  ";
  }
};

const formatJson = (input: string, indentStyle: IndentStyle = "2"): string => {
  const result = validateJson(input);
  if (!result.valid || result.data === undefined) {
    return "";
  }
  const indent = getIndentString(indentStyle);
  return JSON.stringify(result.data, null, indent);
};

const minifyJson = (input: string): string => {
  const result = validateJson(input);
  if (!result.valid || result.data === undefined) {
    return "";
  }
  return JSON.stringify(result.data);
};

export type { JsonValidationError, JsonValidationResult, IndentStyle };
export { validateJson, formatJson, minifyJson };
