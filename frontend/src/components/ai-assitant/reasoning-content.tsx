import { FC, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, BrainIcon } from "lucide-react";
import { cn } from "./lib/utils.ts";

interface ReasoningContentProps {
  text?: string;
  className?: string;
}

export const ReasoningContent: FC<ReasoningContentProps> = ({
  text,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!text || !text.trim()) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={cn(
        "mt-2 rounded-xl bg-gray-100 dark:bg-blue-900/20",
        className,
      )}
    >
      {/* Collapsible header bar */}
      {/*<button*/}
      {/*  onClick={toggleExpanded}*/}
      {/*  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-gray-100/70 dark:hover:bg-blue-900/30 transition-colors rounded-t-md"*/}
      {/*>*/}
      {/*  <BrainIcon className="h-4 w-4 text-blue-500" />*/}
      {/*  <span>AI Reasoning Process</span>*/}
      {/*  {isExpanded ? (*/}
      {/*    <ChevronDownIcon className="h-4 w-4 ml-auto" />*/}
      {/*  ) : (*/}
      {/*    <ChevronRightIcon className="h-4 w-4 ml-auto" />*/}
      {/*  )}*/}
      {/*</button>*/}

      {/* Collapsible content area */}
      {isExpanded && (
        <div className="px-3 py-3 dark:bg-blue-900/30">
          <div className="text-sm text-gray-600 dark:text-blue-200 whitespace-pre-wrap leading-relaxed font-mono">
            {text}
          </div>
        </div>
      )}
    </div>
  );
};
