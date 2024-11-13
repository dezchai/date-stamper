"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InputFile({ onFileChange }: { onFileChange: (files: FileList | null) => void }) {

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      onFileChange(selectedFiles);
    }
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="picture">Pictures</Label>
      <Input 
        id="picture" 
        type="file" 
        multiple
        accept="image/*"
        onChange={handleFileChange} // Handle file selection
      />
    </div>
  );
}