import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { FC, PropsWithChildren } from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
} from "lucide-react";
import { cn } from "./lib/utils.ts";

import { Button } from "./ui/button.tsx";
import { TooltipIconButton } from "./tooltip-icon-button.tsx";
import { ToolFallback } from "./tool-fallback.tsx";
import { TextMessagePartAdapter } from "./text-adapter.tsx";
import { ReasoningContent } from "./reasoning-content.tsx";
import { MarkdownText } from "./markdown-text.tsx";
import type { ModelConfig } from "./ai-assistant.tsx";

// Agent mode type
type AgentMode = "tools" | "react";

// Terminal option type
interface TerminalOption {
  key: string;
  label: string;
  isActive: boolean;
}

interface ThreadProps {
  agentMode: AgentMode;
  setAgentMode: (mode: AgentMode) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  groupedModelOptions: Record<string, ModelConfig[]>; // grouped model options by provider
  isLoading: boolean;
  availableTerminals: TerminalOption[];
  selectedTerminals: string[];
  currentTerminal: string;
  onTerminalSelectionChange: (selectedTerminals: string[]) => void;
  includeCurrentTerminal: boolean;
  onIncludeCurrentTerminalChange: (include: boolean) => void;
}

export const Thread: FC<ThreadProps> = ({
  agentMode,
  setAgentMode,
  selectedModel,
  setSelectedModel,
  groupedModelOptions,
  isLoading,
  availableTerminals,
  selectedTerminals,
  currentTerminal,
  onTerminalSelectionChange,
  includeCurrentTerminal,
  onIncludeCurrentTerminalChange,
}) => {
  // Compute disabled state: loading or conversation not ready
  const isDisabled = isLoading;

  return (
    <ThreadPrimitive.Root
      className="text-foreground bg-background box-border flex h-full flex-col overflow-hidden"
      style={{
        height: "100%",
        minHeight: "100%",
      }}
    >
      {/* Chat messages area - takes main space */}
      <ThreadPrimitive.Viewport className="flex-1 flex flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
        {/*<ThreadWelcome />*/}

        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            EditComposer: EditComposer,
            AssistantMessage: AssistantMessage,
          }}
        />

        <ThreadPrimitive.If empty={false}>
          <div className="min-h-8 flex-grow" />
        </ThreadPrimitive.If>

        <ThreadScrollToBottom />
      </ThreadPrimitive.Viewport>

      {/* Bottom control bar - fixed at bottom */}
      <div className="flex-shrink-0 w-full bg-background border-t border-gray-200 dark:border-gray-700 relative z-50">
        {/* Loading hint while conversation initializing */}
        {isLoading && (
          <div className="px-3 py-2 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  opacity="0.75"
                />
              </svg>
              Initializing conversation...
            </div>
          </div>
        )}

        <div className="w-full mx-auto">
          {/* Terminal selector - only shown when terminals available */}
          {availableTerminals.length > 0 && (
            <TerminalSelector
              availableTerminals={availableTerminals}
              selectedTerminals={selectedTerminals}
              currentTerminal={currentTerminal}
              onSelectionChange={onTerminalSelectionChange}
              includeCurrentTerminal={includeCurrentTerminal}
              onIncludeCurrentTerminalChange={onIncludeCurrentTerminalChange}
              disabled={isDisabled}
            />
          )}

          {/* Chat input composer */}
          <Composer disabled={isDisabled} />

          {/* Agent mode & model selector */}
          <AgentModeSelector
            agentMode={agentMode}
            setAgentMode={setAgentMode}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            groupedModelOptions={groupedModelOptions}
            isLoading={isLoading}
            disabled={isDisabled}
          />
        </div>
      </div>
    </ThreadPrimitive.Root>
  );
};

