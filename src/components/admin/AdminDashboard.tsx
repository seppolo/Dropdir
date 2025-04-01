import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ListChecks, UserCheck, Calendar, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import UserManagement from "./UserManagement";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    registeredToday: 0,
    totalAirdrops: 0,
    activeUsers: 0,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin is already authenticated
    const adminAuth = localStorage.getItem("admin_auth");
    if (adminAuth === "true") {
      setIsAuthenticated(true);
      fetchDashboardStats().finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    if (password === "Xzsa7ly1@") {
      setIsAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      setError("");
      fetchDashboardStats()
        .catch((err) => {
          toast({
            title: "Error loading dashboard",
            description: "There was a problem loading the dashboard data.",
            variant: "destructive",
          });
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError("Invalid password");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_auth");
    navigate("/");
  };

  const fetchDashboardStats = async () => {
    try {
      let totalUsers = 0;
      let registeredToday = 0;
      let totalAirdrops = 0;
      let activeUsersData = [];

      try {
        // Get total users count
        const { count, error } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        if (!error) totalUsers = count || 0;
      } catch (err) {
        console.error("Error fetching total users:", err);
      }

      try {
        // Get users registered today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count, error } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today.toISOString());

        if (!error) registeredToday = count || 0;
      } catch (err) {
        console.error("Error fetching users registered today:", err);
      }

      try {
        // Get total airdrops count
        const { count, error } = await supabase
          .from("user_airdrops")
          .select("*", { count: "exact", head: true });

        if (!error) totalAirdrops = count || 0;
      } catch (err) {
        console.error("Error fetching total airdrops:", err);
      }

      try {
        // Get active users (users with at least one airdrop)
        const { data, error } = await supabase
          .from("user_airdrops")
          .select("user_id")
          .limit(1000);

        if (!error && data) activeUsersData = data;
      } catch (err) {
        console.error("Error fetching active users:", err);
      }

      // Count unique user IDs
      const uniqueUserIds = new Set();
      activeUsersData.forEach((item) => {
        if (item.user_id) uniqueUserIds.add(item.user_id);
      });

      setStats({
        totalUsers,
        registeredToday,
        totalAirdrops,
        activeUsers: uniqueUserIds.size,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Set default stats to prevent rendering issues
      setStats({
        totalUsers: 0,
        registeredToday: 0,
        totalAirdrops: 0,
        activeUsers: 0,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Card className="w-[350px] bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-gray-100">
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-gray-100"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleLogin}
              >
                <Lock className="mr-2 h-4 w-4" /> Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Admin Dashboard</h1>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700"
        >
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-100 text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">
              {stats.totalUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-100 text-sm font-medium">
              Registered Today
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">
              {stats.registeredToday}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-100 text-sm font-medium">
              Total Airdrops
            </CardTitle>
            <ListChecks className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">
              {stats.totalAirdrops}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-100 text-sm font-medium">
              Active Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">
              {stats.activeUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-gray-700 text-gray-300"
          >
            User Management
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
