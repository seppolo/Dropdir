import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  defaultView?: "login" | "register";
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultView = "login",
}) => {
  const [view, setView] = useState<"login" | "register">(defaultView);

  const handleSuccess = () => {
    onAuthSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent className="sketch-card w-[400px] max-w-[95vw] z-50 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="text-xl sketch-font">
            {view === "login"
              ? "Login to Airdrop Manager"
              : "Create New Account"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {view === "login" ? (
            <LoginForm
              onSuccess={handleSuccess}
              onRegisterClick={() => setView("register")}
            />
          ) : (
            <RegisterForm
              onSuccess={handleSuccess}
              onLoginClick={() => setView("login")}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
