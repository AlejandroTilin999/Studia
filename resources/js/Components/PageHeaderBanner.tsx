import * as React from "react";

interface PageHeaderBannerProps {
  title: string;
  subtitle: string;
  breadcrumb: string;
}

export default function PageHeaderBanner({ title, subtitle, breadcrumb }: PageHeaderBannerProps) {
  return (
    <div className="bg-[#1e88e5] p-6 md:p-10 text-white shrink-0 text-left select-none shadow-none">
      <div className="max-w-5xl">
        <p className="text-xs md:text-sm font-medium opacity-90 mb-0.5 uppercase tracking-wider">
          {breadcrumb}
        </p>
        <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-2">
          {title}
        </h2>
        <p className="text-lg md:text-xl font-bold opacity-80">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
