import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NetworkIcon } from "@web3icons/react";
import { supabase } from "@/lib/supabase";

interface AddAirdropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (airdrop: any) => void;
}

const chains = ["Ethereum", "Solana", "Polygon", "BSC", "Arbitrum", "Optimism"];
const stages = ["Waitlist", "Testnet", "Early Access", "Mainnet"];
const types = ["Retroactive", "Testnet", "Mini App", "Node"];
const statuses = ["pending", "active", "completed", "failed"];

const AddAirdropModal: React.FC<AddAirdropModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    project: "",
    status: "pending",
    link: "",
    twitter: "",
    notes: "",
    chain: "Ethereum",
    stage: "Testnet",
    type: "Mini App",
    cost: "",
    tags: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project) {
      setError("Project name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Get current user from localStorage
      const authState = localStorage.getItem("auth_state");
      if (!authState) {
        throw new Error("You must be logged in to add an airdrop");
      }

      const { username } = JSON.parse(authState);
      if (!username) {
        throw new Error("Invalid authentication state");
      }

      // Insert into user_airdrops table
      const { data, error: insertError } = await supabase
        .from("user_airdrops")
        .insert([
          {
            username,
            project: formData.project,
            status: formData.status,
            link: formData.link,
            twitter: formData.twitter,
            notes: formData.notes,
            chain: formData.chain,
            stage: formData.stage,
            type: formData.type,
            cost: formData.cost ? parseFloat(formData.cost) : null,
            tags: formData.tags,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      onAdd(data);
      onClose();
    } catch (err) {
      console.error("Error adding airdrop:", err);
      setError(err.message || "Failed to add airdrop");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sketch-card w-[95%] sm:w-[800px] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 mb-4">
          <DialogTitle className="text-xl font-bold sketch-font text-white">
            Add New Airdrop
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Project Name *
                </label>
                <Input
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  className="sketch-input"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md sketch-input px-3 py-2 text-sm bg-background text-foreground"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Project Link
                </label>
                <Input
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="sketch-input"
                  placeholder="https://"
                  type="url"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Twitter
                </label>
                <Input
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="sketch-input"
                  placeholder="@username or URL"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="sketch-input min-h-[100px] resize-none"
                  placeholder="Add any notes about this airdrop"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Chain</label>
                <select
                  name="chain"
                  value={formData.chain}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md sketch-input px-3 py-2 text-sm bg-background text-foreground"
                >
                  {chains.map((chain) => (
                    <option key={chain} value={chain}>
                      {chain}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { id: "ethereum", name: "Ethereum" },
                    { id: "solana", name: "Solana" },
                    { id: "polygon", name: "Polygon" },
                    { id: "binance-smart-chain", name: "BSC" },
                    { id: "arbitrum", name: "Arbitrum" },
                    { id: "optimism", name: "Optimism" },
                  ].map((chain) => (
                    <button
                      key={chain.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, chain: chain.name })
                      }
                      className={`flex items-center gap-1 px-2 py-1 rounded-md border ${formData.chain === chain.name ? "border-blue-500 bg-blue-500/20" : "border-white/10 hover:border-white/30"} transition-colors`}
                    >
                      <NetworkIcon
                        name={chain.id}
                        size={16}
                        className="text-white/80"
                        fallback={null}
                      />
                      <span className="text-xs">{chain.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Stage</label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md sketch-input px-3 py-2 text-sm bg-background text-foreground"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md sketch-input px-3 py-2 text-sm bg-background text-foreground"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Cost ($)
                </label>
                <Input
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="sketch-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter cost"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Tags</label>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="sketch-input"
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-white/50 mt-1">
                  Example: DeFi, GameFi, NFT
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-600 text-red-200 px-4 py-2 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-sm sketch-font mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 border-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Adding Airdrop...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                <span>Add Airdrop</span>
              </div>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAirdropModal;
