import { Zap } from "lucide-react";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const utmUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="border-t border-border/50 mt-20">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 font-display font-bold text-lg mb-3">
              <div className="w-7 h-7 rounded-lg gradient-btn flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-background" />
              </div>
              <span className="gradient-text">GRIND</span>
              <span>TRACKER</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Level up your life. Track your grind, compete with friends, and
              unlock your full potential.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiGithub className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiX className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <SiLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              {["Features", "Leaderboards", "Focus Mode", "Insights"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Community
            </h4>
            <ul className="space-y-2 text-sm">
              {["Discord Server", "Reddit", "Blog", "Changelog"].map((item) => (
                <li key={item}>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center text-sm text-muted-foreground">
          © {year}. Built with ❤️ using{" "}
          <a
            href={utmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
