import { cn } from "@/lib/utils";

export function ShineBorder({
  borderRadius = 16,
  borderWidth = 2,
  duration = 8,
  shineColor = "#00f2ff",
  className,
  children,
}) {
  return (
    <div
      style={{
        "--border-radius": `${borderRadius}px`,
      }}
      // REMOVED 'place-items-center' to allow input to stretch
      className={cn(
        "relative w-full rounded-[--border-radius] bg-transparent p-[1px] overflow-hidden",
        className,
      )}
    >
      <div
        style={{
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          "--background-radial-gradient": `radial-gradient(transparent,transparent, ${
            Array.isArray(shineColor) ? shineColor.join(",") : shineColor
          },transparent,transparent)`,
        }}
        className={`before:bg-shining-line pointer-events-none before:absolute before:inset-0 before:size-full before:rounded-[--border-radius] before:p-[--border-width] before:will-change-[background-position] before:content-[""] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:[mask:--mask-linear-gradient] motion-safe:before:animate-shine`}
      ></div>
      {children}
    </div>
  );
}