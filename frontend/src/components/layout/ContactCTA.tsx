'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ContactCTA() {
  const pathname = usePathname();
  // Hide on admin pages, login, contact, about, and education pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname === '/contact' || pathname === '/about' || pathname === '/education') return null;

  let title = <><span className="text-primary">Let&apos;s Work</span> <span className="text-secondary">Together</span></>;
  let description = "Have a project in mind or want to collaborate? I'd love to hear from you. Let's create something amazing together.";
  let buttonText = "Get In Touch";

  if (pathname === '/projects' || pathname?.startsWith('/projects/')) {
    title = <><span className="text-primary">Start a</span> <span className="text-secondary">Project</span></>;
    description = "Like what you see in my portfolio? Let's build your next big idea together and turn your vision into reality.";
    buttonText = "Start a Project";
  } else if (pathname === '/experience' || pathname === '/education') {
    title = <><span className="text-primary">Looking for</span> <span className="text-secondary">Talent?</span></>;
    description = "Looking for someone with my background and experience? I'm always open to discussing new opportunities.";
    buttonText = "Hire Me";
  } else if (pathname === '/skills') {
    title = <><span className="text-primary">Need these</span> <span className="text-secondary">Skills?</span></>;
    description = "Need technical expertise for your next project? Let's collaborate and build something great.";
    buttonText = "Let's Collaborate";
  } else if (pathname === '/events') {
    title = <><span className="text-primary">Book a</span> <span className="text-secondary">Speaker</span></>;
    description = "Want me to speak at your next event, host a workshop, or collaborate on a tech meetup? I'd love to participate.";
    buttonText = "Book Me";
  } else if (pathname === '/blog' || pathname?.startsWith('/blog/')) {
    title = <><span className="text-primary">Enjoy my</span> <span className="text-secondary">Writing?</span></>;
    description = "Subscribe for updates or reach out if you'd like me to write a guest post or collaborate on an article.";
    buttonText = "Get In Touch";
  }

  return (
    <section className="w-full py-16 sm:py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 border border-primary/20 backdrop-blur-xl p-8 sm:p-12 md:p-16">
          {/* Background Glow Effects */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              {title}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {buttonText}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
