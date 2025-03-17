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
import { ImagePlus, Twitter } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: any) => void;
}

const chains = ["Ethereum", "Solana", "Polygon", "BSC", "Arbitrum", "Optimism"];
const stages = ["Waitlist", "Testnet", "Early Access", "Mainnet"];
const types = ["Retroactive", "Testnet", "Mini App", "Node"];
const statuses = ["pending", "active", "completed", "failed"];

const AddProjectModal: React.FC<AddProjectModalProps> = ({
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
    logo: "",
    useTwitterProfileImage: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setFormData((prev) => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
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
        throw new Error("You must be logged in to add a project");
      }

      const { username } = JSON.parse(authState);
      if (!username) {
        throw new Error("Invalid authentication state");
      }

      // Determine logo source
      let logoUrl = formData.logo;

      if (!logoUrl) {
        logoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.project}`;
      }

      // Get tags from input
      const tagsInput = document.querySelector(
        "#tags-input",
      ) as HTMLInputElement;

      // Get tags from input and ensure it's a valid array
      const tagsArray = tagsInput?.value
        ? tagsInput.value
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [];

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
            tags: tagsArray,
            join_date: new Date().toISOString().split("T")[0],
            image: logoUrl,
            last_activity: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Dispatch loading events
      window.dispatchEvent(new Event("projectsLoadingStarted"));

      try {
        // Add the new project to the UI immediately
        onAdd(data);

        // Then refresh all projects in the background to ensure we have the latest data
        const { data: refreshedProjects } = await supabase
          .from("user_airdrops")
          .select("*")
          .eq("username", username)
          .order("last_activity", { ascending: false });

        if (refreshedProjects) {
          localStorage.setItem(
            "user_projects",
            JSON.stringify(refreshedProjects),
          );
          window.dispatchEvent(
            new CustomEvent("projectsLoaded", { detail: refreshedProjects }),
          );
        }
      } catch (refreshError) {
        console.error("Error refreshing projects after add:", refreshError);
        // We already added the new project to the UI, so no need to do it again
      } finally {
        window.dispatchEvent(new Event("projectsLoadingFinished"));
        onClose();
      }
    } catch (err) {
      console.error("Error adding project:", err);
      setError(err.message || "Failed to add project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sketch-card fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[800px] max-w-4xl h-fit rounded-lg transform transition-all duration-300 ease-in-out bg-background border-2 border-white/10 shadow-2xl overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 mb-4">
          <DialogTitle className="text-2xl font-bold sketch-font text-white">
            Add New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-24 h-24 rounded-lg overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/10 transition-all flex-shrink-0 group"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/70 group-hover:text-white gap-2 transition-colors">
                      <ImagePlus size={24} />
                      <div className="text-xs text-center font-medium">
                        Upload Logo
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                      Project Name <span className="text-blue-400">*</span>
                    </label>
                    <Input
                      value={formData.project}
                      onChange={(e) =>
                        setFormData({ ...formData, project: e.target.value })
                      }
                      className="sketch-input h-10"
                      placeholder="Enter project name"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                      Project Link <span className="text-blue-400">*</span>
                    </label>
                    <Input
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      className="sketch-input h-10"
                      placeholder="https://"
                      type="url"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                      Twitter Link
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.twitter}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            twitter: e.target.value,
                          })
                        }
                        className="sketch-input h-10 flex-1"
                        placeholder="https://twitter.com/"
                        type="url"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 sketch-button"
                        onClick={() => {
                          if (formData.twitter) {
                            window.open(formData.twitter, "_blank");
                          }
                        }}
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="use-twitter-image"
                        checked={formData.useTwitterProfileImage}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            useTwitterProfileImage: checked,
                          })
                        }
                      />
                      <label
                        htmlFor="use-twitter-image"
                        className="text-sm text-white/70 cursor-pointer"
                      >
                        Use logo
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                  Chain <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={formData.chain}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, chain: value });
                    }}
                    className="sketch-input h-10 w-full pl-10"
                    placeholder="Search chain..."
                    list="chain-options"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <NetworkIcon
                      name={
                        formData.chain.toLowerCase() === "bsc"
                          ? "binance-smart-chain"
                          : formData.chain.toLowerCase()
                      }
                      size={20}
                      className="text-white/80"
                      fallback={null}
                    />
                  </div>
                  <datalist id="chain-options">
                    {chains.map((chain) => (
                      <option key={chain} value={chain}>
                        {chain}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { id: "ethereum", name: "Ethereum" },
                    { id: "solana", name: "Solana" },
                    { id: "polygon", name: "Polygon" },
                    { id: "arbitrum", name: "Arbitrum" },
                    { id: "optimism", name: "Optimism" },
                    { id: "avalanche", name: "Avalanche" },
                    { id: "binance-smart-chain", name: "BSC" },
                  ].map((chain) => (
                    <button
                      key={chain.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          chain: chain.name,
                        })
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
                <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                  Notes
                </label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="sketch-input min-h-[100px] resize-none"
                  placeholder="Add any notes about this project"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full h-10 rounded-md sketch-input px-3 py-2 text-sm sketch-font bg-background text-foreground focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                  Stage <span className="text-blue-400">*</span>
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) =>
                    setFormData({ ...formData, stage: e.target.value })
                  }
                  className="w-full h-10 rounded-md sketch-input px-3 py-2 text-sm sketch-font bg-background text-foreground focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                  Type <span className="text-blue-400">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value,
                    })
                  }
                  className="w-full h-10 rounded-md sketch-input px-3 py-2 text-sm sketch-font bg-background text-foreground focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                  Cost ($) <span className="text-blue-400">*</span>
                </label>
                <Input
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  className="sketch-input h-10"
                  type="number"
                  min="0"
                  placeholder="Enter cost"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                  Tags
                </label>
                <Input
                  placeholder="Enter tags separated by commas"
                  className="sketch-input h-10"
                  id="tags-input"
                  defaultValue={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
                <p className="text-xs text-white/50 mt-1">
                  Example: DeFi, GameFi, NFT
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                  Join Date
                </label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="sketch-input h-10"
                  id="join-date-input"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-600 text-red-200 px-4 py-2 rounded-md mt-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-sm sketch-font mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 border-none"
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
                <span>Adding Project...</span>
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
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>Add Project</span>
              </div>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectModal;
