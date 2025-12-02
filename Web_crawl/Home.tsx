import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Download, Globe, FileArchive, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Website Downloader</span>
          </div>
          <nav className="flex items-center gap-4">
            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-muted rounded" />
            ) : isAuthenticated ? (
              <Link href="/downloads">
                <Button>My Downloads</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Sign In</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                Download Any Website's Files in Seconds
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Extract all frontend assets from any website—HTML, CSS, JavaScript, images, and more. 
                Perfect for web developers, designers, and researchers.
              </p>
              {isAuthenticated ? (
                <Link href="/downloads">
                  <Button size="lg" className="text-lg px-8">
                    <Download className="mr-2 h-5 w-5" />
                    Start Downloading
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="text-lg px-8">
                    Get Started Free
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-background p-6 rounded-lg border">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Enter Domain</h3>
                <p className="text-muted-foreground">
                  Simply paste the website URL you want to download. Our bot will handle the rest.
                </p>
              </div>

              <div className="bg-background p-6 rounded-lg border">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Automatic Crawling</h3>
                <p className="text-muted-foreground">
                  Our intelligent crawler extracts all files, following links and discovering resources.
                </p>
              </div>

              <div className="bg-background p-6 rounded-lg border">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileArchive className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Download Files</h3>
                <p className="text-muted-foreground">
                  Access all downloaded files organized and ready to use. Download individually or in bulk.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join developers and designers who trust our tool for website analysis and asset extraction.
              </p>
              {isAuthenticated ? (
                <Link href="/downloads">
                  <Button size="lg">
                    Go to Downloads
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg">
                    Sign Up Now
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 Website Downloader Bot. Built with Manus.</p>
        </div>
      </footer>
    </div>
  );
}
