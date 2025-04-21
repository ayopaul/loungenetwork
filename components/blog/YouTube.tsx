
'use client';

export default function YouTube({ id }: { id: string }) {
  return (
    <div className="aspect-video w-full mb-6">
      <iframe
        className="rounded-lg w-full h-full"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}