// Agent mode & model selector component
const AgentModeSelector: FC<{
  agentMode: AgentMode;
  setAgentMode: (mode: AgentMode) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  groupedModelOptions: Record<string, ModelConfig[]>;
  isLoading: boolean;
  disabled: boolean;
}> = ({
  agentMode,
  setAgentMode,
  selectedModel,
  setSelectedModel,
  groupedModelOptions,
  isLoading,
  disabled,
}) => {
  return (
    <div className="px-3 pb-2 w-full">
      <div className="flex items-center justify-between w-full">
        {/* Left side: agent mode & model selection */}
        <div className="flex items-center gap-4">
          {/* Agent mode selection */}
          <div className="flex items-center gap-2">
            <select
              id="agent-mode"
              value={agentMode}
              onChange={(e) => setAgentMode(e.target.value as AgentMode)}
              className="px-2 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || disabled}
            >
              <option value="tools">Tool</option>
              <option value="react">Agent</option>
            </select>
          </div>

          {/* Model selection grouped by provider */}
          <div className="flex items-center gap-2">
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-2 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || disabled}
            >
              {Object.entries(groupedModelOptions).length === 0 ? (
                <option value="" disabled>
                  No models available
                </option>
              ) : (
                Object.entries(groupedModelOptions).map(
                  ([provider, models]) => (
                    <optgroup key={provider} label={provider}>
                      {models.map((model) => (
                        <option key={model.name} value={model.name}>
                          {model.name}
                        </option>
                      ))}
                    </optgroup>
                  ),
                )
              )}
            </select>
          </div>
        </div>

        {/* Right side: send button */}
        <div className="flex items-center">
          <ComposerAction disabled={disabled} />
        </div>
      </div>
    </div>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 rounded-full disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

// const ThreadWelcome: FC = () => {
//   return (
//     <ThreadPrimitive.Empty>
//       <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
//         <div className="flex w-full flex-grow flex-col items-center justify-center">
//           <p className="mt-4 font-medium">How can I help you today?</p>
//         </div>
//         <ThreadWelcomeSuggestions />
//       </div>
//     </ThreadPrimitive.Empty>
//   );
// };
//
// const ThreadWelcomeSuggestions: FC = () => {
//   return (
//     <div className="mt-3 flex w-full items-stretch justify-center gap-4">
//       <ThreadPrimitive.Suggestion
//         className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
//         prompt="What is the weather in Tokyo?"
//         method="replace"
//         autoSend
//       >
//         <span className="line-clamp-2 text-ellipsis text-sm font-semibold">
//           What is the weather in Tokyo?
//         </span>
//       </ThreadPrimitive.Suggestion>
//       <ThreadPrimitive.Suggestion
//         className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
//         prompt="What is assistant-ui?"
//         method="replace"
//         autoSend
//       >
//         <span className="line-clamp-2 text-ellipsis text-sm font-semibold">
//           What is assistant-ui?
//         </span>
//       </ThreadPrimitive.Suggestion>
//     </div>
//   );
// };

const Composer: FC<{ disabled?: boolean }> = ({ disabled }) => {
  return (
    <div className="px-3">
      <ComposerPrimitive.Root className="focus-within:border-ring/20 flex w-full flex-wrap items-end rounded-lg border bg-inherit px-2.5 shadow-sm transition-colors ease-in">
        <ComposerPrimitive.Input
          rows={1}
          autoFocus
          placeholder="Write a message..."
          className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
          disabled={disabled}
        />
        {/* Send button moved outside */}
      </ComposerPrimitive.Root>
    </div>
  );
};

const ComposerAction: FC<{ disabled?: boolean }> = ({ disabled }) => {
  return (
    <>
      <ThreadPrimitive.If running={false}>
        <ComposerPrimitive.Send asChild>
          <TooltipIconButton
            tooltip="Send"
            variant="default"
            className="my-2.5 size-8 p-2 transition-opacity ease-in"
            disabled={disabled}
          >
            <SendHorizontalIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Send>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If running>
        <ComposerPrimitive.Cancel asChild>
          <TooltipIconButton
            tooltip="Cancel"
            variant="default"
            className="my-2.5 size-8 p-2 transition-opacity ease-in"
            disabled={disabled}
          >
            <CircleStopIcon />
          </TooltipIconButton>
        </ComposerPrimitive.Cancel>
      </ThreadPrimitive.If>
    </>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="grid w-full auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 py-4 [&:where(>*)]:col-start-2">
      <UserActionBar />

      <div className="bg-muted text-foreground col-start-2 row-start-2 break-words rounded-3xl px-5 py-2.5">
        <MessagePrimitive.Parts />
      </div>

      <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="col-start-1 row-start-2 mr-3 mt-2.5 flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="bg-muted my-4 flex w-full flex-col gap-2 rounded-xl">
      <ComposerPrimitive.Input className="text-foreground flex h-8 w-full resize-none bg-transparent p-4 pb-0 outline-none" />

      <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost">Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

// const AssistantMessage: FC = () => {
//   return (
//     <MessagePrimitive.Root className="relative grid w-full grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] py-4">
//       <div className="text-foreground col-span-2 col-start-2 row-start-1 my-1.5 break-words leading-7">
//         <MessagePrimitive.Parts
//           components={{
//             Text: TextMessagePartAdapter,
//             tools: { Fallback: ToolFallback },
//             Reasoning: ReasoningContent
//           }}
//         />
//         <MessageError />
//       </div>
//
//       <AssistantActionBar />
//
//       <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2" />
//     </MessagePrimitive.Root>
//   );
// };

// Custom Group component for parent ID grouping
const ParentIdGroup: FC<
  PropsWithChildren<{ groupKey: string | undefined; indices: number[] }>
> = ({ groupKey, indices, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!groupKey) {
    // Ungrouped parts - just render them directly
    return <>{children}</>;
  }

  return (
    <div className="border-border/50 bg-muted/20 my-2 overflow-hidden rounded-lg border">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hover:bg-muted/40 flex w-full items-center justify-between px-4 py-2 text-sm font-medium transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-muted-foreground">Research Group:</span>
          <span className="text-foreground">
            {groupKey === "research-climate-causes" && "Climate Change Causes"}
            {groupKey === "research-climate-effects" &&
              "Climate Change Effects"}
            {groupKey === "new-research" && "Recent Research"}
            {![
              "research-climate-causes",
              "research-climate-effects",
              "new-research",
            ].includes(groupKey) && groupKey}
          </span>
          <span className="text-muted-foreground text-xs">
            ({indices.length} parts)
          </span>
        </span>
        {isCollapsed ? (
          <ChevronDownIcon className="h-4 w-4" />
        ) : (
          <ChevronUpIcon className="h-4 w-4" />
        )}
      </button>
      {!isCollapsed && <div className="space-y-2 px-4 py-2">{children}</div>}
    </div>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative grid w-full max-w-[var(--thread-max-width)] grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] py-4">
      <div className="text-foreground col-span-2 col-start-2 row-start-1 my-1.5 max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7">
        <MessagePrimitive.Unstable_PartsGroupedByParentId
          components={{
            Text: MarkdownText,
            Group: ParentIdGroup,
            Reasoning: ReasoningContent,
            Source: ({ url, title }) => (
              <div className="text-muted-foreground text-sm">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  📄 {title || url}
                </a>
              </div>
            ),
            tools: {
              Fallback: ToolFallback,
            },
          }}
        />
      </div>

      <AssistantActionBar />

      <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2" />
    </MessagePrimitive.Root>
  );
};

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="border-destructive bg-destructive/10 dark:bg-destructive/5 text-destructive mt-2 rounded-md border p-3 text-sm dark:text-red-200">
        <ErrorPrimitive.Message className="line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="text-muted-foreground data-[floating]:bg-background col-start-3 row-start-2 -ml-1 flex gap-1 data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "text-muted-foreground inline-flex items-center text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};

const CircleStopIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      width="16"
      height="16"
    >
      <rect width="10" height="10" x="3" y="3" rx="2" />
    </svg>
  );
};

