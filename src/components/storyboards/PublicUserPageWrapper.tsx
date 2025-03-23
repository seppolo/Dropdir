import React from "react";
import PublicUserPage from "../PublicUserPage";

// This component provides mock data for storyboards
export default function PublicUserPageWrapper() {
  // Create a mock project data for the storyboard
  const mockProjects = [
    {
      id: 1,
      project: "Arbitrum",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arbitrum",
      link: "https://arbitrum.io",
      twitter: "https://twitter.com/arbitrum",
      status: "active",
      last_activity: new Date().toISOString(),
      type: "L2",
      cost: "Free",
      join_date: "2023-01-15",
      chain: "Ethereum",
      stage: "Mainnet",
      tags: "DeFi,L2,Ethereum",
      notes: "Arbitrum is a Layer 2 scaling solution for Ethereum.",
      is_public: true,
      username: "testuser",
    },
    {
      id: 2,
      project: "Optimism",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Optimism",
      link: "https://optimism.io",
      twitter: "https://twitter.com/optimismFND",
      status: "active",
      last_activity: new Date().toISOString(),
      type: "L2",
      cost: "Free",
      join_date: "2023-02-20",
      chain: "Ethereum",
      stage: "Mainnet",
      tags: "DeFi,L2,Ethereum",
      notes: "Optimism is an Ethereum Layer 2 scaling solution.",
      is_public: true,
      username: "testuser",
    },
  ];

  // Mock the useParams hook
  React.useEffect(() => {
    // Mock the supabase response for the storyboard
    const originalSupabaseFrom = window.supabase?.from;
    if (originalSupabaseFrom) {
      window.supabase.from = (table) => {
        if (table === "user_airdrops") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  order: () => ({
                    data: mockProjects,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return originalSupabaseFrom(table);
      };
    }

    return () => {
      // Restore original when unmounted
      if (originalSupabaseFrom) {
        window.supabase.from = originalSupabaseFrom;
      }
    };
  }, []);

  // Create a wrapper that provides the username param
  return (
    <MockRouterProvider username="testuser">
      <PublicUserPage />
      <div className="w-[800px] h-[600px]"></div>
    </MockRouterProvider>
  );
}

// A simple component to mock the router context
function MockRouterProvider({ children, username }) {
  // Create a mock implementation of useParams
  // Store the original useContext but don't override it directly
  // as that causes TypeScript errors
  const originalUseContext = React.useContext;
  // Instead, we'll use a different approach for mocking

  // Override useParams for this component tree
  const originalUseParams2 = window.ReactRouterDOM?.useParams;
  if (originalUseParams2) {
    window.ReactRouterDOM.useParams = () => ({ username });
  }

  return <>{children}</>;
}
