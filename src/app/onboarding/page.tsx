"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UploadedMedia = {
  storagePath: string;
  fileName: string;
  mimeType: string;
  publicUrl: string;
  caption?: string;
};

type MeResponse = {
  data: {
    business: { id: string } | null;
  };
};

async function uploadMedia(file: File, kind: "logo" | "photo") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);

  const response = await fetch("/api/businesses/media", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Upload failed");
  }

  return payload.data as UploadedMedia;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [legalName, setLegalName] = useState("");
  const [dba, setDba] = useState("");
  const [metro, setMetro] = useState("");
  const [vertical, setVertical] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingBusiness() {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) return;

        const payload = (await response.json()) as MeResponse;
        if (!cancelled && payload.data.business) {
          router.replace("/");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void checkExistingBusiness();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handlePhotosChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 12);
    setPhotoFiles(files);
    setPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!logoFile) {
      setError("Please upload a company logo.");
      return;
    }

    if (photoFiles.length === 0) {
      setError("Please upload at least one custom photo of your business.");
      return;
    }

    setSubmitting(true);

    try {
      const logoUpload = await uploadMedia(logoFile, "logo");
      const photoUploads = await Promise.all(
        photoFiles.map((file) => uploadMedia(file, "photo")),
      );

      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName,
          dba: dba || undefined,
          metro,
          vertical,
          website,
          description,
          logoStoragePath: logoUpload.storagePath,
          photos: photoUploads.map((upload, index) => ({
            storagePath: upload.storagePath,
            fileName: upload.fileName,
            mimeType: upload.mimeType,
            sortOrder: index,
          })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Could not save business profile");
      }

      router.push("/?onboarding=complete");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-6">
        <p className="text-sm text-zinc-500">Loading onboarding…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
          Business onboarding
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Set up your company profile
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Add a description, logo, and photos so other businesses can learn about
          you before matching.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Business details</h2>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Legal name</span>
            <input
              required
              value={legalName}
              onChange={(event) => setLegalName(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">DBA (optional)</span>
            <input
              value={dba}
              onChange={(event) => setDba(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Metro</span>
              <input
                required
                value={metro}
                onChange={(event) => setMetro(event.target.value)}
                placeholder="Miami, FL"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium">Industry</span>
              <input
                required
                value={vertical}
                onChange={(event) => setVertical(event.target.value)}
                placeholder="Wellness, Legal, Marketing…"
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Website (optional)</span>
            <input
              type="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium">Description</span>
            <textarea
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell other businesses what you do, who you serve, and what makes you a great trade partner."
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <span className="text-xs text-zinc-500">
              {description.length}/2000 characters (minimum 10)
            </span>
          </label>
        </section>

        <section className="space-y-4 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Company logo</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Square or landscape logo, PNG/JPG/WebP, up to 2MB.
          </p>

          <input
            required
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleLogoChange}
            className="block w-full text-sm"
          />

          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo preview"
              className="h-24 w-24 rounded-2xl border border-zinc-200 object-cover dark:border-zinc-700"
            />
          ) : null}
        </section>

        <section className="space-y-4 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="text-lg font-medium">Custom pictures</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Upload photos of your team, workspace, or work samples. Add at least
            one (up to 12).
          </p>

          <input
            required
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handlePhotosChange}
            className="block w-full text-sm"
          />

          {photoPreviews.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photoPreviews.map((preview, index) => (
                <img
                  key={preview}
                  src={preview}
                  alt={`Business photo ${index + 1}`}
                  className="aspect-square rounded-2xl border border-zinc-200 object-cover dark:border-zinc-700"
                />
              ))}
            </div>
          ) : null}
        </section>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving profile…" : "Submit for review"}
        </button>
      </form>
    </main>
  );
}
