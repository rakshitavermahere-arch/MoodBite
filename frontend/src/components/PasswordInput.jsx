import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";


export function PasswordInput({ inputTestId, toggleTestId, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} data-testid={inputTestId} className="h-12 pr-12 rounded-xl bg-card" />
      <button type="button" aria-label={visible ? "Hide password" : "Show password"} data-testid={toggleTestId}
        onClick={() => setVisible((value) => !value)} className="absolute inset-y-0 right-0 w-12 grid place-items-center text-muted-foreground hover:text-foreground transition-colors">
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
