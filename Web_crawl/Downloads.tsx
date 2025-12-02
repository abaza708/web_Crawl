import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Globe, Loader2, Download, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Downloads() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [domain, setDomain] = useState("");

  const { data: jobs, isLoading: jobsLoading, refetch } = trpc.downloads.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 3000, // Poll every 3 seconds for updates
  });

  const createMutation = trpc.downloads.create.useMutation({
    onSuccess: (data) => {
      toast.success("Download job started!");
      setDomain("");
      refetch();
      setLocation(`/downloads/${data.jobId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start download");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }
    createMutation.mutate({ domain: domain.trim() });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to access the download feature</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full">Sign In</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      pending: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Globe className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Website Downloader</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container max-w-5xl">
          {/* New Download Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Start New Download</CardTitle>
              <CardDescription>Enter a website domain to download all its files</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="domain" className="sr-only">
                    Domain
                  </Label>
                  <Input
                    id="domain"
                    placeholder="example.com or https://example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    disabled={createMutation.isPending}
                  />
                </div>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Download Jobs List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Downloads</h2>
            {jobsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !jobs || jobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No downloads yet. Start by entering a domain above.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link key={job.id} href={`/downloads/${job.id}`}>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="mt-1">{getStatusIcon(job.status)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{job.domain}</h3>
                                {getStatusBadge(job.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {job.status === "processing" || job.status === "completed" ? (
                                  <span>
                                    {job.downloadedFiles} / {job.totalFiles} files downloaded
                                  </span>
                                ) : job.status === "failed" ? (
                                  <span className="text-red-600">{job.errorMessage || "Download failed"}</span>
                                ) : (
                                  <span>Waiting to start...</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Created {new Date(job.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
