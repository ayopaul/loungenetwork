import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    // Sunday
    { id: "sun-1", showTitle: "Sunday Breeze", startTime: "06:00", endTime: "11:00", description: "Smooth morning vibes.", thumbnailUrl: "/thumbnails/sunday-breeze.png", weekday: 0 },
    { id: "sun-2", showTitle: "Lets Chill", startTime: "12:00", endTime: "16:00", description: "Relaxed afternoon playlists.", thumbnailUrl: "/thumbnails/lets-chill.png", weekday: 0 },
    { id: "sun-3", showTitle: "Brunch Nites", startTime: "16:00", endTime: "20:00", description: "Evening drive sounds.", thumbnailUrl: "/thumbnails/brunch-nites.png", weekday: 0 },
    { id: "sun-4", showTitle: "Rhythm & Soul", startTime: "20:00", endTime: "00:00", description: "Classic and neo soul sessions.", thumbnailUrl: "/thumbnails/rhythm-soul.png", weekday: 0 },
    { id: "sun-5", showTitle: "Sunday Night Soiree", startTime: "00:00", endTime: "05:00", description: "Late night chill zone.", thumbnailUrl: "/thumbnails/sunday-night.png", weekday: 0 },
    { id: "sun-6", showTitle: "Music", startTime: "05:00", endTime: "06:00", description: "Continuous streaming music.", thumbnailUrl: "/thumbnails/music.png", weekday: 0 },

    // Monday to Friday
    ...[1, 2, 3, 4, 5].flatMap(day => [
      { id: `power-up-${day}`, showTitle: "Power Up", startTime: "06:00", endTime: "11:00", description: "Your weekday starter.", thumbnailUrl: "/thumbnails/power-up.png", weekday: day },
      { id: `lazy-lounge-${day}`, showTitle: "Lazy Lounge", startTime: "12:00", endTime: "16:00", description: "Midday mellow mood.", thumbnailUrl: "/thumbnails/lazy-lounge.png", weekday: day },
      { id: `bumper-${day}`, showTitle: "Bumper 2 Bumper", startTime: "16:00", endTime: "20:00", description: "Evening rush tunes.", thumbnailUrl: "/thumbnails/bumper.png", weekday: day },
      { id: `night-${day}`, showTitle: "Night Lounge", startTime: "20:00", endTime: "00:00", description: "Unwind with smooth vibes.", thumbnailUrl: "/thumbnails/night-lounge.png", weekday: day },
      { id: `power-down-${day}`, showTitle: "Power Down", startTime: "00:00", endTime: "05:00", description: "Wind down sessions.", thumbnailUrl: "/thumbnails/power-down.png", weekday: day },
      { id: `music-${day}`, showTitle: "Music", startTime: "05:00", endTime: "06:00", description: "Continuous streaming music.", thumbnailUrl: "/thumbnails/music.png", weekday: day }
    ]),

    // Saturday
    { id: "sat-1", showTitle: "Zen Lounge", startTime: "06:00", endTime: "11:00", description: "Weekend wind-in and relaxation.", thumbnailUrl: "/thumbnails/zen.png", weekday: 6 },
    { id: "sat-2", showTitle: "The Catch Up", startTime: "12:00", endTime: "16:00", description: "Weekend replay zone.", thumbnailUrl: "/thumbnails/catch-up.png", weekday: 6 },
    { id: "sat-3", showTitle: "The Drift", startTime: "16:00", endTime: "20:00", description: "Saturdays with soul and groove.", thumbnailUrl: "/thumbnails/drift.png", weekday: 6 },
    { id: "sat-4", showTitle: "On The Rocks", startTime: "20:00", endTime: "00:00", description: "Turn-up with bold mixes.", thumbnailUrl: "/thumbnails/on-the-rocks.png", weekday: 6 },
    { id: "sat-5", showTitle: "Saturday Night Soiree", startTime: "00:00", endTime: "05:00", description: "Party through the midnight hour.", thumbnailUrl: "/thumbnails/saturday-soiree.png", weekday: 6 },
    { id: "sat-6", showTitle: "Music", startTime: "05:00", endTime: "06:00", description: "Continuous streaming music.", thumbnailUrl: "/thumbnails/music.png", weekday: 6 }
  ]);
}
