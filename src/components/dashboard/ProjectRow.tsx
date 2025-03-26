import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { NetworkIcon } from "@web3icons/react";
import { Copy, ExternalLink, FileText, Pencil, Trash2 } from "lucide-react";

interface ProjectRowProps {
  visibleColumns?: Record<string, boolean>;
  projectName: string;
  projectLogo: string;
  projectLink: string;
  twitterLink: string;
  isActive: boolean;
  lastActivity: string;
  notes?: string;
  onStatusChange?: (status: boolean) => void;
  onNotesClick?: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
  isFullMode?: boolean;
  type?: string;
  cost?: number;
  joinDate?: string;
  chain?: string;
  stage?: string;
  tags?: string[];
  isPublicMode?: boolean;
  isOwnProfile?: boolean;
  onCopyProject?: () => void;
  isCopied?: boolean;
}

// Chain color mapping
const chainColors = {
  ethereum: "text-blue-400",
  solana: "text-purple-400",
  polygon: "text-indigo-400",
  bsc: "text-yellow-400",
  arbitrum: "text-blue-500",
  optimism: "text-red-400",
  avalanche: "text-red-500",
  sui: "text-blue-300",
  aptos: "text-blue-600",
  base: "text-blue-400",
  zksync: "text-purple-500",
  starknet: "text-pink-400",
  monad: "text-orange-500",
  cosmos: "text-purple-300",
  polkadot: "text-pink-500",
  near: "text-blue-300",
  flow: "text-green-400",
  tezos: "text-blue-500",
  algorand: "text-green-500",
  default:
    "bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500",
};

// Chain icon fallbacks - ensure we always have a fallback icon
const chainIcons = {
  ethereum: "⟠",
  solana: "◎",
  polygon: "⬡",
  bsc: "⛓",
  arbitrum: "⚡",
  optimism: "⚡",
  avalanche: "❄",
  sui: "⚪",
  aptos: "⚪",
  base: "⚪",
  zksync: "⚡",
  starknet: "⚡",
  monad: "⚫",
  default: "💀",
};

