import Image from "next/image";

import logoImage from "@/artifacts/logo.png";

export function SiteLogo({
  size = "medium"
}: {
  size?: "small" | "medium" | "large";
}) {
  return (
    <span className={`site-logo site-logo-${size}`}>
      <Image
        alt="Rare Care Mongolia logo"
        priority={size !== "small"}
        src={logoImage}
      />
    </span>
  );
}
