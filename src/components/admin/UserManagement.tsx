import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Trash2, Search, RefreshCw } from "lucide-react";

interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  last_sign_in_at: string | null;
  project_count: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch users from auth.users table
      const { data: authUsers, error: authError } = await supabase
        .from("auth.users")
        .select("id, email, created_at, last_sign_in_at, user_metadata");

      if (authError) throw authError;

      // Fetch project counts for each user
      const { data: projectCounts, error: projectError } = await supabase
        .from("user_airdrops")
        .select("user_id, count")
        .group_by("user_id");

      if (projectError) throw projectError;

      // Create a map of user_id to project count
      const projectCountMap = {};
      projectCounts?.forEach((item) => {
        projectCountMap[item.user_id] = parseInt(item.count);
      });

      // Combine the data
      const formattedUsers = authUsers?.map((user) => ({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || "N/A",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        project_count: projectCountMap[user.id] || 0,
      }));

      setUsers(formattedUsers || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setIsDeleting(true);

      // Delete user's projects first
      const { error: projectsError } = await supabase
        .from("user_airdrops")
        .delete()
        .eq("user_id", userId);

      if (projectsError) throw projectsError;

      // Delete the user from auth.users
      const { error: userError } = await supabase
        .from("auth.users")
        .delete()
        .eq("id", userId);

      if (userError) throw userError;

      // Update the UI
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. See console for details.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-gray-800 border-gray-700 text-gray-100"
          />
        </div>
        <Button
          variant="outline"
          onClick={fetchUsers}
          disabled={loading}
          className="border-gray-700 text-gray-300"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-800">
            <TableRow className="hover:bg-gray-800/50 border-gray-700">
              <TableHead className="text-gray-300">Username</TableHead>
              <TableHead className="text-gray-300">Email</TableHead>
              <TableHead className="text-gray-300">Registered</TableHead>
              <TableHead className="text-gray-300">Last Login</TableHead>
              <TableHead className="text-gray-300 text-center">
                Projects
              </TableHead>
              <TableHead className="text-gray-300 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-gray-900">
            {loading ? (
              <TableRow className="hover:bg-gray-800/50 border-gray-700">
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-gray-400"
                >
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow className="hover:bg-gray-800/50 border-gray-700">
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-gray-400"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-gray-800/50 border-gray-700"
                >
                  <TableCell className="font-medium text-gray-200">
                    {user.username}
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="bg-gray-800 text-gray-300 border-gray-700"
                    >
                      {user.project_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isDeleting}
                      className="text-red-500 hover:text-red-400 hover:bg-gray-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;
