'use client'

import { Spotlight } from "@/components/ui/Spotlight"
import { cn } from "@/lib/utils"

export default function AboutSection() {
    return (
      <section className="w-full bg-background dark:bg-black px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Eyebrow Title */}
          <p className="text-base font-medium text-foreground dark:text-foreground">
            About Us
          </p>
  
          {/* Hero Heading */}
          <h1 >
            Welcome to Lounge Network.
          </h1>
  
          {/* Social Links */}
          <div className="mt-6 flex justify-center gap-6 text-gray-600 dark:text-gray-400">
            <a href="https://x.com" target="_blank" aria-label="X" className="hover:text-foreground dark:hover:text-foreground">
              <i className="ri-twitter-x-line text-2xl" />
            </a>
            <a href="https://instagram.com" target="_blank" aria-label="Instagram" className="hover:text-foreground dark:hover:text-foreground">
              <i className="ri-instagram-line text-2xl" />
            </a>
            <a href="https://youtube.com" target="_blank" aria-label="YouTube" className="hover:text-foreground dark:hover:text-foreground">
              <i className="ri-youtube-line text-2xl" />
            </a>
          </div>
  
          {/* Supporting Text */}
          <p className="mt-6 text-lg text-foreground dark:text-foreground">
            Broadcasting from the heart of Lagos, Lounge Network is a low-powered FM station exploring sound, culture, and connection.
          </p>
        </div>
  
        {/* Info Blocks */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="bg-background dark:bg-neutral-800 rounded-xl overflow-hidden shadow-md">
            <img 
              src="/media/about-studio.jpg" 
              alt="Studio" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-foreground">Community First</h3>
              <p className="text-foreground dark:text-foreground">
                We amplify local voices, celebrate shared rhythms, and tune in to what's real.
              </p>
            </div>
          </div>
  
          <div className="bg-background dark:bg-neutral-800 rounded-xl overflow-hidden shadow-md">
            <img 
              src="/media/about-community.jpg" 
              alt="Community" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-foreground">Sound Without Borders</h3>
              <p className="text-foreground dark:text-foreground">
                From alt mixes to open conversations, our signal spans culture and creativity.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }