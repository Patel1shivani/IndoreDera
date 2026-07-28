import { GoAlertFill, GoCheckCircleFill, GoInfo, GoXCircleFill } from "react-icons/go";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Alerts screen ke right side me aate hain (center me nahi) — content padhne me
 * rukawat nahi hoti.
 *
 * Look poori tarah brand theme ka hai: cream card, left me patli accent patti
 * aur round icon badge. Rang sirf patti + icon me hai, poora box nahi rangta.
 * Asli CSS styles.css me "Alerts (sonner)" block me hai — sonner apni CSS
 * runtime par inject karta hai, isliye class utilities bharosemand nahi thi.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      offset={88}
      gap={10}
      icons={{
        success: <GoCheckCircleFill className="h-4.5 w-4.5 text-brand-green" />,
        error: <GoXCircleFill className="h-4.5 w-4.5 text-destructive" />,
        warning: <GoAlertFill className="h-4.5 w-4.5 text-accent-foreground" />,
        info: <GoInfo className="h-4.5 w-4.5 text-primary" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
