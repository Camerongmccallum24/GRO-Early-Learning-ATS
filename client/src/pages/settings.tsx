import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  
  const [emailSettings, setEmailSettings] = useState({
    newApplications: true,
    candidateUpdates: true,
    jobPostingUpdates: true,
    dailyDigest: false
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
  };

  const handlePasswordUpdate = () => {
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="First name"
                    defaultValue={user?.firstName || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Last name"
                    defaultValue={user?.lastName || ''}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Email address"
                  defaultValue={user?.email || ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" placeholder="Job title" defaultValue={user?.role === 'hr_admin' ? 'HR Manager' : user?.role || ''} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="About yourself" className="min-h-[100px]" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure which email notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="newApplications">New Applications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications when new candidates apply</p>
                </div>
                <Switch 
                  id="newApplications" 
                  checked={emailSettings.newApplications}
                  onCheckedChange={(checked) => setEmailSettings(prev => ({...prev, newApplications: checked}))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="candidateUpdates">Candidate Updates</Label>
                  <p className="text-sm text-muted-foreground">Notifications about status changes for candidates</p>
                </div>
                <Switch 
                  id="candidateUpdates" 
                  checked={emailSettings.candidateUpdates}
                  onCheckedChange={(checked) => setEmailSettings(prev => ({...prev, candidateUpdates: checked}))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="jobPostingUpdates">Job Posting Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified about job posting changes and expirations</p>
                </div>
                <Switch 
                  id="jobPostingUpdates" 
                  checked={emailSettings.jobPostingUpdates}
                  onCheckedChange={(checked) => setEmailSettings(prev => ({...prev, jobPostingUpdates: checked}))}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dailyDigest">Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of all activity</p>
                </div>
                <Switch 
                  id="dailyDigest" 
                  checked={emailSettings.dailyDigest}
                  onCheckedChange={(checked) => setEmailSettings(prev => ({...prev, dailyDigest: checked}))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handlePasswordUpdate}>Update Password</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Login Sessions</CardTitle>
              <CardDescription>Manage your active sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">Brisbane, Australia • Chrome • {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">Active</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Sign Out All Devices</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.
              </p>
              <Button variant="outline">Set Up Two-Factor Authentication</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}