import { ThemeProvider } from "../ThemeProvider";
import { ThemeToggle } from "../ThemeToggle";

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-8 flex items-center justify-center">
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}