const ProjectRow = ({
  projectName,
  projectLogo,
  projectLink,
  twitterLink,
  isActive,
  lastActivity,
  notes,
  onStatusChange = () => {},
  onNotesClick = () => {},
  onDelete = () => {},
  showDeleteButton = false,
  showEditButton = false,
  isFullMode = true,
  type = "Mini App",
  cost = 0,
  joinDate = new Date().toISOString(),
  chain = "Ethereum",
  stage = "Testnet",
  tags = [],
  isPublicMode = false,
  isOwnProfile = true,
  onCopyProject = () => {},
  isCopied = false,
  visibleColumns = {
    Project: true,
    Status: true,
    Link: true,
    Twitter: true,
    Notes: true,
    "Join Date": true,
    Chain: true,
    Stage: true,
    Tags: true,
    Type: true,
    Cost: true,
    "Last Activity": true,
  },
}: ProjectRowProps) => {
  // Get chain color based on chain name
  const getChainColor = (chainName: string) => {
    if (!chainName) return chainColors.default;
    const normalizedChain = chainName.toLowerCase();
    return chainColors[normalizedChain] || chainColors.default;
  };

  // Ensure chain is never empty for icon display
  const safeChain = chain || "default";

  return (
    <TableRow className="border-b border-gray-800">
      <TableCell className="font-medium p-2 text-left">
        <div className="flex items-center gap-3 pl-2">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border-2 border-gray-600 cursor-pointer shadow-md">
            <img
              src={projectLogo}
              alt={projectName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${projectName}`;
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white truncate max-w-[200px] font-medium">
              {projectName}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <div>
                <NetworkIcon
                  name={
                    safeChain.toLowerCase() === "bsc"
                      ? "binance-smart-chain"
                      : safeChain.toLowerCase()
                  }
                  size={14}
                  className={getChainColor(safeChain)}
                  fallback={
                    <span
                      className={`text-xs ${safeChain.toLowerCase() in chainIcons ? getChainColor(safeChain) : "text-blue-500"} font-bold`}
                    >
                      {chainIcons[safeChain.toLowerCase()] || safeChain}
                    </span>
                  }
                />
              </div>
              {stage && (
                <span className="text-xs text-blue-400/80 ml-2">{stage}</span>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      {!isPublicMode && visibleColumns.Status && (
        <TableCell className="text-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStatusChange(!isActive)}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"} border border-gray-600`}
          >
            {isActive ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 md:h-5 md:w-5"
              >
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 md:h-5 md:w-5"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            )}
          </Button>
        </TableCell>
      )}
      {visibleColumns.Link && (
        <td className="p-4 text-center">
          {showDeleteButton ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${showDeleteButton ? "text-red-500" : ""}`}
            >
              <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(projectLink, "_blank")}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-600 bg-transparent"
            >
              <ExternalLink className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            </Button>
          )}
        </td>
      )}
      {visibleColumns.Twitter && (
        <td className="p-4 text-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(twitterLink, "_blank")}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-600 bg-transparent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 md:h-5 md:w-5 text-cyan-400"
            >
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </Button>
        </td>
      )}
      {visibleColumns.Notes && (
        <td className="p-4 text-center">
          {onNotesClick !== (() => {}) && !isPublicMode ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotesClick}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-600 bg-transparent"
            >
              {showEditButton ? (
                <Pencil className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
              ) : (
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
              )}
            </Button>
          ) : isPublicMode && !isOwnProfile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCopyProject}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-600 bg-transparent ${isCopied ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500/10"}`}
              title={
                isCopied
                  ? "Already copied to your projects"
                  : "Copy to my projects"
              }
              disabled={isCopied}
            >
              <Copy
                className={`h-4 w-4 md:h-5 md:w-5 ${isCopied ? "text-gray-400" : "text-blue-400"}`}
              />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {}}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-600 bg-transparent"
            >
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
            </Button>
          )}
        </td>
      )}
      {(isFullMode || isPublicMode) && (
        <>
          {visibleColumns["Join Date"] && (
            <td className="p-2 text-center">
              <span className="text-[0.8rem] text-amber-400 whitespace-nowrap">
                {(() => {
                  try {
                    const date = new Date(joinDate);
                    if (isNaN(date.getTime())) {
                      return <div>Invalid date</div>;
                    }

                    const today = new Date();
                    const diffTime = Math.abs(today.getTime() - date.getTime());
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24),
                    );

                    return (
                      <div className="flex flex-col items-center">
                        <div>{`${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${String(date.getFullYear()).slice(2)}`}</div>
                        <div className="text-xs text-cyan-400 mt-1">
                          {diffDays} {diffDays === 1 ? "day" : "days"}
                        </div>
                      </div>
                    );
                  } catch (error) {
                    return <div>Invalid date</div>;
                  }
                })()}
              </span>
            </td>
          )}

          {visibleColumns.Chain && (
            <td className="p-2 text-center">
              <div className="flex justify-center">
                <NetworkIcon
                  name={
                    safeChain.toLowerCase() === "bsc"
                      ? "binance-smart-chain"
                      : safeChain.toLowerCase()
                  }
                  size={24}
                  className={getChainColor(safeChain)}
                  fallback={
                    <span
                      className={`text-lg ${safeChain.toLowerCase() in chainIcons ? getChainColor(safeChain) : "text-blue-500"} font-bold`}
                    >
                      {chainIcons[safeChain.toLowerCase()] || safeChain}
                    </span>
                  }
                />
              </div>
            </td>
          )}

          {visibleColumns.Stage && (
            <td className="p-2 text-center">
              <span className="text-[0.8rem] text-blue-400/80 font-medium">
                {stage || "Unknown"}
              </span>
            </td>
          )}

          {visibleColumns.Tags && (
            <td className="p-2 text-center">
              <div className="flex gap-1 justify-center flex-wrap">
                {Array.isArray(tags) && tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {tags.map((tag, index) => {
                      // Use a single color instead of gradients for better performance
                      const colorClass = "bg-blue-500";

                      return (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full text-white border border-gray-600 ${colorClass}`}
                        >
                          {typeof tag === "string"
                            ? tag
                                .replace(/[\[\]"]/g, "")
                                .replace(/[^a-zA-Z]/g, "")
                            : tag}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1 justify-center">
                    <span className="px-2 py-1 text-xs rounded-full text-white border border-gray-600 bg-blue-500">
                      Airdrop
                    </span>
                  </div>
                )}
              </div>
            </td>
          )}
          {visibleColumns.Type && (
            <td className="p-2 text-center">
              <span className="text-[0.8rem] text-purple-400 font-medium">
                {type}
              </span>
            </td>
          )}
          {visibleColumns.Cost && (
            <td className="p-2 text-center">
              <span className="text-[0.8rem] text-green-400 font-medium">
                ${cost}
              </span>
            </td>
          )}
        </>
      )}
      {!isPublicMode && visibleColumns["Last Activity"] && (
        <td className="p-4 text-center">
          <span className="text-[0.8rem] text-blue-400 font-medium whitespace-nowrap">
            {(() => {
              try {
                const activityDate = new Date(lastActivity);
                if (isNaN(activityDate.getTime())) {
                  return "Invalid date";
                }

                // Format time to show in 24-hour format with WIB timezone
                return (
                  activityDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }) + " WIB"
                );
              } catch (error) {
                return "Invalid date";
              }
            })()}
          </span>
        </td>
      )}
    </TableRow>
  );
};

export default ProjectRow;
