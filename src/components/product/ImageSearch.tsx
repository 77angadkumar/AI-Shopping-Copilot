"use client";

import React, { useState, useRef } from "react";
import { Camera, X, Upload, RefreshCw, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageSearchProps {
  onSelectProduct: (product: any) => void;
  onClose?: () => void;
}

export default function ImageSearch({ onSelectProduct, onClose }: ImageSearchProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResults([]);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Trigger visual search
    uploadAndSearch(file);
  };

  const uploadAndSearch = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/search/image", {
        method: "POST",
        body: formData
      });

      const json = await res.json();
      if (json.success) {
        setResults(json.matches);
      } else {
        setError(json.error || "Failed to analyze image.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/95 p-6 backdrop-blur-xl shadow-2xl relative w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-amber-500" />
          <h3 className="text-base font-extrabold text-white">Visual Image Search</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white rounded-full">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Drag & Drop Area */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
            dragActive 
              ? "border-amber-500 bg-amber-500/5" 
              : "border-white/10 hover:border-white/20 hover:bg-white/5"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
          <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center border border-white/5">
            <Upload className="h-6 w-6 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white mb-1">Drag and drop your product photo</p>
            <p className="text-xs text-slate-400">or click to browse from device</p>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Supports PNG, JPG, WEBP
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Preview Container */}
          <div className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-slate-900/60 relative">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="h-16 w-16 rounded-lg object-cover border border-white/10"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={resetSearch} className="text-slate-400 hover:text-white rounded-full">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-6 border border-white/5 rounded-xl bg-slate-900/30">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
              <p className="text-xs font-bold text-slate-300">Extracting visual features...</p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-medium">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Grid */}
          {!loading && results.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Visual Similarity Matches
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {results.map((r, idx) => (
                  <Card
                    key={idx}
                    onClick={() => onSelectProduct(r.product)}
                    className="flex items-center gap-3 p-3 border border-white/5 bg-slate-900/40 hover:bg-slate-900/80 hover:border-amber-500/30 transition-all cursor-pointer group"
                  >
                    <div className="h-12 w-12 rounded-lg bg-slate-950 flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                      {r.product.image ? (
                        <img src={r.product.image} alt={r.product.title} className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingBag className="h-5 w-5 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-0.5">
                        <span className="text-xs font-bold text-white truncate max-w-[200px]">
                          {r.product.title}
                        </span>
                        <span className="text-[10px] font-bold text-amber-500">
                          {Math.round(r.score * 100)}% match
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>{r.product.brand} | {r.product.category}</span>
                        <span className="font-extrabold text-white">₹{r.product.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-1 shrink-0" />
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
