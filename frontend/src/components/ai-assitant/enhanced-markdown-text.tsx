import { FC } from "react";
import { ReasoningContent } from "./reasoning-content.tsx";

interface EnhancedMarkdownTextProps {
  text: string;
}

export const EnhancedMarkdownText: FC<EnhancedMarkdownTextProps> = ({
  text,
}) => {
  // Check for special reasoning content marker
  const reasoningRegex = /__REASONING_CONTENT__(.*?)__REASONING_CONTENT_END__/s;
  const match = text.match(reasoningRegex);

  if (match) {
    // Extract reasoning content and remaining normal text
    const reasoningContent = match[1];
    const normalText = text.replace(reasoningRegex, "").trim();

    return (
      <>
        {/* Render normal markdown content - temporarily plain text */}
        {normalText && (
          <div style={{ whiteSpace: "pre-wrap" }}>{normalText}</div>
        )}

        {/* Render reasoning content */}
        {/*<ReasoningContent reasoningContent={reasoningContent} />*/}
      </>
    );
  }

  // If no reasoning content, render plain text
  return <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>;
};
