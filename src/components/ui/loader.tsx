
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Loader({ className, ...props }: LoaderProps) {
  return (
    <div
      className={cn("animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-primary h-8 w-8", className)}
      {...props}
    />
  );
}
