"use client";

interface Props {
  url: string;
  title: string;
  text: string;
}

export default function ShareButton({ url, title, text }: Props) {
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // kullanıcı iptal etti
      }
    } else {
      // Fallback: clipboard
      await navigator.clipboard.writeText(url);
      alert("Link kopyalandı!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 bg-[var(--brand-primary,#2563eb)] hover:opacity-90 text-[var(--brand-text-on-primary,#fff)] rounded-[var(--brand-radius,12px)] py-2.5 text-sm font-medium transition-opacity"
    >
      🔗 Paylaş
    </button>
  );
}
