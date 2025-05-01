import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NetworkIcon } from "@web3icons/react";
import { ImagePlus, Twitter, Globe } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { getTwitterProfileImageFromUrl } from "@/lib/twitter";
import { Project } from "@/types/schema";

interface EditProjectModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (project: Project) => void;
  project?: Project;
}

const chains = [
  "Ethereum",
  "Solana",
  "Polygon",
  "BSC",
  "Arbitrum",
  "Optimism",
  "Monad",
];
const stages = ["Waitlist", "Testnet", "Early Access", "Mainnet"];
const types = ["Retroactive", "Testnet", "Mini App", "Node"] as const;

const EditProjectModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  project = {
    id: "",
    name: "",
    logo: "",
    link: "",
    twitterLink: "",
    isActive: true,
    lastActivity: new Date().toISOString(),
    notes: "",
    joinDate: new Date().toISOString(),
    chain: "Ethereum",
    stage: "Early Access" as const,
    tags: [],
    type: "Mini App" as const,
    cost: 0,
  },
}: EditProjectModalProps) => {
  const [formData, setFormData] = React.useState({
    name: project.name,
    link: project.link,
    twitterLink: project.twitterLink || "",
    chain: project.chain,
    stage: project.stage,
    type: project.type,
    cost: project.cost.toString(),
    logo: project.logo,
    useTwitterProfileImage: false,
  });

  React.useEffect(() => {
    if (project) {
      const twitterLink = project.twitter || project.twitterLink || "";
      const shouldUseTwitterImage =
        Boolean(twitterLink) && !project.image && !project.logo;

      setFormData({
        name: project.project || project.name || "",
        link: project.link || "",
        twitterLink: twitterLink,
        chain: project.chain || "Ethereum",
        stage: project.stage || "Testnet",
        type: project.type || "Mini App",
        cost: (project.cost || 0).toString(),
        logo: project.image || project.logo || "",
        useTwitterProfileImage: shouldUseTwitterImage,
      });
      setPreviewUrl(project.image || project.logo || "");

      // If we should use Twitter image but don't have a preview yet, try to fetch it
      if (
        shouldUseTwitterImage &&
        twitterLink &&
        !project.image &&
        !project.logo
      ) {
        fetchTwitterProfileImage(twitterLink);
      }
    }
  }, [project]);

  const fetchTwitterProfileImage = async (twitterUrl: string) => {
    try {
      const twitterProfileImage =
        await getTwitterProfileImageFromUrl(twitterUrl);
      if (twitterProfileImage) {
        setPreviewUrl(twitterProfileImage);
      }
    } catch (error) {
      console.error("Error fetching Twitter profile image:", error);
    }
  };

  const [previewUrl, setPreviewUrl] = React.useState(project.logo);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);

      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${project.id || Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `project-logos/${fileName}`;

        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase.storage
          .from("logos")
          .upload(filePath, file, { upsert: true });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("logos")
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          setFormData((prev) => ({ ...prev, logo: urlData.publicUrl }));
        } else {
          // Fallback to base64 if URL retrieval fails
          setFormData((prev) => ({ ...prev, logo: reader.result as string }));
        }
      } catch (error) {
        console.error("Error uploading image to Supabase:", error);
        // Fallback to base64 if upload fails
        setFormData((prev) => ({ ...prev, logo: reader.result as string }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Determine logo source
      let logoUrl = formData.logo;

      if (formData.useTwitterProfileImage && formData.twitterLink) {
        try {
          const twitterProfileImage = await getTwitterProfileImageFromUrl(
            formData.twitterLink,
          );
          if (twitterProfileImage) {
            logoUrl = twitterProfileImage;
            console.log("Using Twitter profile image:", twitterProfileImage);
          }
        } catch (error) {
          console.error("Error getting Twitter profile image:", error);
        }
      }

      if (!logoUrl) {
        logoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`;
      }

      // Get tags from input
      const tagsInput = document.querySelector(
        "#tags-input",
      ) as HTMLInputElement;
      // Get join date from input
      const joinDateInput = document.querySelector(
        "#join-date-input",
      ) as HTMLInputElement;
      const joinDate = joinDateInput?.value
        ? new Date(joinDateInput.value).toISOString()
        : project.joinDate;

      // Get tags from input and ensure it's a valid array
      const tagsArray = tagsInput?.value
        ? tagsInput.value
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : Array.isArray(project.tags)
          ? project.tags
          : [];

      // Save to database directly
      try {
        // Add a small delay to ensure any previous operations are complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        const { supabase } = await import("@/lib/supabase");
        console.log("Updating project in database with ID:", project.id);

        // Get current username from localStorage
        const authState = localStorage.getItem("auth_state");
        if (!authState) {
          console.error("No auth_state found in localStorage");
          throw new Error("You must be logged in to update a project");
        }

        let username = "";
        try {
          const parsedState = JSON.parse(authState);
          console.log("Parsed auth state:", parsedState);
          username = parsedState.username || parsedState.user?.username || "";
          if (!username) {
            console.error("Username not found in auth state", parsedState);
            throw new Error("Username not found in auth state");
          }
        } catch (parseError) {
          console.error("Error parsing auth state:", parseError);
          throw new Error("Invalid authentication state");
        }

        const updateData = {
          project: formData.name,
          link: formData.link,
          twitter: formData.twitterLink,
          chain: formData.chain,
          stage: formData.stage,
          type: formData.type,
          cost: Number(formData.cost) || 0,
          image: logoUrl,
          last_activity: new Date().toISOString(),
          join_date: joinDate,
          tags: tagsArray.join(", "),
          status: project.status || (project.isActive ? "active" : "pending"),
          notes: project.notes,
          username: username, // Ensure username is included
        };

        // Remove any undefined or null values
        Object.keys(updateData).forEach((key) => {
          // @ts-ignore
          if (updateData[key] === undefined || updateData[key] === null) {
            // @ts-ignore
            delete updateData[key];
          }
        });

        console.log("Update data:", updateData);

        // First try to update
        console.log("Attempting to update with data:", updateData);
        console.log("Project ID:", project.id);

        const { data, error } = await supabase
          .from("user_airdrops")
          .update(updateData)
          .eq("id", project.id)
          .select();

        console.log("Update response:", { data, error });

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.warn("No data returned from update operation");
        }

        console.log("Database update response:", data);

        // Immediately fetch the updated record to confirm changes
        try {
          const { data: verifyData, error: verifyError } = await supabase
            .from("user_airdrops")
            .select("*")
            .eq("id", project.id)
            .single();

          if (verifyError) {
            console.error("Error verifying update:", verifyError);
          } else {
            console.log("Verified updated record:", verifyData);
          }
        } catch (verifyFetchError) {
          console.error(
            "Exception during verification fetch:",
            verifyFetchError,
          );
          // Don't throw here, just log the error
        }

        // Force refresh projects
        window.dispatchEvent(new Event("forceDataReload"));
      } catch (dbError) {
        console.error("Error updating project in database:", dbError);
        throw dbError;
      }

      const updatedProject: Project = {
        ...project,
        name: formData.name,
        project: formData.name, // Add project field to match database
        link: formData.link,
        twitterLink: formData.twitterLink,
        twitter: formData.twitterLink, // Add twitter field to match database
        chain: formData.chain,
        stage: formData.stage,
        type: formData.type,
        cost: Number(formData.cost) || 0,
        logo: logoUrl,
        image: logoUrl,
        lastActivity: new Date().toISOString(),
        last_activity: new Date().toISOString(), // Add last_activity field to match database
        joinDate: joinDate,
        join_date: joinDate, // Add join_date field to match database
        tags: tagsArray,
        isActive: project.isActive || project.status === "active",
        status: project.status || (project.isActive ? "active" : "pending"),
      };

      onSave(updatedProject);
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);

      // Get detailed error message
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMessage = JSON.stringify(error);
      }

      alert(`Failed to update project: ${errorMessage}`);

      // Try to log more details about the error
      if (error && typeof error === "object") {
        console.log("Error details:", Object.keys(error));
        // @ts-ignore
        if (error.code) console.log("Error code:", error.code);
        // @ts-ignore
        if (error.details) console.log("Error details:", error.details);
        // @ts-ignore
        if (error.hint) console.log("Error hint:", error.hint);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sketch-card fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[800px] max-w-4xl max-h-[90vh] rounded-lg transform transition-all duration-300 ease-in-out bg-background border-2 border-white/10 shadow-2xl overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 mb-4">
          <DialogTitle className="text-2xl font-bold sketch-font text-white">
            Edit Project
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-120px)] overflow-x-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex flex-col items-center gap-2">
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
                  <p className="text-xs text-center text-white/70 w-24">
                    {formData.useTwitterProfileImage
                      ? "Using Twitter profile image"
                      : "Use project twitter logo"}
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/90 sketch-font block mb-2">
                      Project Name <span className="text-blue-400">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
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
                        value={formData.twitterLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            twitterLink: e.target.value,
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
                          if (formData.twitterLink) {
                            window.open(formData.twitterLink, "_blank");
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
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            useTwitterProfileImage: checked,
                          });

                          // If enabling Twitter profile image and we have a Twitter link, fetch the image
                          if (checked && formData.twitterLink) {
                            fetchTwitterProfileImage(formData.twitterLink);
                          }
                        }}
                      />
                      <label
                        htmlFor="use-twitter-image"
                        className="text-sm text-white/70 cursor-pointer"
                      >
                        Use Twitter profile image
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
                    { id: "monad", name: "Monad" },
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
            </div>

            {/* Right Column */}
            <div className="space-y-6 flex flex-col justify-between">
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
                      type: e.target.value as
                        | "Retroactive"
                        | "Testnet"
                        | "Mini App"
                        | "Node",
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
                  defaultValue={
                    Array.isArray(project.tags) ? project.tags.join(", ") : ""
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
                  defaultValue={
                    new Date(project.joinDate).toISOString().split("T")[0]
                  }
                  className="sketch-input h-10"
                  id="join-date-input"
                />
              </div>
            </div>
          </div>

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
                <span>Saving Changes...</span>
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
                <span>Save Changes</span>
              </div>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
