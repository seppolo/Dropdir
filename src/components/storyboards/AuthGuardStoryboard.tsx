import React from "react";
import AuthGuard from "../auth/AuthGuard";

const AuthGuardStoryboard = () => {
  return (
    <AuthGuard>
      <div className="p-8 bg-background min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Protected Content</h1>
        <p className="mb-4">
          This content is only visible to authenticated users.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg bg-card">
              <h2 className="text-lg font-semibold mb-2">Project {i}</h2>
              <p>
                This is a protected project card that requires authentication to
                view.
              </p>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
};

export default AuthGuardStoryboard;
