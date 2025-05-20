//components/about/AboutSection.tsx

'use client';

import { useStationStore } from "@/stores/useStationStore";

export default function AboutSection() {
  const { selected } = useStationStore();

  const contentMap = {
    lounge877: {
      heading: "Welcome to Lounge Network.",
      description: "Broadcasting from the heart of Lagos, Lounge Network is a low-powered FM station exploring sound, culture, and connection.",
      image1: "/media/about-studio.jpg",
      card1Title: "Community First",
      card1Text: "We amplify local voices, celebrate shared rhythms, and tune in to what's real.",
      image2: "/media/about-community.jpg",
      card2Title: "Sound Without Borders",
      card2Text: "From alt mixes to open conversations, our signal spans culture and creativity.",
    },
    rewind: {
      heading: "Welcome to Lounge Benin.",
      description: "From the streets of Benin, we bring retro vibes and modern talk to your dial.",
      image1: "/media/rewind-studio.jpg",
      card1Title: "Back to the Future",
      card1Text: "Blending nostalgic beats with the pulse of today’s stories.",
      image2: "/media/rewind-community.jpg",
      card2Title: "Culture That Connects",
      card2Text: "Every voice matters. Every tune tells a tale.",
    },
    abuja: {
      heading: "Welcome to Lounge Abuja.",
      description: "The capital’s calmest signal — music, culture, and chill conversations.",
      image1: "/media/abuja-studio.jpg",
      card1Title: "Capital Sound",
      card1Text: "Rooted in Abuja’s rhythm, we echo the city's creativity.",
      image2: "/media/abuja-community.jpg",
      card2Title: "Voices of the Nation",
      card2Text: "Broadcasting inclusion, innovation, and imagination.",
    },
  };

  type StationId = keyof typeof contentMap;

  const defaultId: StationId = "lounge877";
  const maybeId = selected?.id;
  const stationId: StationId = (maybeId && ["lounge877", "rewind", "abuja"].includes(maybeId))
    ? (maybeId as StationId)
    : defaultId;
  
  const content = contentMap[stationId];
  

  return (
    <section className="w-full bg-background px-6 py-24 text-center">
      <div className="max-w-3xl mx-auto">
        <p className="text-base font-medium text-foreground">About Us</p>
        <h1>{content.heading}</h1>

        <div className="mt-6 flex justify-center gap-6 text-gray-600 dark:text-gray-400">
          <a href="https://x.com" target="_blank" aria-label="X" className="hover:text-foreground">
            <i className="ri-twitter-x-line text-2xl" />
          </a>
          <a href="https://instagram.com" target="_blank" aria-label="Instagram" className="hover:text-foreground">
            <i className="ri-instagram-line text-2xl" />
          </a>
          <a href="https://youtube.com" target="_blank" aria-label="YouTube" className="hover:text-foreground">
            <i className="ri-youtube-line text-2xl" />
          </a>
        </div>

        <p className="mt-6 text-lg text-foreground">{content.description}</p>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        <div className="bg-background dark:bg-neutral-800 rounded-xl overflow-hidden shadow-md">
          <img src={content.image1} alt="Studio" className="w-full h-48 object-cover" />
          <div className="p-6 bg-background">
            <h3 className="text-xl font-semibold mb-2 text-foreground">{content.card1Title}</h3>
            <p className="text-foreground">{content.card1Text}</p>
          </div>
        </div>

        <div className="bg-background dark:bg-neutral-800 rounded-xl overflow-hidden shadow-md">
          <img src={content.image2} alt="Community" className="w-full h-48 object-cover" />
          <div className="p-6 bg-background">
            <h3 className="text-xl font-semibold mb-2 text-foreground">{content.card2Title}</h3>
            <p className="text-foreground">{content.card2Text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
