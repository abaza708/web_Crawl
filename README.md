# Website Downloader Bot

A powerful web application that crawls and downloads all publicly accessible files from any website. Extract HTML, CSS, JavaScript, images, and other frontend assets with a single click.

## Features

### Core Functionality
- **Website Crawling**: Intelligently crawls websites to discover and download all publicly accessible files
- **Depth Control**: Set crawl depth (0-5 levels) to control how deep the crawler goes, preventing accidental downloads of entire large websites
- **File Organization**: Automatically organizes downloaded files with proper naming and structure
- **ZIP Download**: Package all files from a completed job into a single compressed archive for easy distribution
- **Real-time Progress**: Monitor download progress with live status updates showing file count and completion percentage

### User Management
- **Secure Authentication**: Manus OAuth integration for secure user authentication
- **User-Specific Downloads**: Each user can only access their own download jobs and files
- **Download History**: View all past downloads with status, timestamps, and settings

### Storage & Delivery
- **Cloud Storage**: All files are stored securely in S3 cloud storage
- **Direct Download Links**: Individual files can be downloaded directly from cloud storage
- **Batch Download**: Download all files as a ZIP archive with a single click

## Getting Started

### Prerequisites
- Node.js 22.13.0 or higher
- pnpm package manager
- MySQL/TiDB database
- Manus OAuth credentials (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd website-downloader-bot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   The application uses Manus-managed environment variables. Key variables include:
   - `DATABASE_URL`: MySQL/TiDB connection string
   - `JWT_SECRET`: Session cookie signing secret
   - `VITE_APP_ID`: Manus OAuth application ID
   - `OAUTH_SERVER_URL`: Manus OAuth backend URL

4. **Initialize the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Usage

### Creating a Download Job

1. Navigate to the **My Downloads** page
2. Enter the website domain (e.g., `example.com` or `https://example.com`)
3. Select the crawl depth:
   - **Homepage only** (0): Download only the main page
   - **1-5 levels deep**: Control how many page levels to crawl
4. Click **Download** to start the crawl

### Monitoring Progress

- The downloads list shows real-time status updates
- Click on a job to view detailed progress and downloaded files
- Progress bar shows the number of files downloaded vs. total discovered

### Downloading Files

**Individual Files:**
- Click the download icon next to any file in the job details
- Or click the external link icon to view the file directly

**All Files as ZIP:**
- Once a job is completed, click the **Download All as ZIP** button
- This packages all files into a single compressed archive

## Project Structure

```
website-downloader-bot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Home, Downloads, JobDetails)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client and utilities
│   │   └── App.tsx        # Main app router
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── crawler.ts         # Website crawling logic
│   ├── zipGenerator.ts    # ZIP archive generation
│   ├── downloadRoutes.ts  # Custom download endpoints
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   └── _core/             # Core server infrastructure
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Table definitions
├── storage/               # S3 storage helpers
└── shared/                # Shared constants and types
```

## Database Schema

### download_jobs
Tracks website download requests:
- `id`: Unique job identifier
- `userId`: Owner of the job
- `domain`: Website domain being downloaded
- `maxDepth`: Maximum crawl depth (0-5)
- `status`: Job status (pending, processing, completed, failed)
- `totalFiles`: Total files discovered
- `downloadedFiles`: Files successfully downloaded
- `errorMessage`: Error details if job failed
- `createdAt`, `updatedAt`: Timestamps

### downloaded_files
Stores metadata for each downloaded file:
- `id`: Unique file identifier
- `jobId`: Associated download job
- `url`: Original file URL
- `fileKey`: S3 storage key
- `s3Url`: Signed S3 download URL
- `fileType`: MIME type
- `fileSize`: File size in bytes
- `createdAt`: Download timestamp

### users
Core user table (managed by authentication system):
- `id`: User identifier
- `openId`: Manus OAuth identifier
- `name`: User's display name
- `email`: User's email address
- `role`: User role (user, admin)
- `createdAt`, `updatedAt`, `lastSignedIn`: Timestamps

## API Endpoints

### tRPC Procedures

**downloads.create**
- **Type**: Mutation
- **Input**: `{ domain: string, maxDepth?: number }`
- **Output**: `{ jobId: number }`
- **Description**: Create a new download job

**downloads.list**
- **Type**: Query
- **Output**: `DownloadJob[]`
- **Description**: Get all download jobs for current user

**downloads.getJob**
- **Type**: Query
- **Input**: `{ jobId: number }`
- **Output**: `DownloadJob`
- **Description**: Get details of a specific job

**downloads.getFiles**
- **Type**: Query
- **Input**: `{ jobId: number }`
- **Output**: `DownloadedFile[]`
- **Description**: Get all files from a job

### REST Endpoints

**GET /api/download/:jobId/zip**
- **Description**: Download all files from a job as ZIP
- **Authentication**: Required (session cookie)
- **Response**: ZIP file stream

## Development

### Running Tests

```bash
pnpm test
```

Tests are written using Vitest and cover:
- Download job creation and management
- File download operations
- ZIP generation functionality
- Depth control validation
- Authentication and authorization

### Building for Production

```bash
pnpm build
```

This creates optimized production builds for both frontend and backend.

### Database Migrations

After updating the schema in `drizzle/schema.ts`:

```bash
pnpm db:push
```

This generates and applies database migrations automatically.

## Architecture

### Frontend (React 19 + Tailwind CSS 4)
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Query (via tRPC)
- **UI Components**: shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing

### Backend (Express + tRPC)
- **Framework**: Express.js with TypeScript
- **API**: tRPC for type-safe API communication
- **Database**: Drizzle ORM with MySQL/TiDB
- **Authentication**: Manus OAuth integration
- **File Storage**: AWS S3 via preconfigured helpers

### Crawler
- **HTTP Client**: Axios for fetching web pages
- **HTML Parsing**: Cheerio for DOM manipulation
- **Depth Tracking**: Maintains URL depth during traversal
- **Domain Filtering**: Only crawls same domain to prevent scope creep

## Security Considerations

- **Authentication**: All protected endpoints require Manus OAuth authentication
- **Authorization**: Users can only access their own download jobs and files
- **File Validation**: Files are validated before storage
- **URL Validation**: Only same-domain URLs are crawled
- **Rate Limiting**: Crawler respects timeouts and request limits
- **Storage Security**: Files are stored in private S3 buckets with signed URLs

## Performance

- **Parallel Downloads**: Multiple files are downloaded concurrently
- **Compression**: ZIP archives use maximum compression (level 9)
- **Caching**: Browser caches static assets aggressively
- **Database Indexing**: Optimized queries with proper indexing
- **Streaming**: Large files are streamed to prevent memory issues

## Troubleshooting

### Download Job Stuck in "Processing"
- Check server logs for errors
- Verify the website is accessible and not blocking the crawler
- Try with a smaller crawl depth

### Files Not Downloading
- Ensure the website is publicly accessible
- Check that files are not behind authentication
- Verify S3 storage has available space

### ZIP Download Fails
- Ensure the job has completed successfully
- Verify at least one file was downloaded
- Check browser console for network errors

## Future Enhancements

- File type filtering (images, CSS, JS, fonts, etc.)
- Download pause/resume functionality
- Duplicate URL detection across jobs
- Scheduled recurring downloads
- Download statistics dashboard
- Custom naming patterns for downloaded files
- Selective file download (checkbox filtering)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch from `main`
2. Make your changes and add tests
3. Ensure all tests pass: `pnpm test`
4. Submit a pull request with a clear description

## License

MIT License - See LICENSE file for details

## Support

For issues, feature requests, or questions:
- Check existing issues on GitHub
- Create a new issue with detailed description
- Contact the development team

## Changelog

### Version 1.2.0 (Current)
- Added crawl depth control (0-5 levels)
- Added ZIP download feature for batch file downloads
- Improved UI with depth selector and progress tracking

### Version 1.1.0
- Added "Download All as ZIP" functionality
- Implemented file organization and naming
- Enhanced progress tracking

### Version 1.0.0
- Initial release
- Core website crawling functionality
- User authentication and authorization
- Individual file downloads
