"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ClipboardList,
  Upload,
  Loader,
  CheckCircle,
  FileText,
  Copy,
  Check,
  Sparkles,
  ScanLine,
  ShieldCheck,
  FileScan,
  AlertCircle,
  Camera,
} from "lucide-react";
import Tesseract from "tesseract.js";

export default function PrescriptionReader() {
  const { user, loading } = useAuth();
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleCopy = () => {
    if (ocrText) {
      navigator.clipboard.writeText(ocrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (PNG, JPG).");
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrText("");
      setError("");
    }
  };

  const triggerGallery = () => {
    document.getElementById("galleryInput").click();
  };
 
  const triggerCamera = () => {
    document.getElementById("cameraInput").click();
  };
 
  const runOCR = async () => {
    if (!image) return;
    setIsProcessing(true);
    setError("");

    try {
      const result = await Tesseract.recognize(image, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(parseInt(m.progress * 100));
          }
        },
      });
      setOcrText(result.data.text);
    } catch (err) {
      console.error(err);
      setError("OCR text extraction failed. Please try again with a clearer image.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="w-full animate-[fadeIn_0.5s_ease-out] pb-12">
      <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-[#74B49B]/15 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbf9_45%,#eef7f4_100%)] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-[#74B49B]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#BAC94A]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#74B49B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#5C8D7A] shadow-sm backdrop-blur-md">
              <Sparkles size={14} />
              Prescription OCR Reader
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-800 md:text-5xl">
              Prescription Reader
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Upload prescription images or medical note snapshots and extract
              readable text directly inside your patient workspace.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F1] text-[#2F8F68]">
                  <Upload size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Image Upload</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Add JPG or PNG prescription images for scanning.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F7E8] text-[#7C9440]">
                  <ScanLine size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">OCR Scan</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Extract visible text from handwritten or printed notes.
                </p>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3F8] text-[#4F7EA8]">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-sm font-bold text-slate-800">Local Flow</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Process your prescription text directly in the app flow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F7F4] text-[#5C8D7A]">
              <FileScan size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Scan Workflow</h2>
              <p className="text-xs text-slate-500">Upload, scan, and copy results</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Step 1
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                Upload prescription image
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Step 2
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                Run OCR extraction
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8FBF9] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Step 3
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                Review and copy extracted text
              </p>
            </div>
          </div>
        </section>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-800">
            <Upload size={20} className="text-[#4F7EA8]" />
            Upload Image
          </h3>

          <div className="relative flex h-80 flex-col items-center justify-center overflow-hidden rounded-[28px] border-2 border-dashed border-slate-200 bg-[#FCFDFC] text-center transition-all hover:border-[#74B49B]/40">
            {/* Hidden Inputs */}
            <input
              id="galleryInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <input
              id="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
 
            {previewUrl ? (
              <div className="group relative h-full w-full p-4">
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="h-full w-full rounded-2xl object-contain shadow-md transition group-hover:opacity-90"
                />
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setImage(null);
                  }}
                  className="absolute right-6 top-6 rounded-full bg-white/90 p-2 text-rose-500 shadow-lg backdrop-blur hover:bg-white"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 px-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#EEF7F1] text-[#2F8F68]">
                  <FileText size={40} />
                </div>
                <div>
                  <p className="text-base font-black text-slate-800">
                    Add prescription document
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Supports JPG and PNG files
                  </p>
                </div>
 
                <div className="flex gap-4">
                  <button
                    onClick={triggerGallery}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#74B49B] hover:shadow-md"
                  >
                    <Upload size={20} className="text-[#4F7EA8]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Gallery</span>
                  </button>
 
                  <button
                    onClick={triggerCamera}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#74B49B] hover:shadow-md"
                  >
                    <Camera size={20} className="text-[#2F8F68]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Camera</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#5AA7A7] to-[#74B49B] px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(92,141,122,0.24)] transition hover:-translate-y-0.5 disabled:opacity-50"
            disabled={!image || isProcessing}
            onClick={runOCR}
          >
            <span className="flex items-center justify-center gap-2">
              {isProcessing ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Processing ({progress}%)
                </>
              ) : (
                <>
                  <ScanLine size={18} />
                  Scan Prescription
                </>
              )}
            </span>
          </button>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-800">
              <CheckCircle size={20} className="text-[#2F8F68]" />
              Extracted Text Output
            </h3>

            {ocrText && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                  copied
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>

          {ocrText ? (
            <div className="max-h-[420px] overflow-auto rounded-[24px] border border-slate-200 bg-[#0f172a] p-4">
              <pre className="whitespace-pre-wrap font-['Outfit'] text-sm text-slate-200">
                {ocrText}
              </pre>
            </div>
          ) : (
            <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-[28px] border border-dashed border-slate-200 bg-[#FCFDFC] p-10 text-center">
              <ClipboardList size={34} className="text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">
                Extracted prescription contents appear here
              </p>
              <p className="max-w-sm text-xs text-slate-500">
                After scanning, the recognized text will be shown in this panel so
                you can review or copy it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}