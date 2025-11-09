"use client";

import { CollectionConfig } from "@/lib/types";
import { Tables } from "@/lib/supabase/types";
import { CollectionDefinitionEditor } from "@/components/collections/collection-definition-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateCollectionConfig, updateCollectionMetadata } from "./actions";
import { toast } from "sonner";
import { SaveIcon, CheckIcon, PencilIcon } from "lucide-react";
import { IconPicker } from "@/components/ui/icon-picker";
import { IconName } from "lucide-react/dynamic";
import { useState } from "react";

type Collection = Tables<"collections">;

interface CollectionEditClientProps {
  collection: Collection;
}

export function CollectionEditClient({
  collection,
}: CollectionEditClientProps) {
  const [config, setConfig] = useState<CollectionConfig>(
    (collection.config as CollectionConfig) || {
      customFields: [],
      builtInFields: {},
    },
  );
  const [label, setLabel] = useState(collection.label);
  const [icon, setIcon] = useState(collection.icon || "");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleConfigChange = (newConfig: CollectionConfig) => {
    console.log(newConfig);
    setConfig(newConfig);
    setHasChanges(true);
  };

  const handleMetadataChange = () => {
    setHasChanges(true);
  };

  const handleCopySlug = async () => {
    await navigator.clipboard.writeText(collection.slug);
    setCopied(true);
    toast.success("Slug copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const configResult = await updateCollectionConfig(
        collection.slug,
        config,
      );
      if (!configResult.success) {
        toast.error("Failed to update collection configuration");
        return;
      }

      if (label !== collection.label || icon !== collection.icon) {
        const metadataResult = await updateCollectionMetadata(collection.slug, {
          label,
          icon,
        });
        if (!metadataResult.success) {
          toast.error("Failed to update collection metadata");
          return;
        }
      }

      toast.success("Collection updated successfully");
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full flex justify-center p-8">
        <div className="w-full max-w-7xl">
          <div className="flex flex-col mb-8 gap-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-3 min-w-0 flex-1 group/header">
                <div className="flex items-center gap-2">
                  <IconPicker
                    value={icon as IconName}
                    onChange={(newIcon) => {
                      setIcon(newIcon);
                      handleMetadataChange();
                    }}
                    variant="large"
                  />

                  <div className="flex-1 min-w-0">
                    {isEditingName ? (
                      <Input
                        value={label}
                        onChange={(e) => {
                          setLabel(e.target.value);
                          handleMetadataChange();
                        }}
                        onBlur={() => setIsEditingName(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setIsEditingName(false);
                          }
                          if (e.key === "Escape") {
                            setLabel(collection.label);
                            setIsEditingName(false);
                          }
                        }}
                        className="text-3xl font-bold font-heading h-auto py-1 px-2 -ml-2 border-0 shadow-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="flex items-center gap-2 group/title cursor-text hover:bg-accent/30 rounded-md -ml-2 px-2 py-1 transition-colors"
                        onClick={() => setIsEditingName(true)}
                      >
                        <h1 className="text-3xl font-bold font-heading truncate">
                          {label}
                        </h1>
                        <PencilIcon className="h-4 w-4 text-muted-foreground opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <code
                        className="text-xs px-2 py-0.5 bg-muted/50 rounded font-mono text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                        onClick={handleCopySlug}
                      >
                        {collection.slug}
                      </code>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start" sideOffset={4}>
                      <p>{copied ? "Copied!" : "Click to copy"}</p>
                    </TooltipContent>
                  </Tooltip>
                  {copied && <CheckIcon className="h-3 w-3 text-green-600" />}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  variant="secondary"
                >
                  <SaveIcon />
                  <span className="hidden md:inline">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <CollectionDefinitionEditor
            config={config}
            onChange={handleConfigChange}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
