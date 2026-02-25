import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Ensure you have this utility or remove 'cn' and just use template strings

const animationVariants = {
  slideUp: {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1, // Delay between words
        },
      },
    },
    item: {
      hidden: { y: 15, opacity: 0, filter: "blur(4px)" },
      show: {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        transition: {
          duration: 0.4,
          ease: "easeOut",
        },
      },
    },
  },
  // You can add more animations here later (blurIn, scaleUp, etc.)
};

export const TextAnimate = ({
  children,
  className,
  as: Component = "p",
  animation = "slideUp",
  by = "word",
  ...props
}) => {
  // Split Logic
  const segments =
    by === "word"
      ? children.split(/(\s+)/) // Split by space but keep spaces to preserve layout
      : children.split("");

  const variants = animationVariants[animation];

  return (
    <Component className={cn("inline-block", className)} {...props}>
      <AnimatePresence mode="popLayout">
        <motion.div
          initial="hidden"
          animate="show"
          exit="hidden"
          variants={variants.container}
          className="inline-block" // Ensure it flows like text
        >
          {segments.map((segment, i) => (
            <motion.span
              key={`${i}-${segment}`}
              variants={variants.item}
              className="inline-block"
              style={{ display: "inline-block" }} // Fix for some browsers
            >
              {segment === " " ? "\u00A0" : segment}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </Component>
  );
};