// Terminal selector component
const TerminalSelector: FC<{
  availableTerminals: TerminalOption[];
  selectedTerminals: string[];
  currentTerminal: string;
  onSelectionChange: (selectedTerminals: string[]) => void;
  includeCurrentTerminal: boolean;
  onIncludeCurrentTerminalChange: (include: boolean) => void;
  disabled: boolean;
}> = ({
  availableTerminals,
  selectedTerminals,
  currentTerminal,
  onSelectionChange,
  includeCurrentTerminal,
  onIncludeCurrentTerminalChange,
  disabled,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">(
    "bottom",
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current terminal info
  const currentTerminalInfo = availableTerminals.find(
    (t) => t.key === currentTerminal,
  );

  // Other selected terminals (excluding current)
  const otherSelectedTerminals = selectedTerminals.filter(
    (key) => key !== currentTerminal,
  );

  // Other available terminals (excluding current & already selected)
  const otherAvailableTerminals = availableTerminals.filter(
    (t) => t.key !== currentTerminal && !selectedTerminals.includes(t.key),
  );

  // Add terminal to selection list
  const addTerminal = (terminalKey: string) => {
    const newSelected = [...selectedTerminals, terminalKey];
    onSelectionChange(newSelected);
    setDropdownOpen(false);
  };

  // Remove terminal from selection list (except current)
  const removeTerminal = (terminalKey: string) => {
    if (terminalKey === currentTerminal) {
      onIncludeCurrentTerminalChange(false);
    } else {
      const newSelected = selectedTerminals.filter(
        (key) => key !== terminalKey,
      );
      onSelectionChange(newSelected);
    }
  };

  // Toggle inclusion of current terminal
  const toggleCurrentTerminal = () => {
    onIncludeCurrentTerminalChange(!includeCurrentTerminal);
  };

  // Compute optimal dropdown position
  const calculateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return "bottom";
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedDropdownHeight = Math.min(
      otherAvailableTerminals.length * 32 + 8,
      192,
    );
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    if (spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow) {
      return "top";
    }
    return "bottom";
  }, [otherAvailableTerminals.length]);

  // Calculate position when opening
  const handleDropdownToggle = () => {
    if (!dropdownOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
    setDropdownOpen(!dropdownOpen);
  };

  // Recalculate position on window resize
  useEffect(() => {
    if (dropdownOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
  }, [dropdownOpen, calculateDropdownPosition]);

  return (
    <div className="w-full px-3 py-2 rounded-lg">
      <div className="flex flex-col gap-2">
        {/* Header row */}
        {/*<div className="flex items-center justify-between">*/}
        {/*  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">*/}
        {/*    Select Terminals:*/}
        {/*  </label>*/}
        {/*  <span className="text-xs text-gray-500 dark:text-gray-500">*/}
        {/*    ({(includeCurrentTerminal ? 1 : 0) + otherSelectedTerminals.length} terminals)*/}
        {/*  </span>*/}
        {/*</div>*/}

        {/* Selected terminals display */}
        <div className="flex flex-wrap gap-1 min-h-[24px] items-center">
          {/* Current terminal - always shown */}
          {currentTerminalInfo && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                includeCurrentTerminal
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600"
              }`}
            >
              <span className="text-xs">🖥️</span>
              <span>{currentTerminalInfo.label}</span>
              <span className="text-xs font-semibold">(current)</span>
              <button
                onClick={toggleCurrentTerminal}
                disabled={disabled}
                className={`ml-1 w-3 h-3 rounded-sm flex items-center justify-center text-xs ${
                  includeCurrentTerminal
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-400 text-white hover:bg-gray-500"
                } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                title={includeCurrentTerminal ? "Click to deselect" : "Click to select"}
              >
                {includeCurrentTerminal ? "✓" : "○"}
              </button>
            </div>
          )}

          {/* Other selected terminals */}
          {otherSelectedTerminals.map((terminalKey) => {
            const terminal = availableTerminals.find(
              (t) => t.key === terminalKey,
            );
            if (!terminal) return null;

            return (
              <div
                key={terminalKey}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
              >
                <span className="text-xs">🖥️</span>
                <span>{terminal.label}</span>
                <button
                  onClick={() => removeTerminal(terminalKey)}
                  disabled={disabled}
                  className="ml-1 w-3 h-3 rounded-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs transition-colors"
                  title="Remove terminal"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Add terminal button */}
          {otherAvailableTerminals.length > 0 && (
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={handleDropdownToggle}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded text-gray-500 dark:text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>+</span>
                <span>Add Terminal</span>
              </button>

              {/* Auto-positioned dropdown */}
              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  className={`absolute left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 min-w-[120px] max-h-48 overflow-y-auto ${
                    dropdownPosition === "top"
                      ? "bottom-full mb-1 mt-0"
                      : "top-full"
                  }`}
                >
                  {otherAvailableTerminals.map((terminal) => (
                    <button
                      key={terminal.key}
                      onClick={() => addTerminal(terminal.key)}
                      className="w-full px-3 py-2 text-xs text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-xs">🖥️</span>
                      <span>{terminal.label}</span>
                      {!terminal.isActive && (
                        <span className="text-xs text-orange-500">
                          (not connected)
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hint when no terminals selected */}
          {!includeCurrentTerminal && otherSelectedTerminals.length === 0 && (
            <span className="text-xs text-orange-500 dark:text-orange-400">
              No terminal selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
