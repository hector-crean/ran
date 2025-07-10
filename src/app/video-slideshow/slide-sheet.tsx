import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
} from "@/components/ui/sheet";
import { useState } from "react";

const SlideSheet = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);

  return (
    <Sheet open={open} onOpenChange={open => setOpen(open)}>
      <SheetContent side="right" className="w-[50vw] sm:max-w-[80vw]">
        <SheetHeader>
          {/* <SheetTitle></SheetTitle> */}
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
};

export { SlideSheet };
