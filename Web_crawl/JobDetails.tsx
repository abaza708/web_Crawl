import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Globe,
  Loader2,
  ArrowLeft,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Archive,
} from "lucide-react";
import { Link, useParams, useLocation } from "wouter";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const jobId = parseInt(id || "0", 10);

  const { data: job, isLoading: jobLoading } = trpc.downloads.getJob.useQuery(
    { jobId },
    {
      enabled: isAuthenticated && jobId > 0,
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return status === "processing" || status === "pending" ? 2000 : false;
      },
    }
  );

  const { data: files, isLoading: filesLoading } = trpc.downloads.getFiles.useQuery(
    { jobId },
    {
      enabled: isAuthenticated && jobId > 0 && (job?.status === "completed" || job?.status === "processing"),
      refetchInterval: (query) => {
        return job?.status === "processing" ? 2000 : false;
      },
    }
  );

  if (authLoading || jobLoading) {
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
            <CardDescription>Please sign in to access this page</CardDescription>
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

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Job Not Found</CardTitle>
            <CardDescription>The download job you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/downloads")} className="w-full">
              Back to Downloads
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-600" />;
      case "processing":
        return <Loader2 className="h-6 w-6 animate-spin text-blue-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
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

  const progress = job.totalFiles > 0 ? (job.downloadedFiles / job.totalFiles) * 100 : 0;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-4 w-4" />;
    if (fileType.startsWith("image/")) return <FileText className="h-4 w-4 text-blue-600" />;
    if (fileType.includes("javascript")) return <FileText className="h-4 w-4 text-yellow-600" />;
    if (fileType.includes("css")) return <FileText className="h-4 w-4 text-purple-600" />;
    if (fileType.includes("html")) return <FileText className="h-4 w-4 text-orange-600" />;
    return <FileText className="h-4 w-4" />;
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
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container max-w-5xl">
          {/* Back Button */}
          <Link href="/downloads">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Downloads
            </Button>
          </Link>

          {/* Job Status Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getStatusIcon(job.status)}
                  <div>
                    <CardTitle className="mb-2">{job.domain}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(job.status)}
                      <span className="text-sm text-muted-foreground">
                        Created {new Date(job.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {job.status === "completed" && job.downloadedFiles > 0 && (
                  <a href={`/api/download/${job.id}/zip`} download>
                    <Button>
                      <Archive className="mr-2 h-4 w-4" />
                      Download All as ZIP
                    </Button>
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {job.status === "processing" || job.status === "completed" ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {job.downloadedFiles} / {job.totalFiles} files
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ) : job.status === "failed" ? (
                <div className="text-sm text-red-600">
                  <p className="font-medium mb-1">Error:</p>
                  <p>{job.errorMessage || "Download failed due to an unknown error"}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Waiting to start...</p>
              )}
            </CardContent>
          </Card>

          {/* Downloaded Files */}
          {(job.status === "completed" || job.status === "processing") && (
            <Card>
              <CardHeader>
                <CardTitle>Downloaded Files</CardTitle>
                <CardDescription>
                  {files?.length || 0} file{files?.length !== 1 ? "s" : ""} downloaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !files || files.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {job.status === "processing" ? "Files are being downloaded..." : "No files downloaded yet"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(file.fileType || undefined)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.url}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{file.fileType || "Unknown type"}</span>
                              <span>•</span>
                              <span>{formatFileSize(file.fileSize || undefined)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          <a href={file.s3Url} download>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
