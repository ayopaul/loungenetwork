'use client';

export default function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="space-y-3">
      <a
        href="/blog"
        className="text-sm font-semibold text-primary underline underline-offset-4"
      >
        ← View all posts
      </a>

      <div className="space-x-3">
        <button
          onClick={handleCopy}
          className="text-sm px-3 py-1 border rounded-md hover:bg-muted"
        >
          Copy link
        </button>

        <a
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
            `https://loungenetwork.ng/blog/${slug}`
          )}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm px-3 py-1 border rounded-md hover:bg-muted"
        >
          Share on X
        </a>
      </div>
    </div>
  );
}
