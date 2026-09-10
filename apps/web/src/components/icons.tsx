import type { SVGProps } from "react";

/**
 * Small inline icon set so the app doesn't need an icon-font dependency.
 * All icons inherit color via `currentColor` and size via className.
 */

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
    </svg>
  );
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.2 14.6A8.4 8.4 0 1 1 9.4 3.8a6.8 6.8 0 0 0 10.8 10.8Z" />
    </svg>
  );
}

export function UploadCloudIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7.5 18.5a4.5 4.5 0 0 1-.9-8.91 5.5 5.5 0 0 1 10.62-2A4.75 4.75 0 0 1 17 18.5" />
      <path d="M12 21v-8M9 15.5 12 12.5l3 3" />
    </svg>
  );
}

export function FileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2.75h8l4 4V21a.25.25 0 0 1-.25.25H6.25A.25.25 0 0 1 6 21V2.75Z" />
      <path d="M14 2.75V7h4.25" />
    </svg>
  );
}

export function ImageFileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2.75h8l4 4V21a.25.25 0 0 1-.25.25H6.25A.25.25 0 0 1 6 21V2.75Z" />
      <path d="M14 2.75V7h4.25" />
      <circle cx="10.5" cy="13" r="1.15" />
      <path d="m8.5 18.5 2.6-3 2.2 2 1.6-2.1 2.1 3.1" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.2 12.4 2.4 2.4 5.2-5.6" />
    </svg>
  );
}

export function AlertTriangleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.9 3.7 2.6 18.2a1 1 0 0 0 .87 1.5h17.06a1 1 0 0 0 .87-1.5L13.1 3.7a1 1 0 0 0-1.74 0Z" />
      <path d="M12 9.5v4.2M12 16.7v.05" />
    </svg>
  );
}

export function AlertCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.8v4.6M12 15.9v.05" />
    </svg>
  );
}

export function InfoCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.2M12 7.9v.05" />
    </svg>
  );
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3.5v11M8 11l4 4 4-4" />
      <path d="M4.75 16.5v2.25c0 .69.56 1.25 1.25 1.25h12c.69 0 1.25-.56 1.25-1.25V16.5" />
    </svg>
  );
}

export function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 6h-3a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 6 19h10a1.5 1.5 0 0 0 1.5-1.5v-3" />
      <path d="M14 4.5h5v5M18.5 5 11 12.5" />
    </svg>
  );
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.4 2.5 3.7 5.6 3.7 9s-1.3 6.5-3.7 9c-2.4-2.5-3.7-5.6-3.7-9S9.6 5.5 12 3Z" />
    </svg>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3.2 19.5 6v6c0 4.7-3.2 7.6-7.5 8.8C7.7 19.6 4.5 16.7 4.5 12V6L12 3.2Z" />
      <path d="m8.7 12.3 2.3 2.3 4.3-4.6" />
    </svg>
  );
}

export function BoltIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.5 3 5 13.2h5.2L10.8 21 19 10.4h-5.4L12.5 3Z" />
    </svg>
  );
}

export function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3.5c.5 2.9 1.4 4.8 2.7 6.1 1.3 1.3 3.2 2.2 6.1 2.7-2.9.5-4.8 1.4-6.1 2.7-1.3 1.3-2.2 3.2-2.7 6.1-.5-2.9-1.4-4.8-2.7-6.1C7.9 13.7 6 12.8 3.1 12.3c2.9-.5 4.8-1.4 6.1-2.7 1.3-1.3 2.2-3.2 2.7-6.1Z" />
    </svg>
  );
}
