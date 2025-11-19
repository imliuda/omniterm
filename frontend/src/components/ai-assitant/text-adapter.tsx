import { FC } from "react";
import { EnhancedMarkdownText } from "./enhanced-markdown-text.tsx";

// Adapter component: adapt @assistant-ui/react TextMessagePart to EnhancedMarkdownText
interface TextMessagePartAdapterProps {
  text: string;
  [key: string]: any; // Allow other props
}

export const TextMessagePartAdapter: FC<TextMessagePartAdapterProps> = ({
  text,
  ...props
}) => {
  return <EnhancedMarkdownText text={text} />;
};
