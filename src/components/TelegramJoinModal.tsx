import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";

interface TelegramJoinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TelegramJoinModal({
  open,
  onOpenChange,
}: TelegramJoinModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-2 border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Bergabung ke Telegram
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          <p className="text-center text-muted-foreground">
            Silahkan bergabung ke grup telegram Dropdir untuk mendapatkan
            informasi terbaru, tutorial dan diskusi terkait aplikasi
          </p>
          <a
            href="https://t.me/dropdirs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200 w-full max-w-xs"
          >
            <MessageCircle className="h-5 w-5" />
            Bergabung ke Telegram
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
