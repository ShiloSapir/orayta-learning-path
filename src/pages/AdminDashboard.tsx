import { useState, useEffect } from "react";
import { AdminRoute } from "@/components/AdminRoute";
import { AdminSourceGenerator } from "@/components/AdminSourceGenerator";
import { AdminTestRunner } from "@/components/AdminTestRunner";
import { AdminStatsDashboard } from "@/components/AdminStatsDashboard";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface DbUser {
  id: string;
  email: string;
  role: string | null;
  created_at: string | null;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<DbUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const { reflections, sessions } = useSupabaseData();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { data } = await supabase
        .from("users")
        .select("id, email, role, created_at")
        .order("created_at", { ascending: false });
      setUsers(data || []);
      setLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  const updateRole = async (id: string, role: string) => {
    await supabase.from("users").update({ role }).eq("id", id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  return (
    <AdminRoute>
      <div className="p-4 space-y-4 pb-24">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Accordion type="single" collapsible className="w-full">
          {/* Content Management */}
          <AccordionItem value="content">
            <AccordionTrigger>Content Management</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold">Create/Edit Source</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title-en">Title (EN)</Label>
                      <Input id="title-en" placeholder="English title" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title-he">Title (HE)</Label>
                      <Input id="title-he" placeholder="Hebrew title" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="category">Category</Label>
                      <Input id="category" placeholder="Category" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea id="excerpt" placeholder="Short excerpt" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link">Sefaria Link</Label>
                      <Input id="link" placeholder="https://" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Estimated Minutes</Label>
                      <Input id="duration" type="number" min={1} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="published" />
                      <Label htmlFor="published">Published</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="featured" />
                      <Label htmlFor="featured">Featured</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="promoted" />
                      <Label htmlFor="promoted">Promoted</Label>
                    </div>
                  </div>
                  <Button className="w-full">Save Source</Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Topic Rules</h3>
                  <div className="space-y-2">
                    <Input placeholder="Topic (e.g., Halacha)" />
                    <Textarea placeholder="Rule description" />
                    <Button size="sm">Save Rule</Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2">AI Source Generator</h3>
                  <AdminSourceGenerator />
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* User & Role Management */}
          <AccordionItem value="users">
            <AccordionTrigger>User & Role Management</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold">Invite User</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button className="sm:w-auto">Invite</Button>
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-4">Users</h3>
                  {loadingUsers ? (
                    <p>Loading users...</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              {u.created_at
                                ? new Date(u.created_at).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={u.role || "user"}
                                onValueChange={(v) => updateRole(u.id, v)}
                              >
                                <SelectTrigger className="w-[110px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">user</SelectItem>
                                  <SelectItem value="admin">admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      Disable
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Disable this user
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Learning Data Oversight */}
          <AccordionItem value="learning">
            <AccordionTrigger>Learning Data Oversight</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <h3 className="font-semibold">Reflections</h3>
                {reflections.slice(0, 5).map((r) => (
                  <Card key={r.id} className="p-4 flex justify-between items-start">
                    <p className="pr-4 flex-1">{r.note}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Approve
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" variant="destructive">
                              Delete
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete reflection</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button size="sm" variant="secondary">
                        Flag
                      </Button>
                    </div>
                  </Card>
                ))}

                <h3 className="font-semibold mt-6">Sessions</h3>
                {sessions.slice(0, 5).map((s) => (
                  <Card key={s.id} className="p-4 flex justify-between items-center">
                    <p className="pr-4 flex-1">{s.topic_selected}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Remove
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remove session</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Analytics Dashboard */}
          <AccordionItem value="analytics">
            <AccordionTrigger>Analytics Dashboard</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h3 className="font-semibold">Active Users</h3>
                  <p className="text-3xl">123</p>
                  <p className="text-sm text-muted-foreground">
                    Daily active users
                  </p>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold">Avg. Session Duration</h3>
                  <p className="text-3xl">15m</p>
                  <p className="text-sm text-muted-foreground">
                    Last 7 days
                  </p>
                </Card>
                <Card className="p-4 md:col-span-2">
                  <h3 className="font-semibold mb-2">Export Analytics</h3>
                  <div className="flex gap-2">
                    <Button variant="outline">CSV</Button>
                    <Button variant="outline">JSON</Button>
                  </div>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Integration & Automation */}
          <AccordionItem value="integration">
            <AccordionTrigger>Integration & Automation</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Gemini Prompt Template</Label>
                  <Textarea placeholder="Prompt template" />
                </div>
                <div className="space-y-2">
                  <Label>Make.com Webhook URL</Label>
                  <Input placeholder="https://" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="calendar" />
                  <Label htmlFor="calendar">Google Calendar Integration</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="rls" />
                  <Label htmlFor="rls">Enable Supabase RLS</Label>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* UI/UX Toggles */}
          <AccordionItem value="ui">
            <AccordionTrigger>UI/UX Toggles</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="darkmode" />
                  <Label htmlFor="darkmode">Default Dark Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="confetti" />
                  <Label htmlFor="confetti">Confetti Animation</Label>
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="he">Hebrew</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Unit Tests & Stats */}
          <AccordionItem value="tests-stats">
            <AccordionTrigger>Unit Tests & Stats</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Test Runner</h3>
                  <AdminTestRunner />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
                  <AdminStatsDashboard />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Logs & Maintenance */}
          <AccordionItem value="logs">
            <AccordionTrigger>Logs & Maintenance</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Error Logs</Label>
                  <Textarea readOnly placeholder="No errors" />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Clear Gemini Cache</Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear cached Gemini responses</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Trigger DB Backup</Button>
                    </TooltipTrigger>
                    <TooltipContent>Backup database now</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Security Settings */}
          <AccordionItem value="security">
            <AccordionTrigger>Security Settings</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="twofa" />
                  <Label htmlFor="twofa">Require 2FA for Admins</Label>
                </div>
                <div className="space-y-2">
                  <Label>Audit Log</Label>
                  <Textarea readOnly placeholder="No audit events" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention">Reflection Retention (months)</Label>
                  <Input id="retention" type="number" min={1} defaultValue={6} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </AdminRoute>
  );
};

export default AdminDashboard;
