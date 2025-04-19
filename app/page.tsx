import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LivePlayer from "@/components/radio/LivePlayer";
import ScheduleGrid from "@/components/schedule/ScheduleGrid";
import WeeklyTabs from "@/components/schedule/WeeklyTabs";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary text-white flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-10">
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl mb-12">
  <video
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 w-full h-full object-cover opacity-80"
  >
    <source src="/media/hero-bg.mp4" type="video/mp4" />
  </video>

  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center h-full p-6 bg-black/30 backdrop-blur-sm">
    <div>
      <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">Welcome Home</h1>
      <p className="text-muted-foreground text-lg max-w-md">Your sound lives here. Tune in and vibe with Lounge.</p>
    </div>
    <div className="w-full max-w-md mt-6 md:mt-0">
      <LivePlayer />
    </div>
  </div>
</section>


        <section className="mb-12">
          {/* <h2 className="text-2xl font-semibold mb-4">Today’s Schedule</h2>
          <ScheduleGrid /> */}
          <section className="mb-20">
            <h2 className="text-2xl font-semibold mb-6">Weekly Schedule</h2>
            <WeeklyTabs />
            </section>
        </section>
        <div className="bg-[url('/bank-note.svg')] bg-cover" />
      </main>

      <Footer />
    </div>
  );
}