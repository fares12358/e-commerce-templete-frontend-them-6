import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaTelegramPlane, FaTiktok } from "react-icons/fa";

const SOCIAL_ICONS = { facebook: FaFacebookF, twitter: FaTwitter, instagram: FaInstagram, youtube: FaYoutube, telegram: FaTelegramPlane, tiktok: FaTiktok };

export function SocialLinks({ links }) {
  if (!links) return null;
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {Object.entries(links).map(([key, url]) => {
        if (!url) return null;
        const Icon = SOCIAL_ICONS[key];
        if (!Icon) return null;
        return (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-subtle)",
              boxShadow: "var(--shadow-xs)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--accent-border)";
              e.currentTarget.style.color = "var(--accent)";
              e.currentTarget.style.background = "var(--accent-light)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-subtle)";
              e.currentTarget.style.background = "var(--surface)";
            }}>
            <Icon size={14} />
          </a>
        );
      })}
    </div>
  );
}
