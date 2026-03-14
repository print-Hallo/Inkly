All routes must follow the Next.js App Router convention. Folders define the route, and page.js renders the UI.
Structure:
\app
   └── \page_name
       └── page.js (or .jsx)
\public
   └── (All images, videos, audio, and static assets)

Framework: Tailwind CSS only. Use utility classes for all styling.
Path Aliasing: Use Global App Routing (e.g., @/components/... or @/lib/...) to avoid relative path nesting.

Every file must contain a concise header explaining the code logic. Use the following format:
Purpose: What the file does.
Features: Key functionalities or logic.
Params: Description of function parameters or props.
EG:
/**
 * @purpose: Renders the primary Dashboard UI.
 * @features: Responsive grid, dynamic data fetching, and user auth check.
 * @params: {Object} params - The route parameters from the URL.
 */

export default function Page({ params }) {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      {/*code*/}
    </main>
  );
}

