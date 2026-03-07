"use client";

import { useState } from "react";
import { Camera, Heart, MessageCircle, Upload } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/lib/theme-context";
import { t } from "@/lib/i18n";

const posts = [
  {
    id: 1,
    image: "/images/community-1.jpg",
    user: "Ana C.",
    likes: 24,
    captionKey: "community.1.caption",
    tall: true,
  },
  {
    id: 2,
    image: "/images/community-2.jpg",
    user: "Carlos M.",
    likes: 57,
    captionKey: "community.2.caption",
    tall: false,
  },
  {
    id: 3,
    image: "/images/community-3.jpg",
    user: "Lucia R.",
    likes: 18,
    captionKey: "community.3.caption",
    tall: false,
  },
  {
    id: 4,
    image: "/images/community-4.jpg",
    user: "Miguel A.",
    likes: 33,
    captionKey: "community.4.caption",
    tall: true,
  },
];

export function ComunidadView() {
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const { isDarkMode, lang } = useTheme();

  function toggleLike(id: number) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const cardClass = isDarkMode
    ? "border border-primary/10 shadow-[0_0_12px_rgba(129,98,243,0.06)]"
    : "shadow-md border-0";

  return (
    <div className="flex flex-col gap-4 px-5 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-foreground">
          {t(lang, "comunidad.title")}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t(lang, "comunidad.subtitle")}
        </p>
      </div>

      {/* Upload button */}
      <button
        onClick={() => setShowUpload(!showUpload)}
        className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-accent/50 bg-accent/5 py-3.5 text-sm font-semibold text-accent transition-all hover:bg-accent/10 active:scale-[0.98]"
      >
        <Camera className="h-4.5 w-4.5" />
        {t(lang, "comunidad.upload")}
      </button>

      {/* Upload overlay */}
      {showUpload && (
        <div
          className={`flex flex-col items-center gap-3 rounded-3xl bg-card p-6 ${cardClass}`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <Upload className="h-7 w-7 text-accent" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {t(lang, "comunidad.dragDrop")}
          </p>
          <button
            onClick={() => setShowUpload(false)}
            className="rounded-xl bg-accent px-6 py-2 text-sm font-semibold text-accent-foreground transition-all active:scale-[0.98]"
          >
            {t(lang, "comunidad.selectPhoto")}
          </button>
        </div>
      )}

      {/* Masonry grid */}
      <div className="columns-2 gap-3 [column-fill:balance]">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`mb-3 break-inside-avoid overflow-hidden rounded-3xl bg-card ${cardClass}`}
          >
            <div className={`relative w-full ${post.tall ? "h-52" : "h-36"}`}>
              <Image
                src={post.image}
                alt={t(lang, post.captionKey)}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-card/80 via-transparent to-transparent" />

              {/* User label */}
              <div className="absolute bottom-2 left-2 rounded-full bg-background/60 px-2 py-0.5 backdrop-blur-sm">
                <span className="text-[10px] font-medium text-foreground">
                  {post.user}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 p-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t(lang, post.captionKey)}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-1 transition-colors"
                  aria-label={liked.has(post.id) ? "Unlike" : "Like"}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${
                      liked.has(post.id)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-[10px] ${
                      liked.has(post.id)
                        ? "text-accent"
                        : "text-muted-foreground"
                    }`}
                  >
                    {post.likes + (liked.has(post.id) ? 1 : 0)}
                  </span>
                </button>
                <button
                  className="flex items-center gap-1 text-muted-foreground"
                  aria-label="Comment"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
