import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";


export function FallbackImage({ src, alt, className = "", testId, ...props }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div data-testid={testId ? `${testId}-fallback` : undefined} role="img" aria-label={`${alt} image unavailable`}
        className={`grid place-items-center bg-[radial-gradient(circle_at_25%_25%,rgba(243,71,112,.12)_1px,transparent_1px)] bg-[length:16px_16px] bg-secondary text-primary ${className}`}>
        <UtensilsCrossed className="w-8 h-8" aria-hidden="true" />
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} data-testid={testId} {...props} />;
}
