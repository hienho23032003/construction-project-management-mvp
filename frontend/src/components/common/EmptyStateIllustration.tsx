import React from 'react';
import { Box } from '@mui/material';

interface EmptyStateIllustrationProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const EmptyStateIllustration: React.FC<EmptyStateIllustrationProps> = ({
  width = 154,
  height = 121,
}) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 154 121"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      >
        <circle cx="77" cy="52" r="52" fill="#F1F5F9" />
        <g filter="url(#filter0_ddd_1214_89577)">
          <path
            d="M78.6 16C67.8273 16 58.2978 21.3233 52.4987 29.4829C50.605 29.0363 48.6301 28.8 46.6 28.8C32.4615 28.8 21 40.2615 21 54.4C21 68.5385 32.4615 80 46.6 80L110.6 80C122.971 80 133 69.9712 133 57.6C133 45.2288 122.971 35.2 110.6 35.2C109.721 35.2 108.854 35.2506 108.002 35.349C103.098 23.9677 91.7797 16 78.6 16Z"
            fill="#FFFFFF"
          />
          <path
            d="M78.5996 15.5C91.8552 15.5 103.255 23.4366 108.312 34.8145C109.064 34.7397 109.827 34.7002 110.6 34.7002C123.247 34.7002 133.5 44.9525 133.5 57.5996C133.5 70.0492 123.565 80.1785 111.191 80.4922L110.6 80.5H46.5996C32.1853 80.4998 20.5002 68.8147 20.5 54.4004C20.5 39.9859 32.1852 28.3 46.5996 28.2998C48.5525 28.2998 50.4558 28.5168 52.2871 28.9238C58.1932 20.7911 67.7778 15.5001 78.5996 15.5Z"
            stroke="#CBD5E1"
            strokeOpacity="0.6"
          />
          <ellipse cx="46.6" cy="54.3998" rx="25.6" ry="25.6" fill="url(#paint0_linear_1214_89577)" />
          <circle cx="78.5996" cy="48" r="32" fill="url(#paint1_linear_1214_89577)" />
          <ellipse cx="110.6" cy="57.6002" rx="22.4" ry="22.4" fill="url(#paint2_linear_1214_89577)" />
        </g>
        <circle cx="22" cy="19" r="5" fill="#E2E8F0" />
        <circle cx="19" cy="109" r="7" fill="#E2E8F0" />
        <circle cx="146" cy="35" r="7" fill="#E2E8F0" />
        <circle cx="135" cy="8" r="4" fill="#E2E8F0" />
        
        {/* Search circle glass badge */}
        <g>
          <path
            d="M53 86C53 72.7452 63.7452 62 77 62C90.2548 62 101 72.7452 101 86C101 99.2548 90.2548 110 77 110C63.7452 110 53 99.2548 53 86Z"
            fill="#0f172a"
            fillOpacity="0.75"
          />
          <path
            d="M86 95L82.5001 91.5M85 85.5C85 90.1944 81.1944 94 76.5 94C71.8056 94 68 90.1944 68 85.5C68 80.8056 71.8056 77 76.5 77C81.1944 77 85 80.8056 85 85.5Z"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <defs>
          <filter
            id="filter0_ddd_1214_89577"
            x="0"
            y="15"
            width="154"
            height="106"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="1.5" operator="erode" in="SourceAlpha" result="effect1_dropShadow_1214_89577" />
            <feOffset dy="3" />
            <feGaussianBlur stdDeviation="1.5" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0496732 0 0 0 0 0.0705882 0 0 0 0.04 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1214_89577" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect2_dropShadow_1214_89577" />
            <feOffset dy="8" />
            <feGaussianBlur stdDeviation="4" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0496732 0 0 0 0 0.0705882 0 0 0 0.03 0" />
            <feBlend mode="normal" in2="effect1_dropShadow_1214_89577" result="effect2_dropShadow_1214_89577" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect3_dropShadow_1214_89577" />
            <feOffset dy="20" />
            <feGaussianBlur stdDeviation="12" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.0392157 0 0 0 0 0.0496732 0 0 0 0 0.0705882 0 0 0 0.08 0" />
            <feBlend mode="normal" in2="effect2_dropShadow_1214_89577" result="effect3_dropShadow_1214_89577" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_1214_89577" result="shape" />
          </filter>
          <linearGradient id="paint0_linear_1214_89577" x1="26.9429" y1="37.4855" x2="72.2" y2="79.9998" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E2E8F0" />
            <stop offset="0.350715" stopColor="#F8FAFC" />
          </linearGradient>
          <linearGradient id="paint1_linear_1214_89577" x1="54.0282" y1="26.8571" x2="110.6" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E2E8F0" />
            <stop offset="0.350715" stopColor="#F8FAFC" />
          </linearGradient>
          <linearGradient id="paint2_linear_1214_89577" x1="93.4002" y1="42.8002" x2="133" y2="80.0002" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E2E8F0" />
            <stop offset="0.350715" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
};
